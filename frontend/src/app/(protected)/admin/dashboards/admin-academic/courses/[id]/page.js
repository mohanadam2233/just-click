import CourseDetailMain from "@/components/layout/main/dashboards/academic/CourseDetailMain";
import DashboardContainer from "@/components/shared/containers/DashboardContainer";
import ThemeController from "@/components/shared/others/ThemeController";
import DsahboardWrapper from "@/components/shared/wrappers/DsahboardWrapper";

export const metadata = {
  title: "Course Details | Admin Dashboard",
  description: "View and edit course",
};

const CourseDetailPage = ({ params }) => {
  return (
    <DsahboardWrapper>
      <ThemeController />
      <DashboardContainer>
        <CourseDetailMain id={params.id} />
      </DashboardContainer>
    </DsahboardWrapper>
  );
};

export default CourseDetailPage;
