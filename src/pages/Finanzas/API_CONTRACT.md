# Contrato de API — Módulo de Finanzas y Cobranza

> Para: Alejandro (backend Laravel 11 · `api.eyplease.com.mx`)
> De: panel de Finanzas del admin (`Eyplease-admin-front-main`, ruta `/finanzas`)
> Objetivo: dar persistencia real al panel (hoy vive en `localStorage`) y permitir que el
> **bot de WhatsApp** escriba pagos y activaciones. Cuando estos endpoints existan, el panel
> deja de usar el seed del Excel y consume la API vía `useFinanzasStore.hydrate()`.

---

## 1. Resumen de lo que se necesita

Tres dominios nuevos, todos por **periodo** (`YYYY-MM`):

1. **Payments** — estatus de pago de cada cliente, mes a mes (la matriz de cobranza).
2. **Expenses** — gastos operativos editables por mes (lo que hoy edita el panel en "Gastos").
3. **Summary** — agregados mensuales (ingreso, ticket, retraso, clientes) — **calculados**, no almacenados.

Auth: **Sanctum bearer token** (igual que el resto del admin). El bot usa un token de servicio
o secreto de webhook (ver §6). Todas las respuestas siguen el wrapper existente
`{ data, success, message? }`.

Convención: el backend responde en `snake_case`; el panel lo adapta a sus interfaces
(`FinanceClient`, `ExpenseItem`, `MonthlySummary` en `src/interfaces/finanzas.ts`).

---

## 2. Modelos / tablas sugeridas

### `payments`
| campo | tipo | notas |
|---|---|---|
| id | uuid/bigint | |
| client_id | FK clients | el cliente (NetworkPeople/Client) |
| period | string `YYYY-MM` | o `year` + `month` separados |
| amount | decimal(10,2) | monto del mes |
| status | enum | `realizado` · `retraso` · `pendiente` |
| paid_at | datetime null | cuándo se registró el pago |
| method | string null | transferencia, tarjeta, efectivo… |
| source | enum | `manual` · `whatsapp_bot` · `stripe` · `import` |
| receipt_url | string null | comprobante de transferencia (imagen/PDF) |
| note | text null | |
| timestamps | | |

Índice único sugerido: `(client_id, period)` → un registro por cliente-mes (upsert).

### `expenses`
| campo | tipo | notas |
|---|---|---|
| id | uuid/bigint | |
| period | string `YYYY-MM` | |
| name | string | "Servidores", "Adobe", … |
| amount | decimal(10,2) | |
| category | enum null | `tools` · `team` · `other` |
| timestamps | | |

### Campos de finanzas en el cliente
Hoy el panel necesita por cliente: `payment_day` (día del mes en que paga) y `phone`
(para WhatsApp). `phone` ya existe en NetworkPeople; `payment_day` es nuevo (en `clients`
o en una `subscriptions`). `fixed_payment` = precio del plan (ya existe vía Plan).
`balance` se **calcula** (suma de lo no pagado).

---

## 3. Endpoints de lectura (los consume el panel)

### `GET /finance/clients?year=2026`
Lista de clientes con su matriz de pagos del año. Mapea a `FinanceClient[]`.
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "account": "CB5075",
      "name": "Miriam Hernández",
      "plan": "Elite",
      "fixed_payment": 449,
      "app_status": "Activo",
      "payment_day": 5,
      "phone": "5215512345678",
      "balance": 0,
      "payments": {
        "2026-01": { "amount": 449, "status": "realizado", "paid_at": "2026-01-05T12:00:00Z" },
        "2026-05": { "amount": 449, "status": "retraso", "paid_at": null }
      }
    }
  ]
}
```

### `GET /finance/summary?year=2026`
Agregados mensuales calculados. Mapea a `MonthlySummary[]`.
```json
{
  "success": true,
  "data": [
    {
      "period": "2026-05",
      "clients_total": 127,
      "active_clients": 146,
      "avg_ticket": 599.06,
      "income": 52603,
      "overdue_total": 23478,
      "pending_total": 22796
    }
  ]
}
```
- `income` = suma de pagos `realizado` del mes.
- `overdue_total` = suma de montos en `retraso` (acumulado).
- `pending_total` = lo facturado del mes aún no cobrado.

### `GET /finance/expenses?year=2026`
Gastos por periodo. Mapea a `Record<period, ExpenseItem[]>`.
```json
{
  "success": true,
  "data": {
    "2026-05": [
      { "id": "uuid", "name": "Servidores", "amount": 1771.25, "category": "tools" },
      { "id": "uuid", "name": "Diseñadora", "amount": 16100, "category": "team" }
    ]
  }
}
```

---

## 4. Endpoints de escritura — Gastos (los usa el panel)

| método | ruta | body | efecto |
|---|---|---|---|
| `POST` | `/finance/expenses` | `{ period, name, amount, category? }` | crea partida |
| `PATCH` | `/finance/expenses/{id}` | `{ name?, amount?, category? }` | edita |
| `DELETE`| `/finance/expenses/{id}` | — | elimina |

Responden `{ success, data }` con la partida resultante.

---

## 5. Endpoints de escritura — Pagos (los usan el panel Y el bot)

**Upsert por cliente+periodo** (idempotente; el bot puede reintentar sin duplicar):

### `POST /finance/payments`
```json
{
  "account": "CB5075",          // o "client_id"
  "period": "2026-05",
  "status": "realizado",         // realizado | retraso | pendiente
  "amount": 449,                  // opcional; default = fixed_payment
  "paid_at": "2026-05-05T10:30:00Z",
  "method": "stripe",             // stripe | transferencia | tarjeta | efectivo
  "source": "stripe",             // manual | whatsapp_bot | stripe | import
  "note": "Confirmado por bot"    // opcional
}
```
Respuesta: `{ success, data: <payment> }`. Si ya existe `(client, period)`, lo actualiza.

> El panel usa esto para "marcar pagado" manual (`source: "manual"`).
> El bot usa esto para confirmar pagos (`source: "whatsapp_bot"`).
> Stripe lo dispara automáticamente vía webhook (ver §6).

---

## 6. Métodos de cobro: Stripe o Transferencia

A la clienta se le ofrecen **dos opciones** en cada cobro (el panel y el bot las muestran):

- **Tarjeta (Stripe)** → automático: link → paga → se confirma solo.
- **Transferencia** → manual: se le dan los datos bancarios → transfiere → sube comprobante
  (o el bot/admin confirma) → se marca pagado.

### `GET /finance/payment-methods`
Devuelve qué métodos están activos y los datos bancarios para transferencia (configurables).
```json
{
  "success": true,
  "data": {
    "stripe": { "enabled": true },
    "transfer": {
      "enabled": true,
      "bank": "BBVA",
      "beneficiary": "Eyplease+ S.A. de C.V.",
      "clabe": "012180001234567890",
      "account": "1234567890",
      "instructions": "Envía tu comprobante por WhatsApp."
    }
  }
}
```

### 6.A — Tarjeta (Stripe)

```
Cobranza → crear link Stripe → el bot lo envía → la clienta paga
        → webhook de Stripe → upsert payment = realizado (method/source = stripe)
        → el panel se actualiza solo
```

#### Config (env del backend)
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. Moneda `MXN`. Opcional: un Product/Price por
plan en Stripe, o montos dinámicos (recomendado para adeudos variables).

### `POST /finance/payments/checkout`
Crea una **Stripe Checkout Session** (o Payment Link) para un cliente y periodo.
```json
// request
{ "account": "CB5075", "period": "2026-05", "amount": 449, "concept": "Suscripción Mayo 2026" }
// response
{ "success": true, "data": { "checkout_url": "https://checkout.stripe.com/c/pay/...", "session_id": "cs_..." } }
```
- En la sesión, guardar `metadata: { account, period }` para reconciliar después.
- El panel mostrará un botón "Cobrar con Stripe" que llama esto y copia/abre el link;
  el bot puede usar el mismo endpoint para mandar el link por WhatsApp.

### `POST /finance/webhook/stripe`
Endpoint público que recibe los eventos de Stripe (verificar firma con `STRIPE_WEBHOOK_SECRET`).
En `checkout.session.completed` / `payment_intent.succeeded`:
1. Leer `metadata.account` y `metadata.period`.
2. Hacer el upsert de `/finance/payments` con `status: "realizado"`, `method: "stripe"`,
   `source: "stripe"`, `paid_at` = fecha del evento, `amount` = monto cobrado.
3. (Opcional) notificar al bot para confirmarle a la clienta.

### Reconciliar pagos de Stripe ya existentes
Para "los pagos que ya tenemos en Stripe": un comando de backfill que recorra los
`charges`/`payment_intents` históricos y los empate con clientes por `metadata`, email o
teléfono, creando los `payments` correspondientes. Conviene definir cómo identificar a la
clienta en esos cargos viejos (¿email?, ¿referencia?) — si no traen metadata, será match
manual asistido.

### 6.B — Transferencia

No requiere Stripe. El flujo:
1. El panel/bot muestra los datos bancarios (de `GET /finance/payment-methods`).
2. La clienta transfiere y envía su comprobante por WhatsApp.
3. Se confirma de una de dos formas:
   - **Manual**: en el panel, "Registrar transferencia" → `POST /finance/payments` con
     `status: "realizado"`, `method: "transferencia"`, `source: "manual"`,
     `receipt_url` (si se sube el comprobante).
   - **Bot**: cuando la clienta manda el comprobante, el bot lo registra vía webhook
     (`type: "payment_confirmed"`, `method: "transferencia"`, `receipt_url`).

#### (Opcional) subir comprobante
`POST /finance/payments/{id}/receipt` (multipart) → guarda el archivo y setea `receipt_url`.
Reusar el manejo de archivos/S3 que ya existe en el admin.

---

## 7. Integración del bot de WhatsApp

El bot (`whatsapp.eyplease.com.mx`) reporta dos eventos. Opción recomendada: **un webhook
único** autenticado con secreto de servicio (header `X-Eyplease-Signature` o bearer de servicio).

### `POST /finance/webhook/whatsapp`
```json
// Pago confirmado (transferencia con comprobante; o tarjeta lo confirma Stripe directo)
{ "type": "payment_confirmed", "account": "CB5075", "period": "2026-05",
  "amount": 449, "paid_at": "2026-05-05T10:30:00Z", "method": "transferencia",
  "receipt_url": "https://.../comprobante.jpg" }

// Activación de nuevo usuario
{ "type": "user_activated", "account": "NUEVO123", "name": "...", "plan": "Básico",
  "phone": "521...", "activated_at": "2026-06-01T09:00:00Z" }
```
- `payment_confirmed` → hace el upsert de `/finance/payments`.
- `user_activated` → crea/activa el cliente (reusar el alta de clientes existente) y deja su
  primer periodo en `pendiente`.

Si Alejandro prefiere, en vez del webhook el bot puede llamar directamente a
`POST /finance/payments` y al alta de clientes existente. El webhook solo centraliza y
desacopla.

---

## 8. Permisos

El panel ya está detrás del permiso `finances` (`PermissionKeys.FINANCES`). Conviene una
ability equivalente en el backend (`finance.view`, `finance.manage`) para los endpoints,
y el token de servicio del bot con scope acotado a escritura de pagos/activaciones.

---

## 9. Cómo se conecta el panel (lado frontend, lo hago yo)

1. Crear `src/services/finanzas.service.ts` con `getClients(year)`, `getSummary(year)`,
   `getExpenses(year)`, `createExpense`, `updateExpense`, `deleteExpense`, `markPayment`,
   `getPaymentMethods()`, `createStripeCheckout(account, period, amount)` → `checkout_url`.
   En el modal de gestión de pago se ofrecen las dos vías: **"Cobrar con Stripe"** (link) y
   **"Registrar transferencia"** (con datos bancarios + subir comprobante opcional).
2. Adaptar `snake_case → camelCase` a las interfaces actuales.
3. Al cargar `/finanzas`, llamar a la API y `useFinanzasStore.getState().hydrate(clients, summary)`
   + cargar expenses; las acciones de edición pasan a hacer también la llamada HTTP.
4. El seed del Excel queda como fallback offline; el botón "Restaurar" deja de borrar datos del server.

Mientras estos endpoints no existan, el panel sigue funcionando con el seed local + edición
en `localStorage` (modo actual).
