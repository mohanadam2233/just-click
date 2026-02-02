import ShopMain from "@/components/layout/main/ecommerce/ShopMain";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
  title: "Shop | Edurock - Education LMS Template",
  description: "Shop | Edurock - Education LMS Template",
};

const Shop = async () => {
  return (
    <PageWrapper>
      <main>
        <ShopMain />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Shop;
