const HeadingXl = ({ children, color }) => {
  return (
    <h1
      className={`text-size-35 md:text-size-65 lg:text-5xl 2xl:text-size-65 leading-42px md:leading-18 lg:leading-15 2xl:leading-18  md:tracking-half lg:tracking-normal 2xl:tracking-half font-bold mb-15px ${
        color === "white"
          ? "text-whiteColor"
          : "text-blackColor dark:text-blackColor-dark"
      }`}
    >
      {children}
    </h1>
  );
};

export default HeadingXl;
