import { CatalogTabs } from "@/components/catalog/catalog-tabs";
import { MobileCatalogToolbar } from "@/components/catalog/mobile-catalog-toolbar";
import { DesktopHomeHero, MobileHomeHero } from "@/components/home/home-hero";
import { DesktopHeader } from "@/components/layout/desktop-header";
import { PageContainer } from "@/components/layout/page-container";

export function HomePage() {
  return (
    <>
      <DesktopHeader />

      <main className="min-h-dvh">
        <PageContainer variant="mobile" className="pt-10 xl:hidden">
          <MobileCatalogToolbar />
          <MobileHomeHero />
        </PageContainer>

        <DesktopHomeHero />

        <section id="catalogo">
          <PageContainer variant="mobile" className="xl:hidden">
            <CatalogTabs className="mt-4" />
          </PageContainer>

          <PageContainer className="mt-24 hidden grid-cols-[312px_1fr] gap-12 xl:grid">
            <div aria-hidden="true" />

            <CatalogTabs />
          </PageContainer>
        </section>
      </main>
    </>
  );
}
