import HeadingDashboard from "@/components/shared/headings/HeadingDashboard";
import Image from "next/image";
import Link from "next/link";
import getAllCourses from "@/libs/getAllCourses";
const RecentCourses = () => {
  const courses = getAllCourses(0, 4);

  return (
    <div className="p-10px md:px-10 md:py-50px mb-30px bg-whiteColor dark:bg-whiteColor-dark shadow-accordion dark:shadow-accordion-dark rounded-5 max-h-137.5 overflow-auto">
      <HeadingDashboard path={"/courses"}>Recent Course</HeadingDashboard>
      {/* instrutor */}
      <ul>
        {courses?.map(
          ({ title, id, lesson, insName, duration, image }, idx) => (
            <li
              key={idx}
              className={`flex items-center flex-wrap  ${
                idx === courses?.length - 1
                  ? "pt-5"
                  : "py-5 border-b border-borderColor dark:border-borderColor-dark"
              }`}
            >
              {/* avatar */}
              <div className="w-full md:w-30% md:pr-5">
                <Link className="w-full" href={`/courses/${id}`}>
                  <Image
                    src={image}
                    alt=""
                    className="w-full rounded"
                    placeholder="blur"
                  />
                </Link>
              </div>
              {/* details */}
              <div className="w-full md:w-70% md:pr-5">
                <div>
                  <h5 className="text-lg leading-1.5 font-medium text-contentColor dark:text-contentColor-dark mb-5px">
                    <Link
                      className="hover:text-primaryColor"
                      href={`/courses/${id}`}
                    >
                      {title}
                    </Link>
                  </h5>
                  <div className="flex flex-wrap items-center justify-between text-sm text-darkblack dark:text-darkblack-dark gap-x-15px gap-y-10px leading-1.8">
                    <p>
                      <i className="icofont-teacher"></i> {insName}
                    </p>
                    <p>
                      <i className="icofont-book-alt"></i> {lesson}
                    </p>
                    <p>
                      <i className="icofont-clock-time"></i> {duration}
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

export default RecentCourses;
