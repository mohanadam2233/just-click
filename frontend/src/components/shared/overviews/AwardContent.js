"use client";
import awardImage1 from "@/assets/images/about/award-1.jpg";
import awardImage2 from "@/assets/images/about/award-2.jpg";
import awardImage3 from "@/assets/images/about/award-3.jpg";
import awardImage4 from "@/assets/images/about/award-4.jpg";

import AwardSingle from "./AwardSingle";
import useIsTrue from "@/hooks/useIsTrue";

const AwardContent = () => {
  const isAbout = useIsTrue("/about");
  const isAboutDark = useIsTrue("/about-dark");
  const allAwards = [
    {
      id: 1,
      image: awardImage1,
      title: "Forging relationships between national",
    },
    {
      id: 2,
      image: awardImage2,
      title: "Lorem ipsum dolor sit amet conse ctetur.",
    },
    {
      id: 3,
      image: awardImage3,
      title: "Forging relationships between national",
    },
    {
      id: 4,
      image: awardImage4,
      title: "Lorem ipsum dolor sit amet conse ctetur.",
    },
    {
      id: 5,
      image: awardImage1,
      title: "Forging relationships between national",
    },
    {
      id: 6,
      image: awardImage2,
      title: "Lorem ipsum dolor sit amet conse ctetur.",
    },
  ];
  const awards =
    isAbout || isAboutDark ? allAwards.slice(0, 4) : [...allAwards];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-30px items-center">
      {awards.map((award, idx) => (
        <AwardSingle key={idx} award={award} />
      ))}
    </div>
  );
};

export default AwardContent;
