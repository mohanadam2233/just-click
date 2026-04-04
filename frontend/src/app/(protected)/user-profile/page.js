import UserProfileMain from "@/components/layout/main/dashboards/UserProfileMain";
import ThemeController from "@/components/shared/others/ThemeController";

export const metadata = {
  title: "Admin Profile",
  description: "Admin Profile",
};

const AdminProfilePage = () => {
  return (
    <main>
      <section className="py-30px md:py-10">
        <div className="container">
          <UserProfileMain role="admin" />
        </div>
      </section>
      <ThemeController />
    </main>
  );
};

export default AdminProfilePage;
