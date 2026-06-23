import { useMemo, useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react"
import dayjs from "dayjs"
import { toast } from "sonner"

import { DataTable } from "@/components/generics/DataTable"
import { AlertConfirmDelete } from "@/components/generics/AlertConfirm"
import Button from "@/components/common/Button"
import Dropdown from "@/components/common/Inputs/Dropdown"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/uishadcn/ui/dialog"
import { DISCOUNT_TYPE_LABELS, Promotion } from "@/interfaces/promotion"
import { formatMoney } from "@/utils/finance"
import usePromotions from "./usePromotions"
import PromotionForm from "./components/PromotionForm"
import { PromotionFormValues, toPromotionPayload } from "./components/promotionSchema"

const ALL = "all"
const STATUS_OPTIONS = [
    { label: "Todas", value: ALL },
    { label: "Activas", value: "active" },
    { label: "Expiradas", value: "expired" },
]

const formatDiscount = (promotion: Promotion) =>
    promotion.discountType === "percent" ? `${promotion.discount}%` : formatMoney(promotion.discount)

const PromotionsTab = () => {
    const { promotions, loading, createPromotion, updatePromotion, deletePromotion, mutating } = usePromotions()

    const [status, setStatus] = useState<string>(ALL)
    const [search, setSearch] = useState("")
    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<Promotion | null>(null)

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase()
        return promotions.filter((promotion) => {
            if (status === "active" && (!promotion.active || promotion.isExpired)) return false
            if (status === "expired" && !promotion.isExpired) return false
            if (term && !promotion.name.toLowerCase().includes(term)) return false
            return true
        })
    }, [promotions, status, search])

    const openCreate = () => {
        setEditing(null)
        setFormOpen(true)
    }

    const openEdit = (promotion: Promotion) => {
        setEditing(promotion)
        setFormOpen(true)
    }

    const handleSubmit = async (values: PromotionFormValues) => {
        const payload = toPromotionPayload(values)
        if (editing) {
            await updatePromotion(editing.id, payload)
            toast.success("Promoción actualizada")
        } else {
            await createPromotion(payload)
            toast.success("Promoción creada")
        }
        setFormOpen(false)
        setEditing(null)
    }

    const handleDelete = async (promotion: Promotion) => {
        await deletePromotion(promotion.id)
        toast.success("Promoción eliminada")
    }

    const columns = useMemo<ColumnDef<Promotion>[]>(() => [
        {
            id: "name",
            header: "Nombre",
            cell: ({ row }) => <span className="font-medium text-slate-800">{row.original.name}</span>,
        },
        {
            id: "type",
            header: "Tipo",
            cell: ({ row }) => <span className="text-slate-600">{DISCOUNT_TYPE_LABELS[row.original.discountType]}</span>,
        },
        {
            id: "discount",
            header: "Descuento",
            cell: ({ row }) => <span className="font-semibold text-slate-800">{formatDiscount(row.original)}</span>,
        },
        {
            id: "expires",
            header: "Expira",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span className="text-slate-600">{dayjs(row.original.expiresAt).format("DD/MM/YYYY")}</span>
                    {row.original.isExpired && (
                        <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-600">Expirada</span>
                    )}
                </div>
            ),
        },
        {
            id: "status",
            header: "Estado",
            cell: ({ row }) => (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${row.original.active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                    {row.original.active ? "Activa" : "Inactiva"}
                </span>
            ),
        },
        {
            id: "actions",
            header: () => <div className="text-right">Acciones</div>,
            cell: ({ row }) => (
                <div className="flex items-center justify-end gap-1">
                    <button
                        type="button"
                        onClick={() => openEdit(row.original)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </button>
                    <AlertConfirmDelete
                        title="¿Eliminar esta promoción?"
                        description="Esta acción no se puede deshacer."
                        loading={mutating}
                        onConfirm={() => handleDelete(row.original)}
                        trigger={
                            <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500">
                                <Trash2Icon className="h-4 w-4" />
                            </button>
                        }
                    />
                </div>
            ),
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [mutating])

    return (
        <div className="grid gap-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-400">Crea y administra los descuentos disponibles para aplicar a tus clientes.</p>
                <Button
                    text={<span className="flex items-center gap-1.5"><PlusIcon className="h-4 w-4" /> Nueva promoción</span>}
                    color="primary"
                    rounded
                    size="sm"
                    onClick={openCreate}
                />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:max-w-xl">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        placeholder="Buscar por nombre..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#5B47E0] focus:ring-2 focus:ring-[#5B47E0]/15"
                    />
                </div>
                <Dropdown placeholder="Estado" value={status} items={STATUS_OPTIONS} onChange={setStatus} />
            </div>

            <DataTable columns={columns} data={filtered} isLoading={loading} />

            <Dialog open={formOpen} onOpenChange={(open) => { setFormOpen(open); if (!open) setEditing(null) }}>
                <DialogContent className="max-w-lg rounded-2xl border-slate-200 bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900">{editing ? "Editar promoción" : "Nueva promoción"}</DialogTitle>
                    </DialogHeader>
                    <PromotionForm key={editing?.id ?? "new"} promotion={editing} loading={mutating} onSubmit={handleSubmit} />
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default PromotionsTab
