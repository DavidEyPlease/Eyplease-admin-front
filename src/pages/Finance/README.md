# Módulo de Finanzas y Cobranza

Panel para administrar pagos, cobranza y salud financiera de Eyplease+.
Ruta: `/finanzas` · Item de sidebar: `PermissionKeys.FINANCES`.

> **Decisión de arquitectura:** se aloja DENTRO del admin como módulo con permiso de Finanzas
> (no como app separada). Para producción necesita backend → ver **[API_CONTRACT.md](./API_CONTRACT.md)**
> con la especificación de endpoints/modelos para el equipo de backend.

## Estado actual (v1)

La API de Eyplease **todavía no expone pagos** (`pending_payment` está hardcodeado en `0`).
Por eso este módulo usa una **base de datos editable local** sembrada desde
`Finanzas - 2026.xlsx`:

- `src/data/finanzas-seed.ts` — datos iniciales (155 clientes + resumen mensual). Generado del Excel, **sin contraseñas**.
- `src/store/finanzas.ts` — store Zustand persistido en `localStorage` (`EyFinanzasDB_v1`).
  Las ediciones del usuario (estatus de pago, recordatorios) viven aquí.
- `src/utils/finanzas.ts` — KPIs, lógica de cobranza, generador de mensajes de recordatorio.
- `components/SummaryTab.tsx` — KPIs + gráficas (ingreso vs gasto, churn/retraso, desglose de gastos).
- `components/CollectionsTab.tsx` — clientes en retraso + recordatorios.
- `components/CarteraTab.tsx` — listado completo + cruce con la API por `consultant_code`.

## Cómo conectarlo a la API real (Alejandro)

Cuando existan los endpoints de cobranza en el backend (modelos `Payment` / `Invoice` /
`Subscription`), la migración es de un solo punto:

1. Crear `src/services/finanzas.service.ts` que consulte los nuevos endpoints y devuelva
   `FinanceClient[]` + `MonthlySummary[]` (ver tipos en `src/interfaces/finanzas.ts`).
2. En `pages/Finanzas/index.tsx`, tras cargar la data de la API, llamar:
   ```ts
   useFinanceStore.getState().hydrate(clients, summary)
   ```
3. Cambiar las acciones de edición (`updatePayment`, `markReminderSent`) para que hagan
   `PATCH`/`POST` al backend además de actualizar el store local.
4. El botón **"Cruzar con la API"** (`CarteraTab`) ya consume `GET /clients?perPage=500`
   y cruza por `account`/`consultant_code`; sirve de referencia del patrón de fetch.

> El seed local seguirá funcionando como fallback offline. Para forzar re-siembra al
> publicar un Excel nuevo, sube `SEED_VERSION` en `store/finanzas.ts`.
