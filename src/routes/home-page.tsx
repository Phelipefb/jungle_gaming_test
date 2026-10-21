import { CatalogGrid } from "@/components/catalog/catalog-grid";
import { CatalogTabs } from "@/components/catalog/catalog-tabs";
import { MobileCatalogToolbar } from "@/components/catalog/mobile-catalog-toolbar";
import { DesktopHomeHero, MobileHomeHero } from "@/components/home/home-hero";
import { DesktopHeader } from "@/components/layout/desktop-header";
import { PageContainer } from "@/components/layout/page-container";
import { CatalogSort } from "@/components/catalog/catalog-sort";
import { DesktopCatalogFilters } from "@/components/catalog/desktop-catalog-filters";

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
            <CatalogGrid className="mt-4" />
          </PageContainer>

          <PageContainer className="mt-24 hidden grid-cols-[312px_1fr] gap-12 xl:grid">
            <DesktopCatalogFilters />

            <div>
              <div className="flex h-5 items-start justify-between">
                <CatalogTabs />
                <CatalogSort />
              </div>

              <CatalogGrid className="mt-8" />
            </div>
          </PageContainer>
        </section>
      </main>
    </>
  );
}
