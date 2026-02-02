const HeadingPrimaryXl = ({ children, text, color }) => {
  return (
    <h3
      className={`text-3xl md:text-size-35 lg:text-size-42 2xl:text-size-47 leading-10 md:leading-45px lg:leading-12 2xl:leading-50px font-bold mb-15px   ${
        text === "center" ? "text-center" : ""
      } ${
        color === "white"
          ? "text-whiteColor"
          : "text-blackColor dark:text-blackColor-dark"
      }`}
    >
      {children}
    </h3>
  );
};

export default HeadingPrimaryXl;
