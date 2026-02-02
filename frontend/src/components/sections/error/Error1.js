import errorImage1 from "@/assets/images/icon/error__1.png";
import Image from "next/image";
import Link from "next/link";
const Error1 = () => {
  return (
    <section>
      <div className="container py-100px">
        <div className="w-full lg:max-w-770px lg:mx-auto text-center">
          <Image
            src={errorImage1}
            alt=""
            className="w-full mb-60px"
            placeholder="blur"
          />
          <h3 className="text-size-35 md:text-size-40 lg:text-size-50 leading-10 md:leading-14.5 lg:leading-20 text-blackColor dark:text-blackColor-dark font-bold">
            Oops... It looks like you ‘re lost !
          </h3>
          <p className="text-lg text-contentColor dark:text-contentColor-dark leading-22px">
            Oops! The page you are looking for does not exist. It might have
            been moved or deleted
          </p>
          <div className="mt-50px text-center">
            <Link
              href="/"
              className="text-size-15 font-semibold text-whiteColor bg-primaryColor border border-primaryColor px-43px py-4 hover:text-primaryColor hover:bg-whiteColor rounded inline-block dark:hover:bg-whiteColor-dark dark:hover:text-whiteColor"
            >
              Back To Home <i className="icofont-simple-right"></i>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Error1;
