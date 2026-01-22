import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/uishadcn/ui/pagination"


interface Props {
    page: number
    totalPages: number
    perPage: number
    pending?: boolean
    showPerPage?: boolean
    onChangePage: (page: number) => void
    onChangePerPage?: (perPage: number) => void
}

const UIPagination = ({ page, perPage, showPerPage = true, totalPages, onChangePerPage, onChangePage }: Props) => {
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        // Siempre mostrar la primera página
        pageNumbers.push(1);

        // Calcular el rango de páginas alrededor de la página actual
        let startPage = Math.max(2, page - 1);
        let endPage = Math.min(totalPages - 1, page + 1);

        if (page <= 3) {
            endPage = Math.min(maxVisiblePages - 1, totalPages - 1);
        } else if (page >= totalPages - 2) {
            startPage = Math.max(2, totalPages - (maxVisiblePages - 2));
        }

        // Agregar elipsis si es necesario
        if (startPage > 2) {
            pageNumbers.push('...');
        }

        // Agregar páginas del rango
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        // Agregar elipsis final si es necesario
        if (endPage < totalPages - 1) {
            pageNumbers.push('...');
        }

        // Siempre mostrar la última página
        if (totalPages > 1) {
            pageNumbers.push(totalPages);
        }

        return pageNumbers;
    };

    return (
        <div className='flex items-center gap-2'>
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => onChangePage(page - 1)}
                            className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>
                    {getPageNumbers().map((pageNum, index) => (
                        <PaginationItem key={index}>
                            {pageNum === '...' ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink
                                    onClick={() => onChangePage(Number(pageNum))}
                                    isActive={page === pageNum}
                                    className="cursor-pointer"
                                >
                                    {pageNum}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext
                            onClick={() => onChangePage(page + 1)}
                            className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>

        </div>
    )
}

export default UIPagination;