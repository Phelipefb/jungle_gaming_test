import { useQuery } from "@tanstack/react-query";
import { Link, useSearch } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { nftListQueryOptions } from "@/queries/nfts";

type CatalogPaginationProps = {
  className?: string;
};

export function CatalogPagination({ className }: CatalogPaginationProps) {
  const search = useSearch({ from: "/" });
  const nftsQuery = useQuery(nftListQueryOptions(search));

  if (
    nftsQuery.isPending ||
    nftsQuery.isError ||
    nftsQuery.data.pagination.totalPages <= 1
  ) {
    return null;
  }

  const { page, totalPages } = nftsQuery.data.pagination;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav
      aria-label="Paginação do catálogo"
      className={cn("flex justify-end gap-2", className)}
    >
      {page > 1 && (
        <Link
          to="/"
          search={{
            ...search,
            page: page - 1,
          }}
          aria-label="Ir para a página anterior"
          className="flex size-8 items-center justify-center rounded-md border border-border text-chart-4 transition-colors hover:border-primary hover:text-primary"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
        </Link>
      )}

      {pages.map((pageNumber) => {
        const isCurrentPage = pageNumber === page;

        return (
          <Link
            key={pageNumber}
            to="/"
            search={{
              ...search,
              page: pageNumber,
            }}
            aria-label={`Ir para a página ${pageNumber}`}
            aria-current={isCurrentPage ? "page" : undefined}
            className={cn(
              "flex size-8 items-center justify-center rounded-md border text-sm transition-colors",
              isCurrentPage
                ? "border-primary bg-primary font-bold text-primary-foreground"
                : "border-border text-chart-4 hover:border-primary hover:text-primary",
            )}
          >
            {pageNumber}
          </Link>
        );
      })}

      {page < totalPages && (
        <Link
          to="/"
          search={{
            ...search,
            page: page + 1,
          }}
          aria-label="Ir para a próxima página"
          className="flex size-8 items-center justify-center rounded-md border border-border text-chart-4 transition-colors hover:border-primary hover:text-primary"
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      )}
    </nav>
  );
}
