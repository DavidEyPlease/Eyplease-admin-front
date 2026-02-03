import { DataTable } from "@/components/generics/DataTable"
import { ITask, TaskStatusTypes } from "@/interfaces/tasks"
import { Badge } from "@/uishadcn/ui/badge"
import { ColumnDef } from "@tanstack/react-table"
import { UseTaskResult } from "./useTasks"
import { BookCheckIcon, CircleCheckBigIcon, LoaderIcon, PaintbrushIcon, PencilLineIcon, UserRoundCogIcon, ViewIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { MAP_TASK_STATUS_COLORS, MAP_TASK_TYPES_COLORS } from "@/constants/app"
import { formatDate } from "@/utils/dates"
import FilterSidebar from "./components/FilterSidebar"
import { Card, CardContent } from "@/uishadcn/ui/card"
// import Button from "@/components/common/Button"
import { Button as UIButton } from "@/uishadcn/ui/button"
import { publishEvent } from "@/utils/events"
import { BROWSER_EVENTS } from "@/constants/browserEvents"

export const TaskStatusIcon = ({ status }: { status: TaskStatusTypes }) => {
    const icons = {
        [TaskStatusTypes.READY_FOR_PUBLISH]: <BookCheckIcon />,
        [TaskStatusTypes.UNASSIGNED]: <UserRoundCogIcon />,
        [TaskStatusTypes.IN_PROGRESS]: <LoaderIcon />,
        [TaskStatusTypes.READY_FOR_REVIEW]: <ViewIcon />,
        [TaskStatusTypes.COMPLETED]: <CircleCheckBigIcon />,
        [TaskStatusTypes.PENDING_CORRECTION]: <PencilLineIcon />,
        [TaskStatusTypes.UPLOAD_AE_RESOURCES]: <PaintbrushIcon />,
    }

    return icons[status] || null;
}

const columns: ColumnDef<ITask>[] = [
    // {
    //     accessorKey: "created_at",
    //     header: "F. creación",
    //     cell: ({ row }) => formatDate(row.original.created_at)
    // },
    {
        accessorKey: "title",
        header: "Tarea",
        cell: ({ row }) => {
            return (
                <div className="flex items-center">
                    <div className={`size-3 rounded-full ${MAP_TASK_TYPES_COLORS[row.original.task_type?.slug]}`} />
                    <UIButton variant='link' size='sm' onClick={() => publishEvent(BROWSER_EVENTS.OPEN_TASK_DETAIL, row.original)}>
                        {row.original.title}
                    </UIButton>
                </div>
            )
        },
        enableHiding: false,
    },
    {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => (
            <Badge className={cn('px-1.5 [&>svg]:size-4 [&>svg]:mr-1', MAP_TASK_STATUS_COLORS[row.original.task_status?.slug])}>
                {TaskStatusIcon({ status: row.original.task_status?.slug as TaskStatusTypes })}
                {row.original.task_status?.name}
            </Badge>
        ),
    },
    {
        accessorKey: "reviewer",
        header: "Responsable",
        cell: ({ row }) => {
            return row.original.assigned_to?.name;
            //   const isAssigned = row.original.reviewer !== "Assign reviewer"

            //   if (isAssigned) {
            //     return row.original.reviewer
            //   }

            //   return (
            //     <>
            //       <Label htmlFor={`${row.original.id}-reviewer`} className="sr-only">
            //         Reviewer
            //       </Label>
            //       <Select>
            //         <SelectTrigger
            //           className="w-38 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
            //           size="sm"
            //           id={`${row.original.id}-reviewer`}
            //         >
            //           <SelectValue placeholder="Assign reviewer" />
            //         </SelectTrigger>
            //         <SelectContent align="end">
            //           <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
            //           <SelectItem value="Jamik Tashpulatov">
            //             Jamik Tashpulatov
            //           </SelectItem>
            //         </SelectContent>
            //       </Select>
            //     </>
            //   )
        },
    },
    {
        accessorKey: "expired_at",
        header: "Vencimiento",
        cell: ({ row }) => formatDate(row.original.expired_at)
    },
]

type TodoListViewProps = Pick<UseTaskResult, 'filters' | 'onApplyFilters' | 'isLoading' | 'isRefetching' | 'tasks' | 'handleDateSelect' | 'handleEventClick' | 'onDragEnd'>;

const TodoListView = ({
    isLoading,
    isRefetching,
    tasks,
    filters,
    onApplyFilters
}: TodoListViewProps) => {
    return (
        <div className="flex flex-col md:flex-row">
            <Card className="rounded-tr-none rounded-br-none">
                <CardContent className='p-0'>
                    <FilterSidebar
                        filters={filters}
                        className="border-none"
                        onChangeFilters={onApplyFilters}
                    >
                        {/* <Button
                            text='Crear tarea'
                            type="submit"
                            color="primary"
                            rounded
                            block
                        /> */}
                    </FilterSidebar>
                </CardContent>
            </Card>
            <DataTable
                containerClasses="rounded-tl-none rounded-bl-none"
                columns={columns}
                isLoading={isLoading || isRefetching}
                data={tasks}
            />
        </div>
    )
}

export default TodoListView;