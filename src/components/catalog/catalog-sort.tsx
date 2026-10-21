import { useNavigate, useSearch } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";

import { catalogSortSchema, type CatalogSort } from "@/contracts";

const sortOptions: ReadonlyArray<{
  label: string;
  value: CatalogSort;
}> = [
  {
    label: "Listados recentemente",
    value: "newest",
  },
  {
    label: "Em destaque",
    value: "featured",
  },
  {
    label: "Menor preço",
    value: "price-asc",
  },
  {
    label: "Maior preço",
    value: "price-desc",
  },
];

export function CatalogSort() {
  const search = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });

  function handleSortChange(value: string) {
    const result = catalogSortSchema.safeParse(value);

    if (!result.success) {
      return;
    }

    void navigate({
      search: (previous) => ({
        ...previous,
        sort: result.data,
        page: 1,
      }),
    });
  }

  return (
    <label className="flex h-5 items-center gap-1 whitespace-nowrap text-sm leading-5">
      <span>Ordenar por:</span>

      <span className="relative">
        <select
          value={search.sort}
          onChange={(event) => handleSortChange(event.target.value)}
          className="w-[220px] cursor-pointer appearance-none bg-transparent pr-5 text-foreground outline-none"
        >
          {sortOptions.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-background text-foreground"
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          aria-hidden="true"
          size={14}
          className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2"
        />
      </span>
    </label>
  );
}
