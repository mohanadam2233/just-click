import Footer from "@/components/layout/footer/Footer";
import Header from "@/components/layout/header/Header";
import Scrollup from "../others/Scrollup";
import CartContextProvider from "@/contexts/CartContext";
import WishlistContextProvider from "@/contexts/WshlistContext";
const PageWrapper = ({ children }) => {
  return (
    <>
      <CartContextProvider>
        {/* header */}
        <Header />

        {/* main */}
        <WishlistContextProvider>{children}</WishlistContextProvider>
      </CartContextProvider>

      {/* footer */}
      <Footer />

      {/* scroll up */}
      <Scrollup />
    </>
  );
};

export default PageWrapper;
