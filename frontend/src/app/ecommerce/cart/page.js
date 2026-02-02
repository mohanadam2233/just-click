import CartMain from "@/components/layout/main/ecommerce/CartMain";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
  title: "Cart | Edurock - Education LMS Template",
  description: "Cart | Edurock - Education LMS Template",
};

const Cart = async () => {
  return (
    <PageWrapper>
      <main>
        <CartMain />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Cart;
