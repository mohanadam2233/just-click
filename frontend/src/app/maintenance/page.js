import MaintenanceMain from "@/components/layout/main/MaintenanceMain";
import ThemeController from "@/components/shared/others/ThemeController";

export const metadata = {
  title: "Maintenance | Edurock - Education LMS Template",
  description: "Maintenance| Edurock - Education LMS Template",
};
const Maintenance = () => {
  return (
    <main>
      <MaintenanceMain />
      <ThemeController />
    </main>
  );
};

export default Maintenance;
