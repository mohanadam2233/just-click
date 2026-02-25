import teacherImage1 from "@/assets/images/teacher/teacher__1.png";
import teacherImage2 from "@/assets/images/teacher/teacher__2.png";
import teacherImage3 from "@/assets/images/teacher/teacher__3.png";
import teacherImage4 from "@/assets/images/teacher/teacher__4.png";
import teacherImage5 from "@/assets/images/teacher/teacher__5.png";
import teacherImage6 from "@/assets/images/teacher/teacher__6.png";
import Image from "next/image";

const CoversationPartner = () => {
  const partners = [
    {
      id: 1,
      name: "Rex Allen",
      image: teacherImage1,
      lastMessage: "Hey, How are you?",
      lastSeen: "12 min",
    },
    {
      id: 2,
      name: "Rex Allen",
      image: teacherImage2,
      lastMessage: "Hey, How are you?",
      lastSeen: "12 min",
    },
    {
      id: 3,
      name: "Julia Jhones",
      image: teacherImage3,
      lastMessage: "Hey, How are you?",
      lastSeen: "12 min",
    },
    {
      id: 4,
      name: "Anderson",
      image: teacherImage4,
      lastMessage: "Hey, How are you?",
      lastSeen: "12 min",
    },
    {
      id: 5,
      name: "Rex Allen",
      image: teacherImage5,
      lastMessage: "Hey, How are you?",
      lastSeen: "12 min",
    },
    {
      id: 6,
      name: "Rex Allen",
      image: teacherImage6,
      lastMessage: "Hey, How are you?",
      lastSeen: "12 min",
    },
    {
      id: 7,
      name: "Rex Allen",
      image: teacherImage2,
      lastMessage: "Hey, How are you?",
      lastSeen: "12 min",
    },
    {
      id: 8,
      name: "Julia Jhones",
      image: teacherImage1,
      lastMessage: "Hey, How are you?",
      lastSeen: "12 min",
    },
  ];
  return (
    <div className="xl:col-start-1 xl:col-span-5">
      <div className="bg-whiteColor dark:bg-whiteColor-dark border border-borderColor dark:border-borderColor-dark rounded-lg2 max-h-150 overflow-auto">
        {/* heading */}
        <div className="text-size-22 px-30px py-15px bg-deepgreen dark:bg-deepgreen-dark text-whiteColor dark:text-whiteColor-dark leading-30px font-semibold">
          <h5>Chats</h5>
        </div>
        {/* search participan */}
        <div className="p-30px">
          <form>
            <div className="text-darkdeep4 flex items-center pl-5 border border-borderColor dark:border-borderColor-dark rounded-full">
              <i className="icofont-search-1 text-lg cursor-pointer"></i>
              <input
                type="text"
                placeholder="Search"
                className="w-full px-5 pl-10px py-10px bg-transparent text-sm focus:outline-none placeholder:text-placeholder placeholder:opacity-80 leading-7 font-medium"
              />
            </div>
          </form>
        </div>

        {/* participant list */}
        <ul>
          {partners?.map(({ name, image, lastMessage, lastSeen }, idx) => (
            <li
              key={idx}
              className="border-t border-borderColor dark:border-borderColor-dark"
            >
              <div className="cursor-pointer flex items-center flex-wrap py-15px px-30px max-w-435px w-full">
                {/* avatar */}
                <div className="max-w-50px mr-5 relative">
                  <span className="absolute left-[38px] bottom-0 w-15px h-15px bg-primaryColor border-3px border-whiteColor dark:border-whiteColor-dark rounded-full"></span>
                  <Image
                    src={image}
                    alt=""
                    className="w-full"
                    placeholder="blur"
                  />
                </div>
                {/* details */}
                <div className="flex-grow">
                  <div>
                    <h5 className="text-lg font-medium text-blackColor dark:text-blackColor-dark flex items-center justify-between">
                      <span className="leading-6">{name}</span>

                      <span className="text-sm text-darkdeep4 font-inter leading-6 font-normal">
                        {lastSeen}
                      </span>
                    </h5>
                    <p className="text-sm text-darkdeep4 text-start leading-6">
                      {lastMessage}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CoversationPartner;
