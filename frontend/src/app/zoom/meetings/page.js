import ZoomMeetingsMain from "@/components/layout/main/ZoomMeetingsMain";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";

export const metadata = {
  title: "Zoom Meetings | Edurock - Education LMS Template",
  description: "Zoom Meetings | Edurock - Education LMS Template",
};
const Zoom_Meetings = () => {
  return (
    <PageWrapper>
      <main>
        <ZoomMeetingsMain />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};

export default Zoom_Meetings;
