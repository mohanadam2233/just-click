import Image from "next/image";
import vissionImage from "@/assets/images/about/vision.jpg";

const OurVissionContent = () => {
  return (
    <div>
      <p className="text-contentColor dark:text-contentColor-dark mb-25px">
        There are many variations of passages of Lorem Ipsum available, but the
        majority have suffered alteration in some form, by injected humour, or
        randomised words look even slightly believable. If you are going to use
        a passage of Lorem Ipsum, you need to be sure there {" isn't "} anything
        embarrassing hidden in the middle of text. Ipsum generators on the
        Internet tend to repeat predefined chunks as necessary. Lorem ipsum
        dolor sit amet consectetur adipisicing elit. Possimus quae rerum dolore
        itaque tenetur. Natus illum nostrum, deleniti ipsa animi accusantium
        quos placeat eaque.
      </p>
      <ul className="space-y-3 grid grid-cols-1 lg:grid-cols-2 mb-25px">
        <li className="flex items-center group">
          <i className="icofont-check px-2 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
          <p className="text-sm md:text-base font-medium text-blackColor dark:text-blackColor-dark">
            Lorem Ipsum is simply dummy
          </p>
        </li>
        <li className="flex items-center group">
          <i className="icofont-check px-2 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
          <p className="text-sm md:text-base font-medium text-blackColor dark:text-blackColor-dark">
            Explore a variety of fresh educational teach
          </p>
        </li>
        <li className="flex items-center group">
          <i className="icofont-check px-2 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
          <p className="text-sm md:text-base font-medium text-blackColor dark:text-blackColor-dark">
            Lorem Ipsum is simply dummy text of
          </p>
        </li>
        <li className="flex items-center group">
          <i className="icofont-check px-2 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
          <p className="text-sm md:text-base font-medium text-blackColor dark:text-blackColor-dark">
            Lorem Ipsum is simply dummy text of
          </p>
        </li>
        <li className="flex items-center group">
          <i className="icofont-check px-2 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
          <p className="text-sm md:text-base font-medium text-blackColor dark:text-blackColor-dark">
            Lorem Ipsum is simply dummy
          </p>
        </li>
        <li className="flex items-center group">
          <i className="icofont-check px-2 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
          <p className="text-sm md:text-base font-medium text-blackColor dark:text-blackColor-dark">
            Explore a variety of fresh educational teach
          </p>
        </li>
        <li className="flex items-center group">
          <i className="icofont-check px-2 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
          <p className="text-sm md:text-base font-medium text-blackColor dark:text-blackColor-dark">
            Lorem Ipsum is simply dummy text of
          </p>
        </li>
        <li className="flex items-center group">
          <i className="icofont-check px-2 py-2 text-primaryColor bg-whitegrey3 bg-opacity-40 group-hover:bg-primaryColor group-hover:text-white group-hover:opacity-100 mr-15px dark:bg-whitegrey1-dark"></i>
          <p className="text-sm md:text-base font-medium text-blackColor dark:text-blackColor-dark">
            Lorem Ipsum is simply dummy text of
          </p>
        </li>
      </ul>
      <Image src={vissionImage} alt="" className="w-full" placeholder="blur" />
    </div>
  );
};

export default OurVissionContent;
