const TabButtonSecondary = ({
  name,
  handleTabClick,
  idx,
  currentIdx,
  button,
}) => {
  return (
    <button
      onClick={() => handleTabClick(idx)}
      className={`${
        button === "icon"
          ? `inline-block hover:text-primaryColor ${
              idx === currentIdx ? "text-primaryColor" : ""
            }`
          : `relative py-10px ${
              button === "small"
                ? "px-5 md:py-15px lg:px-10 text-sm lg:text-base leading-sm lg:leading-lg"
                : "px-25px md:py-10px md:px-10 lg:py-15px lg:px-60px"
            }   font-bold uppercase text-blackColor bg-whiteColor shadow-overview-button dark:bg-whiteColor-dark dark:text-blackColor-dark whitespace-nowrap before:w-0 ${
              idx === currentIdx ? "before:w-full" : "before:w-0"
            } before:h-0.5 before:absolute before:-bottom-0.5 lg:before:bottom-0 before:left-0 before:bg-primaryColor hover:before:w-full before:transition-all before:duration-300 `
      } whitespace-nowrap`}
    >
      {name}
    </button>
  );
};

export default TabButtonSecondary;
