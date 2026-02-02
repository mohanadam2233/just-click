import allMeetings from "@/../public/fakedata/meetings.json";
import zoomImage1 from "@/assets/images/zoom/1.jpg";
import zoomImage2 from "@/assets/images/zoom/2.jpg";
import zoomImage3 from "@/assets/images/zoom/3.jpg";
import zoomImage4 from "@/assets/images/zoom/4.jpg";
import zoomImage5 from "@/assets/images/zoom/5.jpg";
import zoomImage6 from "@/assets/images/zoom/6.jpg";
import zoomImage7 from "@/assets/images/zoom/7.jpg";
import zoomImage8 from "@/assets/images/zoom/8.jpg";
import zoomSpeakerImage1 from "@/assets/images/grid/grid_small_1.jpg";
import zoomSpeakerImage2 from "@/assets/images/grid/grid_small_2.jpg";
import zoomSpeakerImage3 from "@/assets/images/grid/grid_small_3.jpg";
import zoomSpeakerImage4 from "@/assets/images/grid/grid_small_4.jpg";
import zoomSpeakerImage5 from "@/assets/images/grid/grid_small_5.jpg";
const getAllMeetings = () => {
  const images = [
    zoomImage1,
    zoomImage2,
    zoomImage3,
    zoomImage4,
    zoomImage5,
    zoomImage6,
    zoomImage7,
    zoomImage8,
  ];
  const speakerImages = [
    zoomSpeakerImage1,
    zoomSpeakerImage2,
    zoomSpeakerImage3,
    zoomSpeakerImage4,
    zoomSpeakerImage4,
    zoomSpeakerImage5,
    zoomSpeakerImage4,
    zoomSpeakerImage1,
  ];
  const meetings = allMeetings?.map((meeting, idx) => ({
    ...meeting,
    image: images[idx],
    speakerImage: speakerImages[idx],
  }));
  return meetings;
};

export default getAllMeetings;
