const Reviews5Star = ({ reviews, type }) => {
  return (
    <div
      className={` flex gap-1 text-size-15  items-center justify-start md:justify-end`}
    >
      <i className="icofont-star  text-yellow"></i>
      <i className="icofont-star  text-yellow"></i>
      <i className="icofont-star  text-yellow"></i>
      <i className="icofont-star  text-yellow"></i>
      <i className="icofont-star  text-yellow"></i>
      <span
        className={
          type === "lg"
            ? " text-blackColor dark:text-blackColor-dark"
            : "text-xs text-lightGrey6"
        }
      >
        ({reviews})
      </span>
    </div>
  );
};

export default Reviews5Star;
