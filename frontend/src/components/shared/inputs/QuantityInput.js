"use client";

import { useCartContext } from "@/contexts/CartContext";

const QuantityInput = ({ quantity, setQuantity, type, product }) => {
  const { addProductToCart } = useCartContext();
  const isQuantiy = quantity > 1;
  return (
    <div
      className={`max-w-150px h-55px leading-55px border-2 border-borderColor2 dark:border-borderColor2-dark  relative overflow-hidden ${
        type === "box" ? "inline-block" : "rounded-full"
      }`}
    >
      <input
        type="number"
        value={quantity}
        className={`w-full focus:outline-none bg-transparent text-center ${
          type === "box" ? "" : "rounded-full"
        } `}
        onChange={(e) => {
          const value = parseInt(e.target.value);

          if (value) {
            setQuantity(value);
            if (type === "box") {
              addProductToCart({ ...product, quantity: value }, false, true);
            }
          } else {
            setQuantity(1);
            if (type === "box") {
              addProductToCart({ ...product, quantity: 1 }, false, true);
            }
          }
        }}
      />
      <div>
        <button
          className={`absolute left-[10px] top-1/2 -translate-y-1/2 text-blackColor dark:text-blackColor-dark p-x-10px leading-1.8 w-5 inline-block ${
            isQuantiy ? "" : "opacity-50 "
          }`}
          onClick={() => {
            setQuantity(isQuantiy ? quantity - 1 : 1);
            type === "box" && isQuantiy
              ? addProductToCart({ ...product, quantity: 1 }, true)
              : () => {};
          }}
        >
          -
        </button>
        <button
          className=" absolute top-1/2 -translate-y-1/2 right-[10px] text-blackColor dark:text-blackColor-dark p-x-10px leading-1.8 w-5 inline-block"
          onClick={() => {
            setQuantity(quantity + 1);

            type === "box"
              ? addProductToCart({ ...product, quantity: 1 })
              : () => {};
          }}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default QuantityInput;
