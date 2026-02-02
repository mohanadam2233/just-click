import React from "react";
import ProductDescriptionText from "./ProductDescriptionText";

const ProductTypeContent = () => {
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
        {`   If you are going to use a passage of Lorem Ipsum, you need to
                  be sure there isn't anything embarrassing hidden in the middle
                  of text. All the Lorem Ipsum generators on the Internet tend
                  to repeat predefined chunks as necessary, making this the
                  first true generator on the Internet. It uses a dictionary of
                  over 200 Latin words, combined with a handful of model
                  sentence structures, to generate Lorem Ipsum which looks
                  reasonable. The generated Lorem Ipsum is therefore always free
                  from repetition, injected humour, or non-characteristic words
                  etc`}
      </ProductDescriptionText>
    </div>
  );
};

export default ProductTypeContent;
