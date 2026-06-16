import { create } from "zustand"
import { persist } from "zustand/middleware"

import seed from "@/data/finanzas-seed"
import { ExpenseItem, FinanceClient, MonthlyPayment, MonthlySummary } from "@/interfaces/finanzas"

const STORAGE_KEY = "EyFinanzasDB_v1"
const SEED_VERSION = 2
const SEED_YEAR = 2026

/** Llave de periodo: "2026-mayo". */
export const periodKey = (year: number, month: string) => `${year}-${month}`

// Partidas de gasto individuales del Excel (excluye agregados "GIF" y "GD").
const EXPENSE_CATS = [
    "Servidores", "ZOOM", "Chat GPT", "Adobe", "Nexrender", "Canva", "Gemini",
    "Diseñadora", "Programador", "Administración",
]

const buildSeedExpenses = (): Record<string, ExpenseItem[]> => {
    const out: Record<string, ExpenseItem[]> = {}
    seed.summary.forEach((s) => {
        const items: ExpenseItem[] = EXPENSE_CATS.map((c) => ({
            id: `${s.month}-${c}`,
            name: c,
            amount: (s[c as keyof MonthlySummary] as number) ?? 0,
        })).filter((i) => i.amount > 0)
        out[periodKey(SEED_YEAR, s.month)] = items
    })
    return out
}

const newId = () => {
    try {
        return crypto.randomUUID()
    } catch {
        return `exp-${Date.now()}-${Math.floor(Math.random() * 1e6)}`
    }
}

type State = {
    seedVersion: number
    clients: FinanceClient[]
    summary: MonthlySummary[]
    months: string[]
    expenses: Record<string, ExpenseItem[]>
    generatedFrom: string
    lastEditedAt: string | null
}

type Actions = {
    hydrate: (clients: FinanceClient[], summary?: MonthlySummary[]) => void
    resetToSeed: () => void
    updateClient: (id: string, patch: Partial<FinanceClient>) => void
    updatePayment: (id: string, month: string, patch: Partial<MonthlyPayment>) => void
    markReminderSent: (id: string, isoDate: string) => void
    addExpense: (key: string, item: { name: string; amount: number }) => void
    removeExpense: (key: string, id: string) => void
    updateExpense: (key: string, id: string, patch: Partial<ExpenseItem>) => void
}

const buildSeedState = (): State => ({
    seedVersion: SEED_VERSION,
    clients: seed.clients,
    summary: seed.summary,
    months: seed.months,
    expenses: buildSeedExpenses(),
    generatedFrom: seed.generatedFrom,
    lastEditedAt: null,
})

const stamp = () => new Date().toISOString()

const useFinanzasStore = create<State & Actions>()(
    persist(
        (set) => ({
            ...buildSeedState(),
            hydrate: (clients, summary) =>
                set((s) => ({ clients, summary: summary ?? s.summary, lastEditedAt: stamp() })),
            resetToSeed: () => set({ ...buildSeedState() }),
            updateClient: (id, patch) =>
                set((s) => ({
                    clients: s.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)),
                    lastEditedAt: stamp(),
                })),
            updatePayment: (id, month, patch) =>
                set((s) => ({
                    clients: s.clients.map((c) =>
                        c.id === id
                            ? { ...c, payments: { ...c.payments, [month]: { ...c.payments[month], ...patch } } }
                            : c
                    ),
                    lastEditedAt: stamp(),
                })),
            markReminderSent: (id, isoDate) =>
                set((s) => ({
                    clients: s.clients.map((c) =>
                        c.id === id ? { ...c, reminderSentAt: isoDate, reminderCount: (c.reminderCount ?? 0) + 1 } : c
                    ),
                    lastEditedAt: stamp(),
                })),
            addExpense: (key, item) =>
                set((s) => ({
                    expenses: { ...s.expenses, [key]: [...(s.expenses[key] ?? []), { id: newId(), ...item }] },
                    lastEditedAt: stamp(),
                })),
            removeExpense: (key, id) =>
                set((s) => ({
                    expenses: { ...s.expenses, [key]: (s.expenses[key] ?? []).filter((e) => e.id !== id) },
                    lastEditedAt: stamp(),
                })),
            updateExpense: (key, id, patch) =>
                set((s) => ({
                    expenses: {
                        ...s.expenses,
                        [key]: (s.expenses[key] ?? []).map((e) => (e.id === id ? { ...e, ...patch } : e)),
                    },
                    lastEditedAt: stamp(),
                })),
        }),
        {
            name: STORAGE_KEY,
            migrate: (persisted: unknown) => {
                const p = persisted as Partial<State> | undefined
                if (!p || p.seedVersion !== SEED_VERSION) return buildSeedState()
                return p as State
            },
            version: SEED_VERSION,
        }
    )
)

export default useFinanzasStore
