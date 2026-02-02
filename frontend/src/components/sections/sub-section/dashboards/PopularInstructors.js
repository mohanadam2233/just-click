import teacherImage1 from "@/assets/images/teacher/teacher__1.png";
import teacherImage2 from "@/assets/images/teacher/teacher__2.png";
import teacherImage3 from "@/assets/images/teacher/teacher__3.png";
import teacherImage4 from "@/assets/images/teacher/teacher__4.png";
import teacherImage5 from "@/assets/images/teacher/teacher__5.png";
import HeadingDashboard from "@/components/shared/headings/HeadingDashboard";
import Image from "next/image";
import Link from "next/link";

const PopularInstructors = () => {
  const instructors = [
    {
      id: 1,
      name: "Sanki Jho",
      avatar: teacherImage1,
      reviews: "25,895",
      students: "692",
      courses: "15",
    },
    {
      id: 2,
      name: "Nidmjae Mollin",
      avatar: teacherImage2,
      reviews: "21,895",
      students: "95",
      courses: "10",
    },
    {
      id: 3,
      name: "Nidmjae Mollin",
      avatar: teacherImage3,
      reviews: "17,895",
      students: "325",
      courses: "20",
    },
    {
      id: 4,
      name: "Sndi Jac",
      avatar: teacherImage4,
      reviews: "17,895",
      students: "325",
      courses: "45",
    },
    {
      id: 5,
      name: "Sndi Jac",
      avatar: teacherImage5,
      reviews: "17,895",
      students: "325",
      courses: "45",
    },
  ];
  return (
    <div className="p-10px md:px-10 md:py-50px mb-30px bg-whiteColor dark:bg-whiteColor-dark shadow-accordion dark:shadow-accordion-dark rounded-5 max-h-137.5 overflow-auto">
      <HeadingDashboard path={`/instructors`}>
        Popular Instructor
      </HeadingDashboard>

      {/* instrutor */}
      <ul>
        {instructors?.map(
          ({ id, name, avatar, reviews, students, courses }, idx) => (
            <li
              key={idx}
              className={`flex items-center flex-wrap  ${
                idx === instructors?.length - 1
                  ? "pt-15px"
                  : "py-15px border-b border-borderColor dark:border-borderColor-dark"
              }`}
            >
              {/* avatar */}
              <div className="max-w-full md:max-w-1/5 pr-10px">
                <Image src={avatar} alt="" className="w-full rounded-full" />
              </div>
              {/* details */}
              <div className="max-w-full md:max-w-4/5 pr-10px">
                <div>
                  <h5 className="text-lg leading-1 font-bold text-contentColor dark:text-contentColor-dark mb-5px">
                    <Link
                      className="hover:text-primaryColor"
                      href={`/instructors/${id}`}
                    >
                      {name}
                    </Link>
                  </h5>
                  <div className="flex flex-wrap items-center text-sm text-darkblack dark:text-darkblack-dark gap-x-15px gap-y-10px leading-1.8">
                    <p>
                      <i className="icofont-chat"></i> {reviews} Reviews
                    </p>
                    <p>
                      <i className="icofont-student-alt"></i> {students}{" "}
                      Students
                    </p>
                    <p>
                      <i className="icofont-video-alt"></i> {courses}+ Courses
                    </p>
                  </div>
                </div>
              </div>
            </li>
          )
        )}
      </ul>
    </div>
  );
};

export default PopularInstructors;
