import Image from "next/image";

const CountDashboard = ({ count }) => {
  const { name, data, image, symbol } = count;
  return (
    <div className="p-5 md:px-10 md:py-50px bg-lightGrey5 dark:bg-whiteColor-dark rounded-lg2 shadow-accordion-dark">
      <div className="flex gap-4">
        <div>
          <Image src={image} alt="" />
        </div>
        <div>
          <h3 className="text-size-34 leading-[1.1] text-blackColor font-bold font-hind dark:text-blackColor-dark">
            <span data-countup-number={data}> {data}</span>
            {symbol ? <span>{symbol}</span> : ""}
          </h3>
          <p className="text-blackColor font-medium leading-[18px] dark:text-blackColor-dark">
            {name}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CountDashboard;
