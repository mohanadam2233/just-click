import EventDetailsMain from "@/components/layout/main/EventDetailsMain";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import events from "@/../public/fakedata/events.json";
import { notFound } from "next/navigation";
export const metadata = {
  title: "Event Details | Edurock - Education LMS Template",
  description: "Event Details | Edurock - Education LMS Template",
};

const Event_details = async ({ params }) => {
  const { id } = params;
  const isExistEvent = events?.find(({ id: id1 }) => id1 === parseInt(id));
  if (!isExistEvent) {
    notFound();
  }
  return (
    <PageWrapper>
      <main>
        <EventDetailsMain />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};
export async function generateStaticParams() {
  return events?.map(({ id }) => ({ id: id.toString() }));
}
export default Event_details;
