import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";
import { ArrowRight } from "lucide-react";

export function DesktopHomeHero() {
  return (
    <section className="hidden xl:block">
      <PageContainer className="mt-8 grid h-[450px] grid-cols-[720px_450px] gap-[30px]">
        <div className="relative pt-10 pl-10">
          <p className="text-sm leading-[18px] font-bold">Bem-vindo à Kurio</p>

          <h1 className="mt-5 text-[40px] leading-[56px] font-bold tracking-[0.02em]">
            SEJA DONO DO FUTURO
            <br />
            DA ARTE DIGITAL
          </h1>

          <p className="mt-3 max-w-[610px] text-sm leading-6 text-chart-4">
            Descubra NFTs selecionados de criadores emergentes e consagrados.
            <br />
            Colecione arte digital rara, apoie artistas e tenha uma parte da
            <br />
            cultura da internet.
          </p>

          <Button
            asChild
            className="mt-8 h-10 w-[140px] rounded-md text-sm font-bold"
          >
            <a href="#catalogo">EXPLORAR</a>
          </Button>

          <div
            aria-hidden="true"
            className="absolute right-[70px] bottom-[42px] flex gap-2"
          >
            <span className="size-2 rounded-full bg-primary" />
            <span className="size-2 rounded-full bg-primary" />
            <span className="size-2 rounded-full bg-primary" />
          </div>
        </div>

        <img
          src="/assets/nfts/emerald-ape-042.png"
          alt="Emerald Ape usando óculos verdes e jaqueta verde"
          className="size-[450px] rounded-[24px] object-cover"
        />
      </PageContainer>
    </section>
  );
}

export function MobileHomeHero() {
  return (
    <section
      aria-labelledby="mobile-home-title"
      className="relative mt-4 h-[190px] overflow-hidden rounded-[30px] bg-secondary xl:hidden"
      style={{
        backgroundImage: [
          "radial-gradient(circle at 25% 45%, rgba(210, 138, 76, 0.48) 0 38%, transparent 39%)",
          "radial-gradient(circle at 52% 115%, rgba(210, 138, 76, 0.18) 0 42%, transparent 43%)",
        ].join(", "),
      }}
    >
      <p className="absolute top-2 left-4 text-xs leading-4 font-bold">
        Bem-vindo à Kurio
      </p>

      <h1
        id="mobile-home-title"
        className="absolute top-[33px] left-4 text-[18px] leading-[30px] font-bold"
      >
        SEJA DONO DA
        <br />
        CULTURA DIGITAL
      </h1>

      <p className="absolute top-[94px] left-4 max-w-[190px] text-xs leading-[18px] text-chart-4">
        Descubra NFTs selecionados
        <br />
        de criadores do mundo
        <br />
        todo.
      </p>

      <a
        href="#catalogo"
        className="absolute top-[151px] left-4 flex items-center gap-2 text-sm leading-[18px] font-bold text-primary"
      >
        EXPLORAR
        <ArrowRight aria-hidden="true" size={16} />
      </a>

      <img
        src="/assets/nfts/emerald-ape-042.png"
        alt="Emerald Ape usando óculos verdes e jaqueta verde"
        className="absolute top-[11px] right-4 size-[138px] rounded-[16px] object-cover"
      />

      <img
        src="/assets/nfts/sage-nomad-009.png"
        alt=""
        aria-hidden="true"
        className="absolute top-[99px] right-[77px] size-[62px] rounded-[16px] object-cover"
      />

      <div
        aria-hidden="true"
        className="absolute bottom-[5px] left-1/2 flex -translate-x-1/2 gap-[7px]"
      >
        <span className="size-[7px] rounded-full bg-primary" />
        <span className="size-[7px] rounded-full bg-primary" />
        <span className="size-[7px] rounded-full bg-primary" />
      </div>
    </section>
  );
}
