import HeadingXl from "../headings/HeadingXl";
import HreoName from "../section-names/HreoName";
import ButtonPrimary from "../buttons/ButtonPrimary";

const HeroSlide4 = ({ slide }) => {
  const { tag, title } = slide;
  return (
    <div className="container lg:max-w-770px xl:max-w-998px relative overflow-hidden">
      <div data-aos="fade-up" className="text-center">
        <div className="">
          <HreoName>{tag}</HreoName>
          <HeadingXl color="white">{title}</HeadingXl>
          <p className="text-size-15 md:text-lg text-blackColor-dark font-medium">
            Lorem Ipsum is simply dummy text of the printing typesetting <br />
            industry. Lorem Ipsum has been
          </p>

          <div className="mt-30px space-x-30px">
            <ButtonPrimary path="/ecommerce/shop">Buy Now</ButtonPrimary>
            <ButtonPrimary color="secondary" path="/ecommerce/shop">
              Explore More
            </ButtonPrimary>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSlide4;
