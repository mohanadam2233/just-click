"use client";

import useNotify from "@/hooks/useNotify";
import addItemsToLocalstorage from "@/libs/addItemsToLocalstorage";
import getAllProducts from "@/libs/getAllProducts";
import getItemsFromLocalstorage from "@/libs/getItemsFromLocalstorage";
import { createContext, useContext, useEffect, useState } from "react";

const wishlistContext = createContext(null);

const WishlistContextProvider = ({ children }) => {
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const notify = useNotify();

  useEffect(() => {
    const demoProducts = getAllProducts()
      ?.slice(0, 2)
      ?.map((product) => ({
        ...product,
        quantity: 1,
      }));

    const wishlistProductFromLocalStorage =
      getItemsFromLocalstorage("wishlist");

    if (!wishlistProductFromLocalStorage) {
      setWishlistProducts(demoProducts || []);
      addItemsToLocalstorage("wishlist", demoProducts || []);
    } else {
      setWishlistProducts(wishlistProductFromLocalStorage);
    }
  }, []);

  const addProductToWishlist = (currentProduct) => {
    const { id: currentId, title: currentTitle } = currentProduct;

    const alreadyExists = wishlistProducts?.some(
      ({ id, title }) => id === currentId && title === currentTitle,
    );

    if (alreadyExists) {
      notify.error("Already exists in wishlist.");
      return;
    }

    const currentProducts = [...wishlistProducts, currentProduct];
    setWishlistProducts(currentProducts);
    addItemsToLocalstorage("wishlist", currentProducts);

    notify.success("Added to wishlist.");
  };

  const deleteProductFromWishlist = (currentId, currentTitle) => {
    const currentProducts = wishlistProducts?.filter(
      ({ id, title }) => id !== currentId || title !== currentTitle,
    );

    setWishlistProducts(currentProducts);
    addItemsToLocalstorage("wishlist", currentProducts);

    notify.success("Removed from wishlist.");
  };

  return (
    <wishlistContext.Provider
      value={{
        wishlistProducts,
        setWishlistProducts,
        addProductToWishlist,
        deleteProductFromWishlist,
      }}
    >
      {children}
    </wishlistContext.Provider>
  );
};

export const useWishlistContext = () => {
  return useContext(wishlistContext);
};

export default WishlistContextProvider;
