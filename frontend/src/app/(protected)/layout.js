import AuthGate from "@/components/AuthGate";
import Footer from "@/components/layout/footer/Footer";
import DashboardHeader from "@/components/layout/header/DashboardHeader";
import AiFloatingButton from "@/components/shared/others/AiFloatingButton";
import Scrollup from "@/components/shared/others/Scrollup";

export default function ProtectedLayout({ children }) {
  return (
    <AuthGate>
      <>
        <DashboardHeader />
        <div className="h-14" />
        {children}
        <Footer />
        <Scrollup />
        <AiFloatingButton />
      </>
    </AuthGate>
  );
}
