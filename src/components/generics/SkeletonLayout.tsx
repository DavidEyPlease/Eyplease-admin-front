import { ReactNode } from "react"
import { Skeleton } from "@/uishadcn/ui/skeleton"
import { Card, CardContent } from "@/uishadcn/ui/card"
import { cn } from "@/lib/utils"

export type SkeletonVariant = 'table' | 'grid' | 'list'

interface SkeletonLayoutProps {
    loading: boolean
    variant: SkeletonVariant
    children: ReactNode
    count?: number
    columns?: number
    showHeader?: boolean
    rowHeight?: number
    itemHeight?: number
    gridClassName?: string
    className?: string
    withAvatar?: boolean
}

const TableSkeleton = ({
    count = 6,
    columns = 4,
    showHeader = true,
    rowHeight = 48,
    className,
}: Pick<SkeletonLayoutProps, 'count' | 'columns' | 'showHeader' | 'rowHeight' | 'className'>) => (
    <Card className={cn("w-full overflow-hidden rounded-2xl py-0 gap-y-0", className)}>
        <CardContent className="p-0">
            {showHeader && (
                <div className="bg-muted flex items-center gap-4 px-4 py-3 border-b">
                    {Array.from({ length: columns }).map((_, i) => (
                        <Skeleton key={`th-${i}`} className="h-4 flex-1" />
                    ))}
                </div>
            )}
            <div className="divide-y">
                {Array.from({ length: count }).map((_, rowIdx) => (
                    <div
                        key={`tr-${rowIdx}`}
                        className="flex items-center gap-4 px-4"
                        style={{ height: rowHeight }}
                    >
                        {Array.from({ length: columns }).map((_, colIdx) => (
                            <Skeleton
                                key={`td-${rowIdx}-${colIdx}`}
                                className={cn(
                                    "h-4 flex-1",
                                    colIdx === 0 && "max-w-[40%]",
                                    colIdx === columns - 1 && "max-w-[80px]"
                                )}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
)

const GridSkeleton = ({
    count = 6,
    itemHeight = 220,
    gridClassName,
    className,
}: Pick<SkeletonLayoutProps, 'count' | 'itemHeight' | 'gridClassName' | 'className'>) => (
    <div
        className={cn(
            "grid grid-cols-1 sm:grid-cols-2 gap-4",
            gridClassName ?? "md:grid-cols-2 lg:grid-cols-3",
            className
        )}
    >
        {Array.from({ length: count }).map((_, i) => (
            <Card key={`card-${i}`} className="overflow-hidden rounded-2xl p-0 gap-0">
                <Skeleton className="w-full rounded-none" style={{ height: itemHeight }} />
                <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex items-center gap-2 pt-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 flex-1" />
                    </div>
                </CardContent>
            </Card>
        ))}
    </div>
)

const ListSkeleton = ({
    count = 5,
    itemHeight = 64,
    withAvatar = true,
    className,
}: Pick<SkeletonLayoutProps, 'count' | 'itemHeight' | 'withAvatar' | 'className'>) => (
    <div className={cn("flex flex-col gap-2", className)}>
        {Array.from({ length: count }).map((_, i) => (
            <Card
                key={`list-${i}`}
                className="flex flex-row items-center gap-4 px-4 py-0 rounded-xl"
                style={{ minHeight: itemHeight }}
            >
                {withAvatar && <Skeleton className="h-10 w-10 rounded-full shrink-0" />}
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/5" />
                    <Skeleton className="h-3 w-3/5" />
                </div>
                <Skeleton className="h-8 w-20 shrink-0" />
            </Card>
        ))}
    </div>
)

const SkeletonLayout = ({
    loading,
    variant,
    children,
    count,
    columns,
    showHeader,
    rowHeight,
    itemHeight,
    gridClassName,
    className,
    withAvatar,
}: SkeletonLayoutProps) => {
    if (!loading) return <>{children}</>

    if (variant === 'table') {
        return (
            <TableSkeleton
                count={count}
                columns={columns}
                showHeader={showHeader}
                rowHeight={rowHeight}
                className={className}
            />
        )
    }

    if (variant === 'grid') {
        return (
            <GridSkeleton
                count={count}
                itemHeight={itemHeight}
                gridClassName={gridClassName}
                className={className}
            />
        )
    }

    return (
        <ListSkeleton
            count={count}
            itemHeight={itemHeight}
            withAvatar={withAvatar}
            className={className}
        />
    )
}

export default SkeletonLayout
