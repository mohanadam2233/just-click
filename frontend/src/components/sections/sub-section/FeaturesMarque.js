import Feature2 from "@/components/shared/features/Feature2";

const FeaturesMarque = () => {
  const features = [
    "Education Center",
    "Best Collection",
    "Online Course",
    "Offline Course",
    "Online Course",
    "Hot Deal",
    "Book Libary",
    "Hot Deal",
    "University Area",
    "Teacher Development",
    "Student",
    "New Arrival",
    "Best Collection",
    "Hot Deal",
    "Book Libary",
    "Hot Deal",
  ];
  return (
    <div data-aos="fade-up">
      <div className="container-fluid py-10 px-0 bg-borderColor dark:bg-borderColor-dark overflow-x-hidden">
        <div className="flex animate-marquee play-state">
          {/* marques */}
          {features.map((feature, idx) => (
            <Feature2 key={idx} idx={idx} feature={feature} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesMarque;
