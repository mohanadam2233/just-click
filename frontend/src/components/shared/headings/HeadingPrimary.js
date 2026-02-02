const HeadingPrimary = ({ children, text }) => {
  return (
    <h3
      className={`text-3xl md:text-[35px] lg:text-size-42 font-bold text-blackColor dark:text-blackColor-dark  ${
        text === "center" ? "text-center" : ""
      }`}
      data-aos="fade-up"
    >
      <span className="inline-block text-3xl md:text-[35px] lg:text-size-42 leading-10  md:leading-45px 2xl:leading-13.5 ">
        {children}
      </span>
    </h3>
  );
};

export default HeadingPrimary;
