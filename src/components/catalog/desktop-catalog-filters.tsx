import { Link, useSearch } from "@tanstack/react-router";
import { CatalogPriceFilter } from "@/components/catalog/catalog-price-filter";
import { CatalogNetworkFilter } from "@/components/catalog/catalog-network-filter";
import { cn } from "@/lib/utils";

const categories = [
  { name: "Arte digital", count: 33 },
  { name: "Fotografia", count: 12 },
  { name: "Música", count: 65 },
  { name: "Arte 3D", count: 39 },
  { name: "Colecionáveis", count: 23 },
  { name: "Generativa", count: 17 },
  { name: "Jogos", count: 19 },
  { name: "Assinaturas", count: 13 },
  { name: "Utilidade", count: 18 },
] as const;

export function DesktopCatalogFilters() {
  const search = useSearch({ from: "/" });

  return (
    <aside aria-label="Filtros do catálogo" className="bg-card px-5 pt-5 pb-5">
      <h2 className="text-[18px] leading-6 font-bold">Coleções</h2>

      <ul className="mt-2">
        {categories.map((category, index) => {
          const isActive =
            search.category === category.name ||
            (search.category === undefined && index === 0);

          return (
            <li key={category.name}>
              <Link
                to="/"
                search={(previous) => ({
                  ...previous,
                  view: previous.view ?? "all",
                  sort: previous.sort ?? "newest",
                  category: category.name,
                  page: 1,
                })}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "flex h-10 items-center justify-between px-3 text-base leading-[21px]",
                  isActive ? "text-primary" : "text-chart-4",
                )}
              >
                <span>{category.name}</span>
                <span>({category.count})</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <CatalogPriceFilter />
      <CatalogNetworkFilter />
    </aside>
  );
}
