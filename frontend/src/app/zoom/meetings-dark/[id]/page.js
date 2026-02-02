import ZoomMeetingDetailsMain from "@/components/layout/main/ZoomMeetingDetailsMain";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import meetings from "@/../public/fakedata/meetings.json";
import { notFound } from "next/navigation";
export const metadata = {
  title: "Zoom Meetings Details - Dark | Edurock - Education LMS Template",
  description:
    "Zoom Meetings Details - Dark | Edurock - Education LMS Template",
};
const Zoom_Meetings_Details_Dark = ({ params }) => {
  const { id } = params;
  const isExistMettings = meetings?.find(({ id: id1 }) => id1 === parseInt(id));
  if (!isExistMettings) {
    notFound();
  }
  return (
    <PageWrapper>
      <main className="is-dark">
        <ZoomMeetingDetailsMain />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};
export async function generateStaticParams() {
  return meetings?.map(({ id }) => ({ id: id.toString() }));
}
export default Zoom_Meetings_Details_Dark;
