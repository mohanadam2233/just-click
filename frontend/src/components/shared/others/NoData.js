import React from "react";

const NoData = ({ message }) => {
  return (
    <div className="h-60 md:h-80 w-full flex items-center justify-center text-lg md:text-3xl font-bold text-gray-400">
      {message}
    </div>
  );
};

export default NoData;
