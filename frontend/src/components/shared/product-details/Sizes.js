const Sizes = ({ sizes, size, setSize }) => {
  return (
    <div>
      <p className="leading-1.8 mt-5 mb-7px ">
        Size: <span className="uppercase">{size}</span>
      </p>
      <div className="flex items-center gap-x-5px text-center">
        {sizes?.map((size, idx) => (
          <div key={idx}>
            <button
              onClick={() => setSize(size)}
              className="hover:bg-blackColor dark:hover:bg-blackColor-dark hover:text-whiteColor dark:hover:text-whiteColor-dark border border-borderColor dark:border-borderColor-dark w-10 h-10 leading-10 rounded "
            >
              {size}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sizes;
