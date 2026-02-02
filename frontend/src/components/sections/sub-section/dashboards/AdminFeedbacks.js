import HeadingDashboard from "@/components/shared/headings/HeadingDashboard";
import Link from "next/link";

const AdminFeedbacks = () => {
  return (
    <div className="p-10px md:px-10 md:py-50px mb-30px bg-whiteColor dark:bg-whiteColor-dark shadow-accordion dark:shadow-accordion-dark rounded-5 max-h-137.5 overflow-auto">
      <HeadingDashboard path={"/courses"}>Total Feedbacks</HeadingDashboard>
      <div className="overflow-auto">
        <table className="w-full text-left text-nowrap">
          <thead className="text-sm md:text-base text-blackColor dark:text-blackColor-dark bg-lightGrey5 dark:bg-whiteColor-dark leading-1.8 md:leading-1.8">
            <tr>
              <th className="px-5px py-10px md:px-5">Course Name</th>
              <th className="px-5px py-10px md:px-5">Enrolled</th>
              <th className="px-5px py-10px md:px-5">Rating</th>
            </tr>
          </thead>
          <tbody className="text-size-13 md:text-base text-contentColor dark:text-contentColor-dark font-normal">
            <tr className="leading-1.8 md:leading-1.8">
              <th className="px-5px py-10px md:px-5 font-normal">
                <Link href="/courses">Javascript</Link>
              </th>
              <td className="px-5px py-10px md:px-5">
                <p>1100</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <div className="text-primaryColor">
                  {" "}
                  <i className="icofont-star"></i>{" "}
                  <i className="icofont-star"></i>{" "}
                  <i className="icofont-star"></i>{" "}
                  <i className="icofont-star"></i>{" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-star w-14px inline-block"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
              </td>
            </tr>
            <tr className="leading-1.8 md:leading-1.8 bg-lightGrey5 dark:bg-whiteColor-dark">
              <th className="px-5px py-10px md:px-5 font-normal">
                <Link href="/courses">PHP</Link>
              </th>
              <td className="px-5px py-10px md:px-5">
                <p>700</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <div className="text-primaryColor">
                  {" "}
                  <i className="icofont-star"></i>{" "}
                  <i className="icofont-star"></i>{" "}
                  <i className="icofont-star"></i>{" "}
                  <i className="icofont-star"></i>{" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-star w-14px inline-block"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
              </td>
            </tr>
            <tr className="leading-1.8 md:leading-1.8">
              <th className="px-5px py-10px md:px-5 font-normal">
                <Link href="/courses">HTML</Link>
              </th>
              <td className="px-5px py-10px md:px-5">
                <p>1350</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <div className="text-primaryColor">
                  {" "}
                  <i className="icofont-star"></i>{" "}
                  <i className="icofont-star"></i>{" "}
                  <i className="icofont-star"></i>{" "}
                  <i className="icofont-star"></i>{" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-star w-14px inline-block"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
              </td>
            </tr>
            <tr className="leading-1.8 md:leading-1.8 bg-lightGrey5 dark:bg-whiteColor-dark">
              <th className="px-5px py-10px md:px-5 font-normal">
                <Link href="/courses">Graphic</Link>
              </th>
              <td className="px-5px py-10px md:px-5">
                <p>1266</p>
              </td>
              <td className="px-5px py-10px md:px-5">
                <div className="text-primaryColor">
                  {" "}
                  <i className="icofont-star"></i>{" "}
                  <i className="icofont-star"></i>{" "}
                  <i className="icofont-star"></i>{" "}
                  <i className="icofont-star"></i>{" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-star w-14px inline-block"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminFeedbacks;
