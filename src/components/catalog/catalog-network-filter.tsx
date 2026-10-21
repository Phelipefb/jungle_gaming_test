import { Link, useSearch } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

const networks = [
  { id: "ethereum", name: "Ethereum", count: 119 },
  { id: "polygon", name: "Polygon", count: 78 },
  { id: "solana", name: "Solana", count: 86 },
] as const;

export function CatalogNetworkFilter() {
  const search = useSearch({ from: "/" });

  return (
    <section className="mt-9">
      <h3 className="text-[18px] leading-6 font-bold">Rede</h3>

      <ul className="mt-2">
        {networks.map((network) => {
          const isActive = search.network === network.id;

          return (
            <li key={network.id}>
              <Link
                to="/"
                search={{
                  ...search,
                  network: isActive ? undefined : network.id,
                  page: 1,
                }}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "flex h-10 items-center justify-between px-3 text-base leading-[21px]",
                  isActive ? "text-primary" : "text-chart-4",
                )}
              >
                <span>{network.name}</span>
                <span>({network.count})</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
