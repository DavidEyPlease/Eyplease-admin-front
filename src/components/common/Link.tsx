import clsx from 'clsx'
import { Link as UILink } from 'react-router'

interface Props {
    to: string
    text: string
    className?: string
}

const Link = ({ text, to, className }: Props) => {
    return (
        <UILink to={to} className={clsx('text-primary text-sm font-medium', className)}>{text}</UILink>
    )
}

export default Link;