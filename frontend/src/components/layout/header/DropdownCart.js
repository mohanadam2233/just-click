"use client";
import Image from "next/image";
import DropdownWrapperSecondary from "@/components/shared/wrappers/DropdownWrapperSecondary";
import DropdownContainerSecondary from "@/components/shared/containers/DropdownContainerSecondary";
import Link from "next/link";
import countTotalPrice from "@/libs/countTotalPrice";
import useIsTrue from "@/hooks/useIsTrue";
import { useCartContext } from "@/contexts/CartContext";
const DropdownCart = ({ isHeaderTop }) => {
  const { cartProducts, deleteProductFromCart } = useCartContext();

  // calculate total price
  const totalPrice = countTotalPrice(cartProducts);
  const isHome4 = useIsTrue("/home-4");
  const isHome4Dark = useIsTrue("/home-4-dark");
  const isHome5 = useIsTrue("/home-5");
  const isHome5Dark = useIsTrue("/home-5-dark");
  const totalProduct = cartProducts?.length;
  return (
    <>
      <Link
        href="/ecommerce/cart"
        className={`relative ${
          isHeaderTop
            ? "block"
            : isHome4 || isHome4Dark || isHome5 || isHome5Dark
            ? "block lg:hidden"
            : "block"
        }`}
      >
        <i className="icofont-cart-alt text-2xl text-blackColor group-hover:text-secondaryColor transition-all duration-300 dark:text-blackColor-dark"></i>
        <span
          className={`${
            totalProduct < 10 ? "px-1 py-[2px]" : "px-3px pb-1 pt-3px"
          } absolute -top-1 2xl:-top-[5px] -right-[10px] lg:right-3/4 2xl:-right-[10px] text-[10px] font-medium text-white dark:text-whiteColor-dark bg-secondaryColor leading-1 rounded-full z-50 block`}
        >
          {totalProduct}
        </span>
      </Link>
      <DropdownWrapperSecondary isHeaderTop={isHeaderTop}>
        <DropdownContainerSecondary>
          <ul className="flex flex-col max-h-68 gap-y-5 pb-5 mb-30px border-b border-borderColor dark:border-borderColor-dark overflow-y-auto">
            {!cartProducts?.length ? (
              <div className="min-h-14 flex items-center justify-center text-center">
                <p className="text-contentColor dark:text-contentColor-dark font-semibold opacity-55">
                  Empty
                </p>
              </div>
            ) : (
              cartProducts.map(
                ({ id, title, image, price, quantity, isCourse }, idx) => (
                  <li
                    key={idx}
                    className="relative flex gap-x-15px items-center"
                  >
                    <Link
                      href={`/${
                        isCourse ? "courses" : "ecommerce/products"
                      }/${id}`}
                    >
                      <Image
                        prioriy="false"
                        placeholder="blur"
                        src={image}
                        alt="photo"
                        className="w-card-img py-[3px]"
                      />
                    </Link>
                    <div>
                      <Link
                        href={`/${
                          isCourse ? "courses" : "ecommerce/products"
                        }/${id}`}
                        className="text-sm text-darkblack hover:text-secondaryColor leading-5 block pb-2 capitalize dark:text-darkblack-dark dark:hover:text-secondaryColor"
                      >
                        {title.length > 16 ? title.slice(0, 16) : title}
                      </Link>
                      <p className="text-sm text-darkblack leading-5 block pb-5px dark:text-darkblack-dark">
                        {quantity} x{" "}
                        <span className="text-secondaryColor">
                          ${price.toFixed(2)}
                        </span>
                      </p>
                    </div>

                    <button
                      onClick={() => deleteProductFromCart(id, title)}
                      className="absolute block top-0 right-0 text-base text-contentColor leading-1 hover:text-secondaryColor dark:text-contentColor-dark dark:hover:text-secondaryColor"
                    >
                      <i className="icofont-close-line"></i>
                    </button>
                  </li>
                )
              )
            )}
          </ul>

          {/* total price */}

          <div>
            <p className="text-size-17 text-contentColor dark:text-contentColor-dark pb-5 flex justify-between">
              Total Price:
              <span className="font-bold text-secondaryColor">
                ${totalPrice.toFixed(2)}
              </span>
            </p>
          </div>

          {/* action buttons */}
          <div className="flex flex-col gap-y-5">
            <Link
              href="/ecommerce/cart"
              className="text-sm font-bold text-contentColor dark:text-contentColor-dark hover:text-whiteColor hover:bg-secondaryColor text-center py-10px border border-secondaryColor"
            >
              View Cart
            </Link>
            <Link
              href="/ecommerce/checkout"
              className="text-sm font-bold bg-darkblack dark:bg-darkblack-dark text-whiteColor dark:text-whiteColor-dark hover:bg-secondaryColor dark:hover:bg-secondaryColor text-center py-10px"
            >
              Checkout
            </Link>
          </div>
        </DropdownContainerSecondary>
      </DropdownWrapperSecondary>
    </>
  );
};

export default DropdownCart;
