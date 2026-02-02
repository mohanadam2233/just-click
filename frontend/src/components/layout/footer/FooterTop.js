import useIsSecondary from "@/hooks/useIsSecondary";
import FooterTopLeft from "./FooterTopLeft";

const FooterTop = () => {
  const { isSecondary } = useIsSecondary();

  return (
    <section>
      <div
        className={`grid grid-cols-1 md:grid-cols-2 md:gap-y-0 items-center pb-45px border-b border-darkcolor ${
          isSecondary ? "gap-y-5" : "gap-y-30px"
        }`}
      >
        <FooterTopLeft />
        <div data-aos="fade-up">
          <form className="max-w-form-xl md:max-w-form-md lg:max-w-form-lg xl:max-w-form-xl 2xl:max-w-form-2xl bg-deepgray ml-auto rounded relative">
            <input
              type="email"
              placeholder="Enter your email here"
              className="text-whiteColor h-62px pl-15px focus:outline-none border border-deepgray focus:border-whitegrey bg-transparent rounded w-full"
            />
            <button
              type="submit"
              className="px-3 md:px-10px lg:px-5 bg-primaryColor hover:bg-deepgray text-xs lg:text-size-15 text-whiteColor border border-primaryColor block rounded absolute right-0 top-0 h-full"
            >
              Subscribe Now
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default FooterTop;
