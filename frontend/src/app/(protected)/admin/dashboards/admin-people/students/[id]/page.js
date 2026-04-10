import StudentDetailMain from "@/components/layout/main/dashboards/people/StudentDetailMain";
import DashboardContainer from "@/components/shared/containers/DashboardContainer";
import ThemeController from "@/components/shared/others/ThemeController";
import DsahboardWrapper from "@/components/shared/wrappers/DsahboardWrapper";

export const metadata = {
  title: "Student Details | Admin Dashboard",
  description: "View student details",
};

const StudentDetailPage = ({ params }) => {
  return (
    <DsahboardWrapper>
      <ThemeController />
      <DashboardContainer>
        <StudentDetailMain id={params.id} />
      </DashboardContainer>
    </DsahboardWrapper>
  );
};

export default StudentDetailPage;
