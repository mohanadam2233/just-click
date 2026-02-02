import CartMain from "@/components/layout/main/ecommerce/CartMain";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
  title: "Cart Dark | Edurock - Education LMS Template",
  description: "Cart Dark | Edurock - Education LMS Template",
};

const Cart_Dark = async () => {
  return (
    <PageWrapper>
      <main className="is-dark">
        <CartMain />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Cart_Dark;
