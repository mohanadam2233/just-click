import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/footer/Footer";

// IMPORTANT: import Scrollup from the SAME path PageWrapper used
import Scrollup from "@/components/shared/others/Scrollup";

export default function PublicLayout({ children }) {
  return (
    <>
      {/* header */}
      <Header />

      {/* main */}
      {children}

      {/* footer */}
      <Footer />

      {/* scroll up */}
      <Scrollup />
    </>
  );
}