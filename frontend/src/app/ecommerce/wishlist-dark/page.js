import WishlistMain from "@/components/layout/main/ecommerce/WishlistMain";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
  title: "Wishlist Dark | Edurock - Education LMS Template",
  description: "Wishlist Dark | Edurock - Education LMS Template",
};

const Wishlist_Dark = async () => {
  return (
    <PageWrapper>
      <main className="is-dark">
        <WishlistMain />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Wishlist_Dark;
