"use client";
import Image from "next/image";

const Colors = ({ colors, setColor, color }) => {
  return (
    <div>
      <p className="leading-1.8 mt-5 mb-7px capitalize">Color: {color}</p>
      <div className="flex items-center gap-x-10px">
        {colors?.map(
          ({ image, name }, idx) =>
            idx < 5 && (
              <div
                onClick={() => setColor(name)}
                key={idx}
                className="cursor-pointer border border-borderColor dark:border-borderColor-dark max-w-9 md:max-w-10 lg:max-w-15"
              >
                <Image
                  className="w-full"
                  loading="lazy"
                  alt=""
                  src={image}
                  placeholder="blur"
                />
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default Colors;
