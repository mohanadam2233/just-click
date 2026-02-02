import allMeetings from "@/../public/fakedata/meetings.json";
import ZoomMeeting from "@/components/shared/zoom-meetings/ZoomMeeting";
import getAllMeetings from "@/libs/getAllMeetings";
const ZoomMeetings = () => {
  const meetings = getAllMeetings()?.slice(0, 8);

  return (
    <section>
      <div
        className="container-fluid-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-30px pt-100px pb-100px"
        data-aos="fade-up"
      >
        {meetings?.map((meeting, idx) => (
          <ZoomMeeting key={idx} meeting={meeting} />
        ))}
      </div>
    </section>
  );
};

export default ZoomMeetings;
