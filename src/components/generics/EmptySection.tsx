import { ArrowUpRightIcon, FolderIcon, SearchIcon } from "lucide-react"

import { Button } from "@/uishadcn/ui/button"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/uishadcn/ui/empty"

interface EmptySectionProps {
    title: string
    description?: string
    icon?: React.ReactNode
    children?: React.ReactNode
}

export function EmptySection({ title, description, icon, children }: EmptySectionProps) {
    return (
        <Empty>
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    {icon || <SearchIcon />}
                </EmptyMedia>
                <EmptyTitle>{title}</EmptyTitle>
                <EmptyDescription>
                    {description}
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center gap-2">
                {children}
            </EmptyContent>
        </Empty>
    )
}
