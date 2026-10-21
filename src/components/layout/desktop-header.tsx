import { Link } from "@tanstack/react-router";
import { LogIn, Search, ShoppingCart } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";

const navigation = [
  { label: "Início", href: "/" },
  { label: "Mercado", href: "#catalogo" },
  { label: "Criadores", href: "#criadores" },
  { label: "Aprenda", href: "#aprenda" },
] as const;

const defaultHomeSearch = {
  view: "all",
  sort: "featured",
  page: 1,
} as const;

export function DesktopHeader() {
  return (
    <header className="hidden pt-6 xl:block">
      <PageContainer>
        <div className="grid h-[45px] grid-cols-[160px_1fr_207px] border-b border-border">
          <Link
            to="/"
            search={defaultHomeSearch}
            className="pt-[8px] text-sm leading-[18px] font-bold"
          >
            KURIO
          </Link>

          <nav
            aria-label="Navegação principal"
            className="flex h-full justify-self-center gap-10"
          >
            {navigation.map((item, index) =>
              index === 0 ? (
                <Link
                  key={item.label}
                  to="/"
                  search={defaultHomeSearch}
                  className="h-full border-b-2 border-primary text-base leading-[21px] font-bold text-primary"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-base leading-[21px] text-foreground"
                >
                  {item.label}
                </a>
              ),
            )}
          </nav>

          <div className="flex h-[35px] items-center justify-between">
            <a
              href="#catalogo"
              aria-label="Pesquisar NFTs"
              className="flex h-[35px] w-5 items-center"
            >
              <Search aria-hidden="true" size={20} />
            </a>

            <Link
              to="/cart"
              aria-label="Abrir carrinho com 0 itens"
              className="relative flex size-[35px] items-center justify-center"
            >
              <ShoppingCart aria-hidden="true" size={20} />

              <span className="absolute top-0 right-0 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] leading-none text-primary-foreground">
                0
              </span>
            </Link>

            <Button
              asChild
              className="h-[35px] w-[99px] rounded-md px-3 text-sm font-bold"
            >
              <Link to="/login">
                <LogIn aria-hidden="true" />
                Entrar
              </Link>
            </Button>
          </div>
        </div>
      </PageContainer>
    </header>
  );
}
