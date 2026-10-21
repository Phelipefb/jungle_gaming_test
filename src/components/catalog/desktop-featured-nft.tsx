import { Link } from "@tanstack/react-router";

export function DesktopFeaturedNft() {
  return (
    <article className="overflow-hidden bg-card pt-[26px]">
      <p className="px-5 text-[18px] leading-6 font-bold text-primary">
        NFT EM DESTAQUE
      </p>

      <h2 className="mt-[18px] px-5 text-center text-[18px] leading-6 font-bold">
        OFERTA LIMITADA
      </h2>

      <Link
        to="/nfts/$nftId"
        params={{ nftId: "sage-nomad-009" }}
        aria-label="Ver detalhes de Sage Nomad número 009"
        className="group mt-3 block"
      >
        <img
          src="/assets/nfts/sage-nomad-009.png"
          alt="Sage Nomad #009"
          className="h-[366px] w-full rounded-[22px] object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </Link>
    </article>
  );
}
