import React from "react";
import DropdownPrimary from "./DropdownPrimary";
const DropdownEcommerce = () => {
  const items = [
    {
      name: "Shop",
      status: "Online Store",
      path: "/ecommerce/shop",
      type: "secondary",
    },
    {
      name: "Product Details",
      status: null,
      path: "/ecommerce/products/1",
      type: "secondary",
    },
    {
      name: "Cart",
      status: null,
      path: "/ecommerce/cart",
      type: "secondary",
    },
    {
      name: "Checkout",
      status: null,
      path: "/ecommerce/checkout",
      type: "secondary",
    },
    {
      name: "Wishlist",
      status: null,
      path: "/ecommerce/wishlist",
      type: "secondary",
    },
  ];
  return <DropdownPrimary items={items} />;
};
export default DropdownEcommerce;
