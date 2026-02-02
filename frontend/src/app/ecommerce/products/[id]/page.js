import ProductDetailsMain from "@/components/layout/main/ecommerce/ProductDetailsMain";
import ThemeController from "@/components/shared/others/ThemeController";
import PageWrapper from "@/components/shared/wrappers/PageWrapper";
import products from "@/../public/fakedata/products.json";
export const metadata = {
  title: "Product Details | Edurock - Education LMS Template",
  description: "Product Details | Edurock - Education LMS Template",
};
const Product_Details = async ({ params }) => {
  const { id } = params;
  const isExistProducts = products?.find(({ id: id1 }) => id1 === parseInt(id));
  if (!isExistProducts) {
    notFound();
  }
  return (
    <PageWrapper>
      <main>
        <ProductDetailsMain id={params?.id} />
        <ThemeController />
      </main>
    </PageWrapper>
  );
};
export async function generateStaticParams() {
  return products?.map(({ id }) => ({ id: id.toString() }));
}
export default Product_Details;
