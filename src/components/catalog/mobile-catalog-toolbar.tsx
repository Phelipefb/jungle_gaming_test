import { Search, SlidersHorizontal } from "lucide-react";

export function MobileCatalogToolbar() {
  return (
    <form action="/" role="search" className="flex h-[45px] w-full gap-2">
      <label className="flex h-[45px] min-w-0 flex-1 items-center gap-3 rounded-[10px] bg-card px-3">
        <Search
          aria-hidden="true"
          className="shrink-0 text-chart-4"
          size={22}
        />

        <input
          type="search"
          name="search"
          aria-label="Explorar coleções"
          placeholder="Explorar coleções"
          className="min-w-0 flex-1 bg-transparent text-base font-bold text-chart-4 outline-none placeholder:text-chart-4"
        />
      </label>

      <button
        type="button"
        aria-label="Abrir filtros"
        className="flex size-[45px] shrink-0 items-center justify-center rounded-[15px] bg-primary text-primary-foreground"
      >
        <SlidersHorizontal aria-hidden="true" size={22} />
      </button>
    </form>
  );
}
