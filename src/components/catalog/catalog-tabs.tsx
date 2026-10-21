import { Link, useSearch } from "@tanstack/react-router";

import type { CatalogSort, CatalogView } from "@/contracts";
import { cn } from "@/lib/utils";

type CatalogTabsProps = {
  className?: string;
};

const tabs: ReadonlyArray<{
  label: string;
  view: CatalogView;
  sort: CatalogSort;
}> = [
  {
    label: "Todos os NFTs",
    view: "all",
    sort: "newest",
  },
  {
    label: "Novos lançamentos",
    view: "new",
    sort: "newest",
  },
  {
    label: "Em alta",
    view: "trending",
    sort: "featured",
  },
];

export function CatalogTabs({ className }: CatalogTabsProps) {
  const search = useSearch({ from: "/" });

  return (
    <nav
      aria-label="Visualizações do catálogo"
      className={cn("overflow-x-auto", className)}
    >
      <div className="flex h-5 w-max gap-4">
        {tabs.map((tab) => {
          const isActive = search.view === tab.view;

          return (
            <Link
              key={tab.view}
              to="/"
              search={(previous) => ({
                ...previous,
                view: tab.view,
                sort: tab.sort,
                page: 1,
              })}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "h-5 whitespace-nowrap text-sm leading-5",
                isActive
                  ? "border-b-2 border-primary font-bold text-primary"
                  : "text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
