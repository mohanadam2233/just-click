import Image from "next/image";
import Link from "next/link";
import getAllCourses from "@/libs/getAllCourses";
import getAllInstructors from "@/libs/getAllInstructors";

const InstructorContent = ({ id }) => {
  const { image, desig } = getAllInstructors()?.find(
    ({ id: idx }) => idx === id
  );
  const { insName } = getAllCourses()?.find(({ id: idx }) => idx === id);

  return (
    <div>
      <div
        className="p-5 md:p-30px lg:p-5 2xl:p-30px mb-30px flex flex-col md:flex-row shadow-autor"
        data-aos="fade-up"
      >
        {/* athor avatar  */}
        <div className="flex mb-30px mr-5 flex-shrink-0">
          <Image
            src={image}
            alt=""
            className="w-24 h-24 rounded-full"
            placeholder="blur"
          />
        </div>
        <div>
          {/* author name  */}
          <div className="mb-3">
            <h3 className="mb-7px">
              <Link
                href={`/instructors/${id}`}
                className="text-xl font-bold text-blackColor2 dark:text-blackColor2-dark hover:text-primaryColor dark:hover:text-primaryColor"
              >
                {insName ? insName : "Rosalina D. Willaim"}
              </Link>
            </h3>
            <p className="text-xs text-contentColor2 dark:text-contentColor2-dark">
              Blogger/Photographer
            </p>
          </div>
          {/* description  */}
          <p className="text-sm text-contentColor dark:text-contentColor-dark mb-15px leading-26px">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the
            {"industry's"} standard dummy text ever since the 1500s, when an
            unknown printer took a galley
          </p>
          {/* social  */}
          <div>
            <ul className="flex gap-10px items-center">
              <li>
                <a
                  href="https://www.facebook.com/"
                  className="w-35px h-35px leading-35px text-center border border-borderColor2 text-contentColor hover:text-whiteColor hover:bg-primaryColor dark:text-contentColor-dark dark:hover:text-whiteColor dark:hover:bg-primaryColor dark:border-borderColor2-dark rounded"
                >
                  <i className="icofont-facebook"></i>
                </a>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/"
                  className="w-35px h-35px leading-35px text-center border border-borderColor2 text-contentColor hover:text-whiteColor hover:bg-primaryColor dark:text-contentColor-dark dark:hover:text-whiteColor dark:hover:bg-primaryColor dark:border-borderColor2-dark rounded"
                >
                  <i className="icofont-youtube-play"></i>
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/"
                  className="w-35px h-35px leading-35px text-center border border-borderColor2 text-contentColor hover:text-whiteColor hover:bg-primaryColor dark:text-contentColor-dark dark:hover:text-whiteColor dark:hover:bg-primaryColor dark:border-borderColor2-dark rounded"
                >
                  <i className="icofont-instagram"></i>
                </a>
              </li>
              <li>
                <a
                  href="https://x.com/"
                  className="w-35px h-35px leading-35px text-center border border-borderColor2 text-contentColor hover:text-whiteColor hover:bg-primaryColor dark:text-contentColor-dark dark:hover:text-whiteColor dark:hover:bg-primaryColor dark:border-borderColor2-dark rounded"
                >
                  <i className="icofont-twitter"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorContent;
