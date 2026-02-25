import Image from "next/image";
import teacherImage1 from "@/assets/images/teacher/teacher__1.png";
import teacherImage2 from "@/assets/images/teacher/teacher__2.png";
import teacherImage3 from "@/assets/images/teacher/teacher__3.png";
import teacherImage4 from "@/assets/images/teacher/teacher__4.png";
import ConversatonSingle from "./ConversatonSingle";

const Conversation = () => {
  const conversations = [
    {
      id: 1,
      image: teacherImage1,
      isCurrentUser: false,
      messages: [
        {
          message: "Lorem ipsum dolor sit amet consectetur adipisicing sed.",
          time: "4:32 PM",
        },
        {
          message: "Dolor sit amet consectetur",
          time: "4:30 PM",
        },
      ],
    },
    {
      id: 2,
      image: teacherImage3,
      isCurrentUser: true,
      messages: [
        {
          message: "Lorem ipsum dolor sit amet consectetur adipisicing sed.",
          time: "4:40 PM",
        },
        {
          message: "Dolor sit amet consectetur",
          time: "4:42 PM",
        },
      ],
    },
    {
      id: 3,
      image: teacherImage4,
      isCurrentUser: false,
      messages: [
        {
          message: "Lorem ipsum dolor sit amet consectetur adipisicing sed.",
          time: "4:40 PM",
        },
        {
          message: "Dolor sit amet consectetur",
          time: "5:03 PM",
        },
      ],
    },
  ];

  return (
    <div className="xl:col-start-6 xl:col-span-7">
      <div className="p-10px bg-whiteColor dark:bg-whiteColor-dark rounded-lg2">
        {/* heading */}
        <div className="flex justify-between items-center pb-10px border-b border-borderColor dark:border-borderColor-dark">
          <div className="flex items-center">
            {/* avatar */}
            <div className="max-w-50px mr-5">
              <Image
                src={teacherImage2}
                alt=""
                className="w-full"
                placeholder="blur"
              />
            </div>
            {/* details */}
            <div className="flex-grow">
              <div>
                <h5 className="text-lg font-medium text-blackColor dark:text-blackColor-dark">
                  <span className="leading-6">Bradshaw</span>
                </h5>
                <p className="text-sm text-darkdeep4 text-start leading-22px">
                  Stay at home, Stay safe
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-10px">
            <a
              href="admin-dashboard.html"
              className="w-10.5 h-10.5 leading-10.5 box-content text-darkdeep4 hover:text-whiteColor hover:bg-primaryColor border border-borderColor dark:border-borderColor-dark rounded-full text-center"
            >
              <i className="icofont-phone"></i>
            </a>
            <a
              href="admin-dashboard.html"
              className="w-10.5 h-10.5 leading-10.5 box-content text-darkdeep4 hover:text-whiteColor hover:bg-primaryColor border border-borderColor dark:border-borderColor-dark rounded-full text-center"
            >
              <i className="icofont-ui-video-chat"></i>
            </a>
          </div>
        </div>

        {/* conversation body */}
        <div className="max-h-125 overflow-y-auto mt-10 flex flex-col-reverse">
          {conversations?.map((details, idx) => (
            <ConversatonSingle key={idx} details={details} />
          ))}
        </div>

        {/* conversation input */}
        <div>
          <form className="flex items-center bg-darkdeep3 dark:bg-darkdeep3-dark pl-30px rounded-full md:mr-30px">
            <div className="h-[150%] block">
              <label
                htmlFor="attachment"
                className="text-darkdeep4 text-xl pr-5 border-r border-darkdeep4 border-opacity-20 dark:border-blue-light2 h-full block py-9px"
              >
                <i
                  className="icofont-attachment attachment"
                  aria-hidden="true"
                ></i>
              </label>
              <input
                id="attachment"
                type="file"
                className="hidden w-full pl-5 py-10px bg-transparent text-sm focus:outline-none placeholder:text-placeholder placeholder:opacity-80 leading-7 font-medium"
              />
            </div>
            <div className="flex-grow">
              <input
                type="text"
                placeholder="Type somthing"
                className="w-full pl-5 py-10px text-darkdeep4 bg-transparent text-sm focus:outline-none placeholder:text-placeholder placeholder:opacity-80 leading-7 font-medium"
              />
            </div>
            <div className="flex-shrink-0">
              <button className="w-50px h-50px leading-50px bg-primaryColor text-whiteColor rounded-full">
                <i className="icofont-arrow-right text-xl"></i>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Conversation;
