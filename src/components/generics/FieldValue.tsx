import { clsx } from "clsx";

interface Props {
    label: string | React.ReactNode;
    value?: string;
    children?: React.ReactNode;
    flexDirection?: 'row' | 'col';
    className?: string;
}

const FieldValue = ({ flexDirection = 'row', children, label, value, className }: Props) => {
    return (
        <div className={clsx('flex gap-x-2 text-sm items-center text-muted-foreground', `flex-${flexDirection}`, className)}>
            <p className="font-semibold">{label}</p>
            {value && <p>{value}</p>}
            {children}
        </div>
    )
}

export default FieldValue;