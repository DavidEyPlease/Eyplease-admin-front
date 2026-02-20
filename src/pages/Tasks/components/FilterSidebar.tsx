import { MAP_TASK_STATUS_COLORS, MAP_TASK_TYPES_COLORS } from "@/constants/app"
import { TasksFilters } from "@/interfaces/tasks"
import { cn } from "@/lib/utils"
import useAuthStore from "@/store/auth"
import { Checkbox } from "@/uishadcn/ui/checkbox"
import { Label } from "@/uishadcn/ui/label"
import { Separator } from "@/uishadcn/ui/separator"

type Filters = Partial<TasksFilters>

interface FilterSidebarProps {
	filters: Filters;
	children?: React.ReactNode;
	className?: string;
	onChangeFilters: (filters: Filters) => void;
}

const FilterSidebar = ({ filters, className, children, onChangeFilters }: FilterSidebarProps) => {
	const { utilData } = useAuthStore(state => state)

	const onSelectFilter = (value: Filters) => {
		onChangeFilters(value)
	}

	return (
		<div className={cn("w-56 border-r space-y-6 p-4", className)}>
			{children}

			<div className="space-y-4">
				<h3 className="font-medium text-foreground">Tipos de tareas</h3>

				<div className="space-y-4">
					{utilData.task_types.map((filter) => (
						<div key={filter.id} className="flex items-center justify-between space-x-3">
							<div className="flex items-center gap-3">
								<Checkbox
									id={filter.id}
									checked={(filters.task_types || []).includes(filter.id)}
									onCheckedChange={(checked) => onSelectFilter({ task_types: checked ? [...(filters.task_types || []), filter.id] : (filters.task_types || []).filter(s => s !== filter.id) })}
								/>
								<Label htmlFor={filter.id}>{filter.name}</Label>
							</div>
							<div className={cn(`size-3 rounded-full`, MAP_TASK_TYPES_COLORS[filter.slug])} />
						</div>
					))}
				</div>

				<Separator />

				<h3 className="font-medium text-foreground">Estados</h3>

				<div className="space-y-4">
					{utilData.task_statuses.map((filter) => (
						<div key={filter.id} className="flex items-center justify-between space-x-3">
							<div className="flex items-center gap-3">
								<Checkbox
									id={filter.id}
									checked={(filters.statuses || []).includes(filter.id)}
									onCheckedChange={(checked) => onSelectFilter({ statuses: checked ? [...(filters.statuses || []), filter.id] : (filters.statuses || []).filter(s => s !== filter.id) })}
								// className="data-[state=checked]:bg-primary"
								/>
								<Label htmlFor={filter.id}>{filter.name}</Label>
							</div>
							<div className={`size-3 rounded-full ${MAP_TASK_STATUS_COLORS[filter.slug]}`} />
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

export default FilterSidebar