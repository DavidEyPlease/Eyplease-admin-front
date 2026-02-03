import Dropdown from "@/components/common/Inputs/Dropdown";
import { TypographySmall } from "@/components/common/Typography";
import { MAP_TASK_STATUS_COLORS, MAP_TASK_TYPES_COLORS } from "@/constants/app";
import useAuthStore from "@/store/auth";

interface DropdownFiltersProps {
    taskTypeValue: string
    taskStatusValue: string
    onChangeValue: (value: string, field: 'type' | 'status') => void;
}

const DropdownFilters = ({ taskTypeValue, taskStatusValue, onChangeValue }: DropdownFiltersProps) => {
    const { utilData } = useAuthStore(state => state);

    return (
        <div>
            <div className="flex flex-col gap-2">
                <TypographySmall text="Tipo de tarea" />
                <Dropdown
                    placeholder="Seleccionar tipo de tarea"
                    value={taskTypeValue}
                    items={utilData.task_types.map(s => ({
                        label: s.name,
                        value: s.id,
                        color: MAP_TASK_TYPES_COLORS[s.slug]
                    }))}
                    onChange={v => onChangeValue(v, 'type')}
                />
            </div>
            <div className="flex flex-col gap-2">
                <TypographySmall text="Estado" />
                <Dropdown
                    placeholder="Seleccionar estado"
                    value={taskStatusValue}
                    key={taskStatusValue}
                    items={utilData.task_statuses.map(s => ({
                        label: s.name,
                        value: s.id,
                        color: MAP_TASK_STATUS_COLORS[s.slug]
                    }))}
                    onChange={v => onChangeValue(v, 'status')}
                />
            </div>
        </div>
    )
}

export default DropdownFilters;