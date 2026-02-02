import allCourses from "@/../public/fakedata/courses.json";
import gridImage1 from "@/assets/images/grid/grid_1.png";
import gridImage2 from "@/assets/images/grid/grid_2.png";
import gridImage3 from "@/assets/images/grid/grid_3.png";
import gridImage4 from "@/assets/images/grid/grid_4.png";
import gridImage5 from "@/assets/images/grid/grid_5.png";
import gridImage6 from "@/assets/images/grid/grid_6.png";
import gridImage7 from "@/assets/images/grid/grid_7.png";
import gridImage8 from "@/assets/images/grid/grid_8.png";
import gridImage9 from "@/assets/images/grid/grid_9.png";
import gridImage10 from "@/assets/images/grid/kid_1.jpg";
import gridImage11 from "@/assets/images/grid/kid_2.jpg";
import gridImage12 from "@/assets/images/grid/kid_3.jpg";
import gridImage13 from "@/assets/images/grid/kid_4.jpg";
import gridImage14 from "@/assets/images/grid/kid_5.jpg";
import gridImage15 from "@/assets/images/grid/kid_6.jpg";
import gridImage16 from "@/assets/images/grid/kid_6.jpg";
import gridSmallImg1 from "@/assets/images/grid/grid_small_1.jpg";
import gridSmallImg2 from "@/assets/images/grid/grid_small_2.jpg";
import gridSmallImg3 from "@/assets/images/grid/grid_small_3.jpg";
import gridSmallImg4 from "@/assets/images/grid/grid_small_4.jpg";
import gridSmallImg5 from "@/assets/images/grid/grid_small_5.jpg";

const getAllCourses = () => {
  const images = [
    gridImage1,
    gridImage2,
    gridImage3,
    gridImage4,
    gridImage5,
    gridImage6,
    gridImage7,
    gridImage8,
    gridImage9,
    gridImage10,
    gridImage11,
    gridImage12,
    gridImage13,
    gridImage14,
    gridImage15,
    gridImage16,
    gridImage2,
    gridImage3,
    gridImage4,
    gridImage5,
    gridImage6,
    gridImage7,
    gridImage8,
    gridImage9,
    gridImage10,
    gridImage11,
    gridImage12,
    gridImage13,
    gridImage14,
    gridImage15,
    gridImage1,
    gridImage2,
    gridImage3,
    gridImage4,
    gridImage5,
    gridImage6,
    gridImage7,
    gridImage8,
    gridImage9,
    gridImage10,
    gridImage11,
    gridImage12,
    gridImage13,
    gridImage14,
    gridImage15,
    gridImage1,
    gridImage2,
    gridImage3,
    gridImage4,
    gridImage5,
    gridImage6,
    gridImage7,
    gridImage8,
    gridImage9,
  ];
  const insImages = [
    gridSmallImg1,
    gridSmallImg2,
    gridSmallImg3,
    gridSmallImg4,
    gridSmallImg5,
    gridSmallImg5,
    gridSmallImg1,
    gridSmallImg2,
    gridSmallImg1,
    gridSmallImg4,
    gridSmallImg5,
    gridSmallImg5,
    gridSmallImg1,
    gridSmallImg2,
    gridSmallImg1,
    gridSmallImg1,
    gridSmallImg2,
    gridSmallImg3,
    gridSmallImg4,
    gridSmallImg5,
    gridSmallImg5,
    gridSmallImg1,
    gridSmallImg2,
    gridSmallImg1,
    gridSmallImg4,
    gridSmallImg5,
    gridSmallImg5,
    gridSmallImg1,
    gridSmallImg2,
    gridSmallImg1,
    gridSmallImg1,
    gridSmallImg2,
    gridSmallImg3,
    gridSmallImg4,
    gridSmallImg5,
    gridSmallImg5,
    gridSmallImg1,
    gridSmallImg2,
    gridSmallImg1,
    gridSmallImg4,
    gridSmallImg5,
    gridSmallImg5,
    gridSmallImg1,
    gridSmallImg2,
    gridSmallImg1,
    gridSmallImg1,
    gridSmallImg2,
    gridSmallImg3,
    gridSmallImg4,
    gridSmallImg5,
    gridSmallImg5,
    gridSmallImg1,
    gridSmallImg2,
    gridSmallImg1,
  ];
  const courses = [...allCourses]?.map((course, idx) => ({
    ...course,

    image: images[idx],
    insImg: insImages[idx],
  }));

  return courses;
};

export default getAllCourses;
