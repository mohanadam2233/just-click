import Feature from "@/components/shared/features/Feature";
import React from "react";

const Features = () => {
  const features = [
    {
      title: "Video Training",
      desc: "With unlimited courses",
    },
    {
      title: "Expert Teaceher",
      desc: "With unlimited courses",
    },
    {
      title: "Versatile Course",
      desc: "With unlimited courses",
    },
  ];
  return (
    <div className="container">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-30px">
        {/* featue single */}
        {features.map((feature, idx) => (
          <Feature key={idx} feature={{ ...feature, id: idx }} />
        ))}
      </div>
    </div>
  );
};

export default Features;
