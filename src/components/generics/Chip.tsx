import { clsx } from "clsx";

interface ChipProps {
    label: string;
    colorClass?: string;
    icon?: React.ReactNode;
    className?: string;
}

const Chip = ({ className, label, icon, colorClass = 'bg-primary' }: ChipProps) => {
    return (
        <div className={clsx(className, colorClass, 'rounded-2xl', 'text-white', 'px-2', 'py-1', 'gap-1', 'w-max', 'flex', 'justify-center', 'items-center')}>
            {icon}
            <small className="text-xs">{label}</small>
        </div>
    )
}

export default Chip;