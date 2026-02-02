"use client";
import DeliverySystemContent from "@/components/shared/ecommerce/DeliverySystemContent";
import DescriptionContent from "@/components/shared/ecommerce/DescriptionContent";
import ProductTypeContent from "@/components/shared/ecommerce/ProductTypeContent";
import VedioContent from "@/components/shared/ecommerce/VedioContent";
import TabContentWrapper from "@/components/shared/wrappers/TabContentWrapper";
import useTab from "@/hooks/useTab";

const ProductDescriptionTab = () => {
  const { currentIdx, handleTabClick } = useTab();
  const tabButtons = [
    { name: "Description", content: <DescriptionContent /> },
    { name: "Video", content: <VedioContent /> },
    { name: "Product Type", content: <ProductTypeContent /> },
    { name: "Delivery System", content: <DeliverySystemContent /> },
  ];
  return (
    <div>
      <div className="container pb-100px">
        <div className="tab p-30px pb-37px border border-borderColor dark:border-borderColor-dark">
          <div className="tab-links flex flex-wrap md:flex-nowrap rounded">
            {tabButtons?.map(({ name }, idx) => (
              <button
                onClick={() => handleTabClick(idx)}
                key={idx}
                className={`relative text-lg text-blackColor dark:text-blackColor-dark pb-10px mb-15px mr-8 before:w-0 before:h-0.5 before:absolute before:-bottom-0.5 lg:before:bottom-0 before:left-0 before:bg-primaryColor hover:before:w-full before:transition-all before:duration-300  ${
                  idx === currentIdx ? "before:w-full" : "before:w-0"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
          <div>
            {tabButtons?.map(({ content }, idx) => (
              <TabContentWrapper
                key={idx}
                isShow={idx === currentIdx ? true : false}
              >
                {content}{" "}
              </TabContentWrapper>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDescriptionTab;
