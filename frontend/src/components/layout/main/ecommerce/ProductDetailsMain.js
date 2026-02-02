import CoursesTab from "@/components/sections/courses/CoursesTab";
import Faq from "@/components/sections/faq/Faq";
import FeaturedProducts from "@/components/sections/featured-products/FeaturedProducts";
import HeroPrimary from "@/components/sections/hero-banners/HeroPrimary";
import ProductDetailsPrimary from "@/components/sections/product-details/ProductDetailsPrimary";
import ProductDescriptionTab from "@/components/sections/sub-section/ecommerce/ProductDescriptionTab";

const ProductDetailsMain = ({ id }) => {
  return (
    <>
      <HeroPrimary path={"Product-Details"} title={"Product Details"} />
      <ProductDetailsPrimary id={id} />
      <ProductDescriptionTab />
      <Faq />
      <FeaturedProducts />
      <CoursesTab />
    </>
  );
};

export default ProductDetailsMain;
