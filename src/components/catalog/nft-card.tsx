import { Link } from "@tanstack/react-router";

import type { Nft } from "@/contracts";

type NftCardProps = {
  nft: Nft;
};

export function NftCard({ nft }: NftCardProps) {
  const imageAlt = nft.gallery[0]?.alt ?? nft.name;

  return (
    <article>
      <Link
        to="/nfts/$nftId"
        params={{ nftId: nft.id }}
        className="group block"
      >
        <div className="relative h-[198px] overflow-hidden rounded-[22px] bg-card xl:h-[300px] xl:rounded-none">
          <img
            src={nft.imageUrl}
            alt={imageAlt}
            className="absolute top-3 left-1 h-[166px] w-[calc(100%-0.5rem)] rounded-[16px] object-cover transition-transform duration-300 group-hover:scale-[1.02] xl:top-5 xl:h-[250px]"
          />
        </div>

        <h2 className="mt-3 truncate text-sm leading-[18px] text-foreground xl:mt-5 xl:text-base xl:leading-[21px]">
          {nft.name}
        </h2>

        <p className="mt-0.5 flex items-baseline gap-3 text-base leading-[21px]">
          <strong className="font-bold text-primary">
            {nft.price.amount} {nft.price.currency}
          </strong>

          {nft.previousPrice ? (
            <span className="text-sm text-chart-4 line-through">
              {nft.previousPrice.amount} {nft.previousPrice.currency}
            </span>
          ) : null}
        </p>
      </Link>
    </article>
  );
}
