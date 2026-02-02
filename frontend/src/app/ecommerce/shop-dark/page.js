import ShopMain from "@/components/layout/main/ecommerce/ShopMain";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
  title: "Shop Dark | Edurock - Education LMS Template",
  description: "Shop Dark | Edurock - Education LMS Template",
};

const Shop_Dark = async () => {
  return (
    <PageWrapper>
      <main className="is-dark">
        <ShopMain />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Shop_Dark;
