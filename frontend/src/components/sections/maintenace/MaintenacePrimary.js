import Countdown from "@/components/shared/countdown/Countdown";

const MaintenacePrimary = () => {
  return (
    <section>
      <div className="container w-screen h-screen flex flex-col items-center justify-center text-center">
        {/* heading */}
        <div>
          <h5 className="text-size-28 font-bold mb-15px text-blackColor dark:text-blackColor-dark leading-1.2">
            Sorry, We are
          </h5>
          <h1 className="text-size-40 3xl:text-size-100 font-bold mb-15px text-blackColor dark:text-blackColor-dark leading-1.2">
            Under Maintenance
          </h1>
          <p className="text-contentColor dark:text-contentColor-dark">
            {"We're"} currently under maintenance, if all goes as planned{" "}
            {"we'll"} be back in
          </p>
        </div>
        {/* count down  */}
        <Countdown />
      </div>
    </section>
  );
};

export default MaintenacePrimary;
