import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";

import { NftCard } from "@/components/catalog/nft-card";
import { cn } from "@/lib/utils";
import { nftListQueryOptions } from "@/queries/nfts";

type CatalogGridProps = {
  className?: string;
};

const gridStyles =
  "grid grid-cols-2 gap-x-[17px] gap-y-[17px] pb-8 xl:grid-cols-3 xl:gap-x-[34px] xl:gap-y-[66px] xl:pb-0";

export function CatalogGrid({ className }: CatalogGridProps) {
  const search = useSearch({ from: "/" });
  const nftsQuery = useQuery(nftListQueryOptions(search));

  if (nftsQuery.isPending) {
    return (
      <div
        aria-label="Carregando NFTs"
        aria-busy="true"
        className={cn(gridStyles, className)}
      >
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            aria-hidden="true"
            className={cn(
              "animate-pulse",
              index % 2 === 1 && "translate-y-8 xl:translate-y-0",
            )}
          >
            <div className="h-[198px] rounded-[22px] bg-card xl:h-[300px] xl:rounded-none" />
            <div className="mt-3 h-[18px] w-4/5 rounded bg-card xl:mt-5" />
            <div className="mt-1 h-[21px] w-2/5 rounded bg-card" />
          </div>
        ))}
      </div>
    );
  }

  if (nftsQuery.isError) {
    return (
      <div role="alert" className={className}>
        <p className="text-sm text-destructive">
          Não foi possível carregar os NFTs.
        </p>

        <button
          type="button"
          onClick={() => void nftsQuery.refetch()}
          className="mt-3 text-sm font-bold text-primary underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (nftsQuery.data.items.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        Nenhum NFT encontrado.
      </p>
    );
  }

  return (
    <div className={cn(gridStyles, className)}>
      {nftsQuery.data.items.map((nft, index) => (
        <div
          key={nft.id}
          className={cn(index % 2 === 1 && "translate-y-8 xl:translate-y-0")}
        >
          <NftCard nft={nft} />
        </div>
      ))}
    </div>
  );
}
