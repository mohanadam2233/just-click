const CommentFome = () => {
  return (
    <div className="pt-50px">
      <h4
        className="text-size-26 font-bold text-blackColor dark:text-blackColor-dark mb-30px !leading-30px"
        data-aos="fade-up"
      >
        Write your comment
      </h4>
      <form className="pt-5" data-aos="fade-up">
        <div className="grid grid-cols-1 xl:grid-cols-2 xl:gap-x-30px mb-10 gap-10">
          <input
            type="text"
            placeholder="Enter your name*"
            className="w-full pl-5 bg-transparent text-sm focus:outline-none text-contentColor dark:text-contentColor-dark border border-borderColor2 dark:border-borderColor2-dark placeholder:text-placeholder placeholder:opacity-80 h-15 leading-15 font-medium rounded"
          />
          <input
            type="email"
            placeholder="Enter your email*"
            className="w-full pl-5 bg-transparent text-sm focus:outline-none text-contentColor dark:text-contentColor-dark border border-borderColor2 dark:border-borderColor2-dark placeholder:text-placeholder placeholder:opacity-80 h-15 leading-15 font-medium rounded"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 xl:gap-x-30px mb-10 gap-10">
          <input
            type="text"
            placeholder="Enter your number*"
            className="w-full pl-5 bg-transparent text-sm focus:outline-none text-contentColor dark:text-contentColor-dark border border-borderColor2 dark:border-borderColor2-dark placeholder:text-placeholder placeholder:opacity-80 h-15 leading-15 font-medium rounded"
          />
          <input
            type="text"
            placeholder="Website*"
            className="w-full pl-5 bg-transparent text-sm focus:outline-none text-contentColor dark:text-contentColor-dark border border-borderColor2 dark:border-borderColor2-dark placeholder:text-placeholder placeholder:opacity-80 h-15 leading-15 font-medium rounded"
          />
        </div>

        <textarea
          defaultValue={"Enter your Massage*"}
          className="w-full p-5 mb-2 bg-transparent text-sm text-contentColor dark:text-contentColor-dark border border-borderColor2 dark:border-borderColor2-dark rounded"
          cols="30"
          rows="8"
        />

        <div data-aos="fade-up" className="text-center">
          <input type="checkbox" defaultChecked />{" "}
          <span className="text-size-15 text-contentColor dark:text-contentColor-dark font-medium text-center">
            Save my name, email, and website in this browser for the next time I
            comment.
          </span>
        </div>
        <div className="mt-30px text-center">
          <button
            type="submit"
            className="text-size-15 text-whiteColor bg-primaryColor px-70px py-13px border border-primaryColor hover:text-primaryColor hover:bg-whiteColor inline-block rounded group dark:hover:text-whiteColor dark:hover:bg-whiteColor-dark"
          >
            Post a Comment
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentFome;
