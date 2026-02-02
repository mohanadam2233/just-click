const CourseTabButton = ({ children, idx, currentIdx, handleTabClick }) => {
  return (
    <button
      onClick={() => handleTabClick(idx)}
      className={`is-checked relative p-10px md:px-25px md:py-15px lg:py-3 2xl:py-15px 2xl:px-45px text-blackColor bg-whiteColor hover:bg-primaryColor hover:text-whiteColor shadow-overview-button dark:bg-whiteColor-dark dark:text-blackColor-dark dark:hover:bg-primaryColor dark:hover:text-whiteColor flex items-center  ${
        idx === currentIdx ? "active" : ""
      }`}
    >
      {children}
    </button>
  );
};

export default CourseTabButton;
