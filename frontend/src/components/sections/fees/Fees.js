import FeesContent from "@/components/shared/fees/FeesContent";

const Fees = ({ title, subTitle }) => {
  return (
    <section>
      <div className=" pt-100px pb-70px">
        {/* overview  Heading */}
        <FeesContent title={title} subTitle={subTitle} />
      </div>
    </section>
  );
};

export default Fees;
