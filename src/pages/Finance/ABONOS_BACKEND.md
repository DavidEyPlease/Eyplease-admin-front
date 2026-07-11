# Pagos parciales / abonos — cambios de backend

> Para: Alejandro. La UI ya quedó lista en este PR (Cobranza + modal de gestión de pago).
> Falta el soporte de backend para que funcione limpiamente. Modelo recomendado: **ledger de abonos**.

## Idea
Un cliente puede pagar un mes en varios abonos ("te doy X hoy y el resto la próxima").
Cada abono es un registro en el ledger de pagos que ya existe (`GET /finance/payments`).
Por periodo se calcula: **esperado**, **abonado (suma de abonos)**, **restante** y un estatus nuevo **`partial`**.

## 1. Estatus nuevo: `partial`
`PaymentStatus` = `paid | partial | overdue | pending`.
- `paid`: abonado ≥ esperado
- `partial`: 0 < abonado < esperado
- `overdue` / `pending`: abonado = 0

## 2. `GET /finance/clients` y `GET /finance/clients/{account}`
En cada periodo del objeto `payments`, además de `amount` y `status`, devolver **`paid`** (abonado acumulado del periodo):
```json
"payments": {
  "2026-05": { "amount": 449, "paid": 200, "status": "partial" },
  "2026-04": { "amount": 449, "paid": 449, "status": "paid" },
  "2026-03": { "amount": 449, "paid": 0,   "status": "overdue" }
}
```
- `amount` = monto esperado del periodo (cuota / precio del paquete, ya con promo si aplica).
- `paid` = suma de abonos registrados para ese periodo.
- El frontend calcula `restante = amount - paid`.

## 3. `POST /finance/payments` (registrar abono)
Aceptar un pago/abono por un `amount` y **acumularlo** (no reemplazar):
```json
{ "account": "CB5075", "period": "2026-05", "amount": 200, "method": "transfer", "source": "manual" }
```
Comportamiento:
- Registra el pago en el ledger (permite **varios registros por (cliente, periodo)**).
- Recalcula `paid = SUM(pagos del periodo)` y setea `status` = paid / partial / overdue según lo de arriba.
- **`status` ahora es opcional** en el body: si viene `amount` sin `status`, el backend deriva el estatus. Si viene `status` explícito (p. ej. marcar `paid` u `overdue` a mano), respétalo como override.

## 4. Notas
- La UI ya usa todo esto: en Cobranza el "Total retrasado" usa el **restante**, hay chip **Parcial**, y en el modal de gestión de pago se puede **"Abonar"** un monto o **"Pagado"** el mes completo.
- El bot de WhatsApp puede registrar abonos con el mismo endpoint (`source: "whatsapp_bot"`), útil cuando la clienta manda comprobante de un pago parcial.
- Sin estos cambios, la UI de abonos se ve pero no persiste correctamente el acumulado (mostraría el último monto, no la suma).
