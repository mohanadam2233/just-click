import Image from "next/image";
import Link from "next/link";
let idx = -1;
let cidx = 0;
const ZoomMeeting = ({ meeting }) => {
  const {
    id,
    title,
    image,
    speakerName,
    speakerImage,
    date,
    startingTime,
    duration,
    department,
  } = meeting;
  const depBgs = [
    "bg-secondaryColor",
    "bg-blue",
    "bg-secondaryColor2",
    "bg-greencolor2",
    "bg-orange",
    "bg-yellow",
  ];

  idx = (idx + 1) % depBgs.length;
  cidx = id;
  cidx = cidx % 6 ? cidx % 6 : 6;
  return (
    <div className="group" data-aos="fade-up">
      <div>
        <div className="p-15px bg-whiteColor shadow-brand dark:bg-darkdeep3-dark dark:shadow-brand-dark">
          {/* card image  */}
          <div className="relative mb-4 overflow-hidden">
            <Link href={`/zoom/meetings/${id}`} className="w-full">
              <Image
                src={image}
                alt=""
                className="w-full transition-all duration-300 group-hover:scale-110"
                placeholder="blur"
              />
            </Link>
            <div className="absolute left-0 top-1 flex justify-between w-full items-center px-2">
              <div>
                <p
                  className={`text-xs text-whiteColor px-4 py-[3px]  rounded font-semibold ${depBgs[idx]}`}
                >
                  {department}
                </p>
              </div>
              <Link
                className="text-white bg-black bg-opacity-15 rounded hover:bg-primaryColor"
                href={`/zoom/meetings/${id}`}
              >
                <i className="icofont-heart-alt text-base py-1 px-2"></i>
              </Link>
            </div>
          </div>
          {/* card content  */}
          <div>
            <div className="flex flex-wrap justify-between items-center mb-15px">
              <div className="flex items-center">
                <div>
                  <i className="icofont-calendar pr-5px text-primaryColor text-lg"></i>
                </div>
                <div>
                  <span className="text-sm text-black dark:text-blackColor-dark">
                    {date}
                  </span>
                </div>
              </div>
              <div className="flex items-center">
                <div>
                  <i className="icofont-clock-time pr-5px text-primaryColor text-lg"></i>
                </div>
                <div>
                  <span className="text-sm text-black dark:text-blackColor-dark">
                    {duration}
                  </span>
                </div>
              </div>
            </div>
            <Link
              href={`/zoom/meetings/${id}`}
              className="text-lg md:text-size-22 font-semibold text-blackColor mb-10px font-hind dark:text-blackColor-dark hover:text-primaryColor dark:hover:text-primaryColor"
            >
              {title}
            </Link>
            {/* time  */}
            <p className="text-sm text-contentColor dark:text-contentColor-dark flex items-center">
              Starting Time:
              <span className="text-xl md:text-size-26 leading-9 md:leading-12 font-bold text-primaryColor ml-10px">
                {startingTime}
              </span>
            </p>
            {/* time  */}
            <p className="text-sm text-contentColor dark:text-contentColor-dark flex items-center mb-15px">
              Meeting ID :
              <span className="text-sm md:text-lg leading-9 md:leading-12 font-bold text-secondaryColor ml-10px">
                {id}
              </span>
            </p>
            {/* author and rating */}
            <div className="pt-15px border-t border-borderColor">
              <div>
                <Link
                  href={`/instructors/${cidx}`}
                  className="text-xs flex items-center text-contentColor hover:text-primaryColor dark:text-contentColor-dark dark:hover:text-primaryColor"
                >
                  <Image
                    className="w-50px h-50px rounded-full mr-15px"
                    src={speakerImage}
                    alt=""
                  />
                  <div>
                    <span>Speaker:</span>
                    <h3 className="text-lg font-bold text-blackColor dark:text-blackColor-dark">
                      {speakerName}
                    </h3>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoomMeeting;
