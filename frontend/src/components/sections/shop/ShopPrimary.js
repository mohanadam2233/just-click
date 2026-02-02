"use client";
import ShopSidebar from "@/components/shared/ecommerce/ShopSidebar";
import { useEffect, useRef, useState } from "react";
import TabButtonSecondary from "@/components/shared/buttons/TabButtonSecondary";
import useTab from "@/hooks/useTab";
import TabContentWrapper from "@/components/shared/wrappers/TabContentWrapper";
import TwoColumnContent from "@/components/shared/ecommerce/TwoColumnContent";
import ThreeColumnContent from "@/components/shared/ecommerce/ThreeColumnContent";
import FourColumContent from "@/components/shared/ecommerce/FourColumContent";
import ProductModal from "@/components/shared/products/ProductModal";
import Pagination from "@/components/shared/others/Pagination";
import getAllProducts from "@/libs/getAllProducts";
import SrortFilter from "@/components/shared/products/SrortFilter";
import { useSearchParams } from "next/navigation";
const allProductsBeforeFilter = getAllProducts();
const getAllFilteredProducts = (filterObject, isReset) => {
  const {
    availability: availabilityNew,
    type,
    brand: brandNew,
    color: colorNew,
    size: sizeNew,
    category: newCategory,
  } = filterObject;

  const filteredProducts = isReset
    ? allProductsBeforeFilter
    : allProductsBeforeFilter?.filter(
        ({ availability, productType, brand, color, size, type: category }) =>
          (!availabilityNew?.length ||
            availabilityNew?.includes(availability)) &&
          (!type?.length || type.includes(productType)) &&
          (!brandNew?.length || brandNew?.includes(brand)) &&
          (!colorNew?.length || colorNew?.includes(color)) &&
          (!sizeNew?.length || sizeNew?.includes(size)) &&
          (!newCategory?.length ||
            newCategory?.includes(category.toLowerCase()))
      );
  return filteredProducts;
};
const getSortedProduct = (allProducts, sortInput, priceRange) => {
  switch (sortInput) {
    case "featured":
      return [...allProducts];
    case "best-selling":
      return [...allProducts]?.filter(({ bestSeller }) => bestSeller);
    case "title-ascending":
      return [...allProducts]?.sort((a, b) => a.title.localeCompare(b.title));
    case "title-descending":
      return [...allProducts]?.sort((a, b) => b.title.localeCompare(a.title));
    case "price-ascending":
      return [...allProducts]?.sort((a, b) => a.price - b.price);
    case "price-descending":
      return [...allProducts]?.sort((a, b) => b.price - a.price);
    case "created-descending":
      return [...allProducts]?.sort((a, b) => a.date - b.date);
    case "created-ascending":
      return [...allProducts]?.sort((a, b) => b.date - a.date);
    default:
      return [...allProducts].filter(({ price }) => {
        return price > priceRange[0] && price <= priceRange[1];
      });
  }
};
const ShopPrimary = () => {
  const category = useSearchParams().get("category");
  const [availability, setAvailability] = useState([]);
  const [type, setType] = useState([]);
  const [brand, setBrand] = useState([]);
  const [color, setColor] = useState([]);
  const [size, setSize] = useState([]);
  const [reset, setReset] = useState(false);
  const [sortInput, setSortInput] = useState("featured");
  const [isPriceRange, setIsPriceRange] = useState(false);
  const [skip, setSkip] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentProducts, setCurrentProducts] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);
  const { currentIdx, handleTabClick } = useTab(1);
  const filterIputs = {
    availability,
    type,
    brand,
    color,
    size,
    category: category ? [category] : [],
  };
  const allProducts = getAllFilteredProducts(filterIputs, reset);
  const products = getSortedProduct(
    allProducts,
    isPriceRange ? "no-input" : sortInput,
    isPriceRange ? [0, 80] : null
  );
  const productsString = JSON.stringify(products);
  const shopRef = useRef(null);
  const totalProducts = products?.length;
  const limit = 12;
  const totalPages = Math.ceil(totalProducts / limit);
  const paginationItems = [...Array(totalPages)];

  // handle current product
  const handleCurrentProduct = (id) => {
    const product = currentProducts.find(({ id: id1 }) => id1 === id);
    setCurrentProduct({ ...product });
  };
  // handle pagination
  const handlePagesnation = (id) => {
    shopRef.current.scrollIntoView({ behavior: "smooth" });
    if (typeof id === "number") {
      setCurrentPage(id);
      setSkip(limit * id);
    } else if (id === "prev") {
      setCurrentPage(currentPage - 1);
      setSkip(skip - limit);
    } else if (id === "next") {
      setCurrentPage(currentPage + 1);
      setSkip(skip + limit);
    }

    // const currentButton = e?.target;
  };
  // handle filterProduct
  const filterItem = (e, ps, check) => {
    return e.target.checked
      ? [check, ...ps]
      : [...ps.filter((pevCheck, idx) => pevCheck !== check)];
  };

  const handleFilters = (e, inputName, check, isRange) => {
    setReset(false);
    if (isRange) {
      setIsPriceRange(true);
    } else {
      switch (inputName) {
        case "availability":
          return setAvailability((ps) => filterItem(e, ps, check));
        case "productType":
          return setType((ps) => filterItem(e, ps, check));
        case "brand":
          return setBrand((ps) => filterItem(e, ps, check));
        case "color":
          return setColor((ps) => filterItem(e, ps, check));
        case "size":
          return setSize((ps) => filterItem(e, ps, check));
      }
    }
  };

  // set Current products
  useEffect(() => {
    const products = JSON.parse(productsString);
    const productsToShow = [...products].splice(skip, limit);
    setCurrentProduct(products[0]);
    setCurrentProducts(productsToShow);
  }, [skip, limit, productsString]);

  const tabButtons = [
    {
      name: (
        <svg
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 5.5 12.5"
          className="w-5 h-5"
        >
          <defs></defs>
          <defs></defs>
          <g data-name="Layer 2">
            <g data-name="Layer 1">
              <g data-name="shop page">
                <g id="Group-10">
                  <path
                    d="M.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 01.75 0z"
                    className="cls-1"
                  ></path>
                  <path
                    d="M4.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 014.75 0z"
                    className="cls-1"
                    data-name="Rectangle"
                  ></path>
                </g>
              </g>
            </g>
          </g>
        </svg>
      ),
      content: (
        <TwoColumnContent
          products={currentProducts}
          handleCurrentProduct={handleCurrentProduct}
        />
      ),
    },
    {
      name: (
        <svg
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 9.5 12.5"
          className="w-5 h-5"
        >
          <defs></defs>
          <defs>{/* <style>.cls-1 {{ fillRule: "evenodd" }}</style> */}</defs>
          <g data-name="Layer 2">
            <g data-name="Layer 1">
              <g data-name="shop page">
                <g id="Group-16">
                  <path
                    d="M.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 01.75 0z"
                    className="cls-1"
                  ></path>
                  <path
                    d="M4.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 014.75 0z"
                    className="cls-1"
                    data-name="Rectangle"
                  ></path>
                  <path
                    d="M8.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 018.75 0z"
                    className="cls-1"
                    data-name="Rectangle"
                  ></path>
                </g>
              </g>
            </g>
          </g>
        </svg>
      ),
      content: (
        <ThreeColumnContent
          products={currentProducts}
          handleCurrentProduct={handleCurrentProduct}
        />
      ),
    },
    {
      name: (
        <svg
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 13.5 12.5"
          className="w-5 h-5"
        >
          <defs></defs>
          <defs>{/* <style>.cls-1 {{ fillRule: "evenodd" }}</style> */}</defs>
          <g data-name="Layer 2">
            <g data-name="Layer 1">
              <g data-name="shop page">
                <g id="_4_col" data-name="4_col">
                  <path
                    d="M.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 01.75 0z"
                    className="cls-1"
                  ></path>
                  <path
                    d="M4.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 014.75 0z"
                    className="cls-1"
                    data-name="Rectangle"
                  ></path>
                  <path
                    d="M8.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11A.76.76 0 018.75 0z"
                    className="cls-1"
                    data-name="Rectangle"
                  ></path>
                  <path
                    id="Rectangle-4"
                    d="M12.75 0a.76.76 0 01.75.75v11a.76.76 0 01-.75.75.76.76 0 01-.75-.75v-11a.76.76 0 01.75-.75z"
                    className="cls-1"
                    data-name="Rectangle"
                  ></path>
                </g>
              </g>
            </g>
          </g>
        </svg>
      ),
      content: (
        <FourColumContent
          products={currentProducts}
          handleCurrentProduct={handleCurrentProduct}
        />
      ),
    },
  ];
  const handleReset = () => {
    setAvailability([]);
    setType([]);
    setColor([]);
    setBrand([]);
    setSize([]);
    setReset(true);
    setIsPriceRange(false);
  };
  return (
    <section>
      <div className="container-fluid-2 shop py-100px" ref={shopRef}>
        {/* shop header */}
        <div
          className="courses-header flex justify-between items-center flex-wrap px-30px py-9px bg-darkdeep3 dark:bg-darkdeep3-dark mb-50px gap-y-5"
          data-aos="fade-up"
        >
          <div className=" transition-all duraton-300 text-blackColor dark:text-blackColor-dark flex gap-11px">
            {tabButtons?.map(({ name }, idx) => (
              <TabButtonSecondary
                key={idx}
                name={name}
                button={"icon"}
                currentIdx={currentIdx}
                handleTabClick={handleTabClick}
                idx={idx}
              />
            ))}
          </div>

          <div className="flex items-center flex-wrap">
            <SrortFilter
              sortInput={sortInput}
              setSortInput={setSortInput}
              setIsPriceRange={setIsPriceRange}
            />
            <div>
              <p className="text-blackColor dark:text-blackColor-dark">
                Showing {skip ? skip : skip + 1} -{" "}
                {skip + limit >= totalProducts ? totalProducts : skip + limit}{" "}
                of {totalProducts} result
              </p>
            </div>
          </div>
        </div>
        {/* books */}
        <div
          className={`grid ${
            category ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-12"
          }  gap-x-30px`}
        >
          {/* shop left */}
          {category ? (
            ""
          ) : (
            <ShopSidebar
              handleFilters={handleFilters}
              size={size}
              availability={availability}
              color={color}
              type={type}
              brand={brand}
              handleReset={handleReset}
              category={category}
            />
          )}

          {/* shop right */}
          {currentProducts && (
            <div
              className={`modal-container ${
                category ? "" : "xl:col-start-4 xl:col-span-9"
              } `}
            >
              <div>
                {tabButtons?.map(({ content }, idx) => (
                  <TabContentWrapper
                    key={idx}
                    isShow={idx === currentIdx ? true : false}
                  >
                    {content}
                  </TabContentWrapper>
                ))}
              </div>

              {/* pagination */}

              <div data-aos="fade-up">
                {totalProducts > 11 ? (
                  <Pagination
                    pages={paginationItems}
                    totalItems={totalProducts}
                    handlePagesnation={handlePagesnation}
                    currentPage={currentPage}
                    skip={skip}
                    limit={limit}
                  />
                ) : (
                  ""
                )}
              </div>
              <ProductModal product={currentProduct} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ShopPrimary;
