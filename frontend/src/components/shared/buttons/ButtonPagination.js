"use client";

const ButtonPagination = ({
  id,
  idx,
  type,
  limit,
  skip,
  totalItems,
  handlePagesnation,
  currentPage,
}) => {
  return (
    <button
      onClick={() => handlePagesnation(idx)}
      className={`w-10 h-10 leading-10 md:w-50px md:h-50px md:leading-50px text-center disabled:cursor-not-allowed disabled:opacity-50  ${
        idx === currentPage
          ? "bg-primaryColor text-whiteColor  dark:hover:bg-primaryColor"
          : "text-blackColor2  bg-whitegrey1  dark:text-blackColor2-dark  dark:bg-whitegrey1-dark "
      } hover:text-whiteColor hover:bg-primaryColor dark:hover:text-whiteColor dark:hover:bg-primaryColor`}
      disabled={
        type === "prev" && !skip
          ? true
          : type === "next" && skip + limit >= totalItems
          ? true
          : false
      }
    >
      {type === "prev" ? (
        <i className="icofont-double-left"></i>
      ) : type === "next" ? (
        <i className="icofont-double-right"></i>
      ) : (
        id
      )}
    </button>
  );
};

export default ButtonPagination;
