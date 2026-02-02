import React from "react";
import MobileAccordion from "./MobileAccordion";

const AccordionEcommerce = () => {
  const items = [
    {
      name: "Shop",
      status: "Online Store",
      path: "/ecommerce/shop",
    },
    {
      name: "Product Details",
      path: "/ecommerce/products/1",
    },
    {
      name: "Cart",
      path: "/ecommerce/cart",
    },
    {
      name: "Checkout",
      path: "/ecommerce/checkout",
    },
    {
      name: "Wishlist",
      path: "/ecommerce/wishlist",
    },
  ];
  return <MobileAccordion items={items} />;
};

export default AccordionEcommerce;
