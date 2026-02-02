"use client";
import Image from "next/image";
import Link from "next/link";
import QuantityInput from "../inputs/QuantityInput";
import { useEffect, useState } from "react";
import { useCartContext } from "@/contexts/CartContext";

const CartProduct = ({ product }) => {
  const { id, title, price, quantity: quantity1, image, isCourse } = product;
  const { deleteProductFromCart } = useCartContext();
  const [quantity, setQuantity] = useState(1);
  useEffect(() => {
    if (quantity1 > 0) {
      setQuantity(quantity1);
    }
  }, [quantity1]);
  const totalPrice = quantity * price;
  return product ? (
    <tr className="border-b border-borderColor dark:border-borderColor-dark">
      <td className="py-15px md:py-5 border-r border-borderColor dark:border-borderColor-dark">
        <Link href={`/${isCourse ? "courses" : "ecommerce/products"}/${id}`}>
          <Image
            loading="lazy"
            src={image}
            alt="product-1"
            className="max-w-20 w-full"
          />
        </Link>
      </td>
      <td className="py-15px md:py-5 border-r border-borderColor dark:border-borderColor-dark w-300px">
        <Link
          className="hover:text-primaryColor"
          href={`/${isCourse ? "courses" : "ecommerce/products"}/${id}`}
        >
          {title.length > 30 ? title.slice(0, 30) : title}
        </Link>
      </td>
      <td className="py-15px md:py-5 border-r border-borderColor dark:border-borderColor-dark">
        <span className="amount">${price?.toFixed(2)}</span>
      </td>
      <td className="py-15px md:py-5 border-r border-borderColor dark:border-borderColor-dark w-300px">
        <QuantityInput
          quantity={quantity}
          setQuantity={setQuantity}
          type={"box"}
          product={product}
        />
      </td>
      <td className="py-15px md:py-5 border-r border-borderColor dark:border-borderColor-dark">
        ${totalPrice <= 0 ? "0.00" : totalPrice.toFixed(2)}
      </td>
      <td className="py-15px md:py-5">
        <button className="hover:text-primaryColor mr-0.5 md:mr-1">
          <svg
            width="24"
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 ionicon"
            viewBox="0 0 512 512"
          >
            <title>Pencil</title>
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="32"
              d="M364.13 125.25L87 403l-23 45 44.99-23 277.76-277.13-22.62-22.62zM420.69 68.69l-22.62 22.62 22.62 22.63 22.62-22.63a16 16 0 000-22.62h0a16 16 0 00-22.62 0z"
            ></path>
          </svg>
        </button>
        <button
          onClick={() => deleteProductFromCart(id, title)}
          className="hover:text-primaryColor"
        >
          <svg
            width="25"
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 ionicon"
            viewBox="0 0 512 512"
          >
            <title>Trash</title>
            <path
              d="M112 112l20 320c.95 18.49 14.4 32 32 32h184c17.67 0 30.87-13.51 32-32l20-320"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="32"
            ></path>
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeMiterlimit="10"
              strokeWidth="32"
              d="M80 112h352"
            ></path>
            <path
              d="M192 112V72h0a23.93 23.93 0 0124-24h80a23.93 23.93 0 0124 24h0v40M256 176v224M184 176l8 224M328 176l-8 224"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="32"
            ></path>
          </svg>
        </button>
      </td>
    </tr>
  ) : (
    <p></p>
  );
};

export default CartProduct;
