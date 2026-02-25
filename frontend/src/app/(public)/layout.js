import Footer from "@/components/layout/footer/Footer";
import Header from "@/components/layout/header/Header";
import Scrollup from "@/components/shared/others/Scrollup";

export default function PublicLayout({ children }) {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <Scrollup />
    </>
  );
}