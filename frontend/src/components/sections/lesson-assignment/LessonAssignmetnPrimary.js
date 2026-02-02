import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import LessonAccordion from "@/components/shared/lessons/LessonAccordion";

const LessonAssignmetnPrimary = () => {
  return (
    <section>
      <div className="container-fluid-2 py-100px">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-30px">
          {/* assignment left  */}
          <div className="xl:col-start-1 xl:col-span-4" data-aos="fade-up">
            {/* curriculum  */}
            <LessonAccordion />
          </div>
          {/* assignment right  */}
          <div
            className="xl:col-start-5 xl:col-span-8 relative"
            data-aos="fade-up"
          >
            <div>
              <h4 className="text-2xl sm:text-size-28 font-bold leading-1.2 text-blackColor dark:text-blackColor-dark">
                Latest Assignment lists
              </h4>
              <hr className="border-borderColor2 dark:opacity-30 my-4" />
              <div className="overflow-auto">
                <table className="w-full text-left text-nowrap">
                  <thead className="text-sm md:text-base text-blackColor dark:text-blackColor-dark bg-lightGrey5 dark:bg-whiteColor-dark leading-1.8 md:leading-1.8">
                    <tr>
                      <th className="px-5px py-10px md:px-5">
                        Assignment Name
                      </th>
                      <th className="px-5px py-10px md:px-5">Total Marks</th>
                      <th className="px-5px py-10px md:px-5">Total Submit</th>

                      <th className="px-5px py-10px md:px-5"></th>
                    </tr>
                  </thead>
                  <tbody className="text-size-13 md:text-base text-contentColor dark:text-contentColor-dark font-normal">
                    <tr className="leading-1.8 md:leading-1.8">
                      <th className="px-5px py-10px md:px-5 font-normal">
                        <span className="text-blackColor dark:text-blackColor-dark font-bold">
                          Write a the 5
                        </span>
                        <p>
                          course:
                          <a
                            className="text-blackColor dark:text-blackColor-dark"
                            href="#"
                          >
                            Fundamentals
                          </a>
                        </p>
                      </th>
                      <td className="px-5px py-10px md:px-5">
                        <p>80</p>
                      </td>
                      <td className="px-5px py-10px md:px-5">
                        <p>2</p>
                      </td>

                      <td className="px-5px py-10px md:px-5">
                        <div className="dashboard__button__group">
                          <a
                            className="flex items-center gap-1 text-sm font-bold text-whiteColor hover:text-primaryColor bg-primaryColor hover:bg-whiteColor dark:hover:bg-whiteColor-dark border border-primaryColor h-30px w-full px-14px leading-30px justify-center rounded-md my-5px"
                            href="#"
                          >
                            <i className="icofont-download"></i>
                            Download
                          </a>
                        </div>
                      </td>
                    </tr>
                    <tr className="leading-1.8 md:leading-1.8 bg-lightGrey5 dark:bg-whiteColor-dark">
                      <th className="px-5px py-10px md:px-5 font-normal">
                        <span className="text-blackColor dark:text-blackColor-dark font-bold">
                          Write a the 5
                        </span>
                        <p>
                          course:
                          <a
                            className="text-blackColor dark:text-blackColor-dark"
                            href="#"
                          >
                            Fundamentals
                          </a>
                        </p>
                      </th>
                      <td className="px-5px py-10px md:px-5">
                        <p>80</p>
                      </td>
                      <td className="px-5px py-10px md:px-5">
                        <p>2</p>
                      </td>

                      <td className="px-5px py-10px md:px-5">
                        <div className="dashboard__button__group">
                          <a
                            className="flex items-center gap-1 text-sm font-bold text-whiteColor hover:text-primaryColor bg-primaryColor hover:bg-whiteColor dark:hover:bg-whiteColor-dark border border-primaryColor h-30px w-full px-14px leading-30px justify-center rounded-md my-5px"
                            href="#"
                          >
                            <i className="icofont-download"></i>
                            Download
                          </a>
                        </div>
                      </td>
                    </tr>
                    <tr className="leading-1.8 md:leading-1.8">
                      <th className="px-5px py-10px md:px-5 font-normal">
                        <span className="text-blackColor dark:text-blackColor-dark font-bold">
                          Write a the 5
                        </span>
                        <p>
                          course:
                          <a
                            className="text-blackColor dark:text-blackColor-dark"
                            href="#"
                          >
                            Fundamentals
                          </a>
                        </p>
                      </th>
                      <td className="px-5px py-10px md:px-5">
                        <p>80</p>
                      </td>
                      <td className="px-5px py-10px md:px-5">
                        <p>2</p>
                      </td>

                      <td className="px-5px py-10px md:px-5">
                        <div className="dashboard__button__group">
                          <a
                            className="flex items-center gap-1 text-sm font-bold text-whiteColor hover:text-primaryColor bg-primaryColor hover:bg-whiteColor dark:hover:bg-whiteColor-dark border border-primaryColor h-30px w-full px-14px leading-30px justify-center rounded-md my-5px"
                            href="#"
                          >
                            <i className="icofont-download"></i>
                            Download
                          </a>
                        </div>
                      </td>
                    </tr>
                    <tr className="leading-1.8 md:leading-1.8 bg-lightGrey5 dark:bg-whiteColor-dark">
                      <th className="px-5px py-10px md:px-5 font-normal">
                        <span className="text-blackColor dark:text-blackColor-dark font-bold">
                          Write a the 5
                        </span>
                        <p>
                          course:
                          <a
                            className="text-blackColor dark:text-blackColor-dark"
                            href="#"
                          >
                            Fundamentals
                          </a>
                        </p>
                      </th>
                      <td className="px-5px py-10px md:px-5">
                        <p>80</p>
                      </td>
                      <td className="px-5px py-10px md:px-5">
                        <p>2</p>
                      </td>

                      <td className="px-5px py-10px md:px-5">
                        <div className="dashboard__button__group">
                          <a
                            className="flex items-center gap-1 text-sm font-bold text-whiteColor hover:text-primaryColor bg-primaryColor hover:bg-whiteColor dark:hover:bg-whiteColor-dark border border-primaryColor h-30px w-full px-14px leading-30px justify-center rounded-md my-5px"
                            href="#"
                          >
                            <i className="icofont-download"></i>
                            Download
                          </a>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <br />
            <br />
            <div>
              <div>
                <h4 className="text-2xl sm:text-size-28 font-bold leading-1.2 text-blackColor dark:text-blackColor-dark">
                  Assignment Submission
                </h4>
                <hr className="border-borderColor2 dark:opacity-30 my-4" />
                <form>
                  <div className="mb-4">
                    <label
                      className="text-darkBlue dark:text-darkBlue-dark mb-2 block"
                      htmlFor="email"
                    >
                      Email address
                    </label>
                    <input
                      type="text"
                      id="email"
                      placeholder="name@example.com"
                      className="w-full px-3 py-1 bg-transparent focus:outline-none text-darkBlue bg-whiteColor border border-borderColor6 placeholder:opacity-80 focus:shadow-select rounded-md"
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      className="text-darkBlue dark:text-darkBlue-dark mb-2 block"
                      htmlFor="content"
                    >
                      Assignment Content
                    </label>
                    <textarea
                      id="content"
                      className="w-full px-3 py-1 bg-transparent focus:outline-none text-darkBlue bg-whiteColor border border-borderColor6 placeholder:opacity-80 focus:shadow-select rounded-md"
                      cols="30"
                      rows="3"
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      className="text-darkBlue dark:text-darkBlue-dark mb-2 block"
                      htmlFor="file"
                    >
                      Drop file here
                    </label>
                    <input
                      type="file"
                      id="file"
                      className="w-full pr-3 pl-40 py-9px text-xl bg-transparent focus:outline-none text-darkBlue bg-whiteColor border border-borderColor6 placeholder:opacity-80 focus:shadow-select cursor-pointer relative rounded-md file:border-0 file:h-full file:absolute file:top-0 file:left-0 file:border-r file:border-borderColor6 file:border-opacity-30 f file:px-4 file:bg-blue-x-light"
                    />
                  </div>

                  <div>
                    <ButtonPrimary type={"submit"}>
                      Submit Assignment
                    </ButtonPrimary>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LessonAssignmetnPrimary;
