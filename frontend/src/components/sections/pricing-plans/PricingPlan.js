import ButtonPrimary from "@/components/shared/buttons/ButtonPrimary";
import Image from "next/image";

const PricingPlan = ({ plan }) => {
  const { name, image, price, moto, features } = plan;
  return (
    <div data-aos="fade-up">
      <div className="p-10 pt-50px transition duration-300 bg-lightGrey10 hover:bg-whiteColor hover:shadow-plan  rounded-lg dark:bg-lightGrey10-dark dark:hover:bg-whiteColor-dark">
        {/* plan pricing */}
        <div className="relative mb-55px">
          <h3 className="text-size-28 font-semibold text-blackColor leading-45px mb-15px uppercase dark:text-blackColor-dark">
            {name}
          </h3>
          <h6 className="text-5xl text-blackColor font-medium mb-15px dark:text-blackColor-dark">
            <span className="text-size-58 pr-1">$</span>
            {price}
            <span className="text-size-22 text-contentColor dark:text-contentColor-dark">
              / month
            </span>
          </h6>
          <p className="text-blackColor dark:text-blackColor-dark">{moto}</p>
          <Image
            className="absolute top-0 right-0 -translate-y-30px"
            src={image}
            alt=""
          />
        </div>
        {/* plan feature */}

        <div>
          <ul className="flex flex-col gap-y-30px mb-30px">
            {features.map(({ name, mark }, idx) => (
              <li key={idx}>
                {mark === "mark" ? (
                  <i className="icofont-check text-whiteColor bg-lightGrey6 px-1 py-3px mr-15px rounded-full text-xs"></i>
                ) : mark === "mark-secondary" ? (
                  <i className="icofont-check text-whiteColor bg-secondaryColor px-1 py-3px mr-15px rounded-full text-xs"></i>
                ) : (
                  <i className="icofont-close text-whiteColor bg-lightGrey6 px-1 py-3px mr-15px rounded-full text-xs"></i>
                )}
                <span className="text-lg text-deepblue font-medium dark:text-deepblue-dark">
                  {name}
                </span>
              </li>
            ))}
          </ul>
        </div>
        {/* plan bottom */}
        <div>
          <ButtonPrimary
            type="button"
            width="full"
            color={name === "basic" ? "secondary" : null}
          >
            Get Started
          </ButtonPrimary>
          <p className="text-size-15 text-contentColor dark:text-contentColor-dark mt-6 text-center font-medium">
            No creadit card required
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPlan;
