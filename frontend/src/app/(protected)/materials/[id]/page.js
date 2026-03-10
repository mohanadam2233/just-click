import MaterialDetailsMain from "@/components/layout/main/MaterialDetailsMain";
import ThemeController from "@/components/shared/others/ThemeController";

export const metadata = {
  title: "Material Details | CMCP",
  description: "Material Details | CMCP system",
};

const MaterialDetailsPage = ({ params }) => {
  const { id } = params;

  return (
    <main>
      <MaterialDetailsMain id={id} />
      <ThemeController />
    </main>
  );
};

export default MaterialDetailsPage;
