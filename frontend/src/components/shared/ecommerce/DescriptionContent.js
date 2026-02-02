import ProductDescriptionText from "@/components/shared/ecommerce/ProductDescriptionText";
import React from "react";

const DescriptionContent = () => {
  return (
    <div>
      <ProductDescriptionText>
        {`As opposed to using 'Content here, content here', making it
        look like readable English. Many desktop publishing packages
        and web page editors now use Lorem Ipsum as their default
        model text, and a search for 'lorem ipsum' will uncover many
        web sites still in their infancy. Various versions have
        evolved over the years, sometimes by accident, sometimes on
        purpose (injected humour and the like. It is a long
        established fact that a reader will be distracted by the
        readable content of a page when looking at its layout. The
        point of using Lorem Ipsum is that it has a more-or-less
        normal distribution of letters`}
      </ProductDescriptionText>
      <ProductDescriptionText>
        {`Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum
                  nobis provident eius. Tenetur facilis, illo nesciunt numquam
                  non, odit iure, quia recusandae deleniti nihil excepturi?`}
      </ProductDescriptionText>
    </div>
  );
};

export default DescriptionContent;
