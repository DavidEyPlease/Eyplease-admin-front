import useAuthStore from "@/store/auth"
import Dropdown from "../common/Inputs/Dropdown"
import { MultiSelect } from "../common/Inputs/MultiSelect"

type Single = {
    mode: 'single'
    value: string
}

type Multiple = {
    mode: 'multiple'
    value: string[]
}

type PlanSelectorProps = (Single | Multiple) & {
    onChange: (value: string | string[]) => void
}

const PlanSelector = ({ mode, value, onChange }: PlanSelectorProps) => {
    const { utilData } = useAuthStore(state => state)

    const plans = utilData.plans.map(plan => ({ label: plan.name, value: plan.id }))

    return (
        mode === 'single' ? (
            <Dropdown
                className="max-w-xs"
                placeholder="Selecciona un plan"
                value={value}
                onChange={onChange}
                items={plans}
            />
        ) : (
            <MultiSelect
                items={plans}
                placeholder={value.length ? `${value.length} planes seleccionados` : 'Selecciona un plan'}
                value={value}
                onChange={(v) => onChange(v)}
            />
        )
    )
}

export default PlanSelector