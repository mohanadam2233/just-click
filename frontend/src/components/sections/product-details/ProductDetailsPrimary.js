import ProductDetails from "@/components/shared/products/ProductDetails";
import getAllProducts from "@/libs/getAllProducts";

const ProductDetailsPrimary = ({ id }) => {
  const products = getAllProducts();
  const product = products?.find(({ id: id1 }) => id1 === parseInt(id));
  return (
    <section>
      <div className="container py-10 md:py-50px lg:py-70px 2xl:py-20 3xl:py-100px">
        <ProductDetails product={product} />
      </div>
    </section>
  );
};

export default ProductDetailsPrimary;
