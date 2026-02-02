import allInstructors from "@/../../public/fakedata/instructors.json";
import teacherImag1 from "@/assets/images/teacher/teacher__1.png";
import teacherImag2 from "@/assets/images/teacher/teacher__2.png";
import teacherImag3 from "@/assets/images/teacher/teacher__3.png";
import teacherImag4 from "@/assets/images/teacher/teacher__4.png";
import teacherImag5 from "@/assets/images/teacher/teacher__5.png";
import teacherImag6 from "@/assets/images/teacher/teacher__6.png";
import teacherImagLg1 from "@/assets/images/team/1.png";
import teacherImagLg2 from "@/assets/images/team/2.png";
import teacherImagLg3 from "@/assets/images/team/3.png";
import teacherImagLg4 from "@/assets/images/team/4.png";
import teacherImagLg5 from "@/assets/images/team/5.png";
import teacherImagLg6 from "@/assets/images/team/6.png";
const getAllInstructors = () => {
  const images = [
    teacherImag1,
    teacherImag2,
    teacherImag3,
    teacherImag4,
    teacherImag5,
    teacherImag6,
  ];
  const imagesLgs = [
    teacherImagLg1,
    teacherImagLg2,
    teacherImagLg3,
    teacherImagLg4,
    teacherImagLg5,
    teacherImagLg6,
  ];
  const instrutors = allInstructors?.slice(0, 6).map((instructor, idx) => ({
    ...instructor,
    image: images[idx],
    imageLg: imagesLgs[idx],
  }));
  return instrutors;
};
export default getAllInstructors;
