import { ColumnDef } from "@tanstack/react-table"
// import TemplateActions from "./Actions"
import { formatDate } from "@/utils/dates"
import { ITraining } from "@/interfaces/training"
import TrainingActions from "./Actions"
import TrainingCover from "./TrainingCover"
import { getTrainingFileByType } from "../utils"
import { FileTypes } from "@/interfaces/files"

export const trainingColumns: ColumnDef<ITraining>[] = [
    {
        id: "created_at",
        header: "F. Creación",
        cell: ({ row }) => formatDate(row.original.created_at),
        enableSorting: true,
        enableHiding: false,
    },
    {
        id: "title",
        header: "Título",
        cell: ({ row }) => (
            <div className="flex flex-wrap items-center gap-x-5">
                <TrainingCover
                    trainingId={row.original.id}
                    cover={getTrainingFileByType(row.original.files, FileTypes.TRAINING_COVER) || null}
                />
                {row.original.title.length > 30
                    ? `${row.original.title.substring(0, 30)}...`
                    : row.original.title
                }
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "category",
        header: "Categoría",
        cell: ({ row }) => row.original.category.name
    },
    {
        accessorKey: "plan",
        header: "Plan",
        cell: ({ row }) => row.original.plans.map(plan => plan.name).join(', ')
    },
    {
        accessorKey: "updated_at",
        header: "Última modificación",
        cell: ({ row }) => formatDate(row.original.updated_at)
    },
    {
        accessorKey: "actions",
        header: "Acciones",
        cell: ({ row }) => <TrainingActions training={row.original} />,
    },
]
