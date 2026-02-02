"use client";
import blogImage15 from "@/assets/images/blog/blog_15.png";
import blogImage16 from "@/assets/images/blog/blog_16.png";
import blogImage17 from "@/assets/images/blog/blog_17.png";
import blogImage18 from "@/assets/images/blog/blog_18.png";
import blogImage19 from "@/assets/images/blog/blog_19.png";
import blogImage20 from "@/assets/images/blog/blog_20.png";
import blogImage29 from "@/assets/images/blog/blog_29.jpg";
import blogImage30 from "@/assets/images/blog/blog_30.jpg";
import gallaryImage1 from "@/assets/images/gallery/kids_1.jpg";
import gallaryImage2 from "@/assets/images/gallery/kids_2.jpg";
import gallaryImage3 from "@/assets/images/gallery/kids_3.jpg";
import gallaryImage4 from "@/assets/images/gallery/kids_4.jpg";
import gallaryImage5 from "@/assets/images/gallery/kids_5.jpg";
import gallaryImage6 from "@/assets/images/gallery/kids_6.jpg";
import gallaryImage7 from "@/assets/images/gallery/kids_7.jpg";
import gallaryImage8 from "@/assets/images/gallery/kids_8.jpg";
import gallaryAiImage1 from "@/assets/images/gallery/ai_1.jpg";
import gallaryAiImage2 from "@/assets/images/gallery/ai_2.jpg";
import gallaryAiImage3 from "@/assets/images/gallery/ai_3.jpg";
import gallaryAiImage4 from "@/assets/images/gallery/ai_4.jpg";
import gallaryAiImage5 from "@/assets/images/gallery/ai_5.jpg";
import gallaryAiImage6 from "@/assets/images/gallery/ai_6.jpg";
import gallaryAiImage7 from "@/assets/images/gallery/ai_7.jpg";
import gallaryAiImage8 from "@/assets/images/gallery/ai_8.jpg";

import ImageSingle from "@/components/shared/sub-section/ImageSingle";
import useIsTrue from "@/hooks/useIsTrue";
import popup from "@/libs/popup";
import { useEffect } from "react";
const ImageGallery = ({ gallary }) => {
  const isHome9 = useIsTrue("/home-9");
  const isHome9Dark = useIsTrue("/home-9-dark");
  const isHome10 = useIsTrue("/home-10");
  const isHome10Dark = useIsTrue("/home-10-dark");
  useEffect(() => {
    popup();
  }, []);
  const allImages =
    isHome9 || isHome9Dark
      ? [
          gallaryImage1,
          gallaryImage2,
          gallaryImage3,
          gallaryImage4,
          gallaryImage5,
          gallaryImage6,
          gallaryImage7,
          gallaryImage8,
        ]
      : isHome10 || isHome10Dark
      ? [
          gallaryAiImage4,
          gallaryAiImage2,
          gallaryAiImage3,
          gallaryAiImage5,
          gallaryAiImage7,
          gallaryAiImage8,
          gallaryAiImage1,
          gallaryAiImage6,
        ]
      : [
          blogImage15,
          blogImage16,
          blogImage17,
          blogImage18,
          blogImage19,
          blogImage20,
          blogImage29,
          blogImage30,
        ];
  const images = gallary ? allImages.slice(0, 6) : [...allImages];
  return (
    <div>
      <div
        className={`${gallary ? "" : "container-fluid-2"} ${
          isHome10 || isHome10Dark
            ? "pt-100px pb-30px lg:pb-10px"
            : gallary
            ? ""
            : "mb-10"
        }  `}
      >
        <div className="gallary-container">
          <div className="popup">
            <div id="slider-container" className="slider-container">
              <span className="close-btn">&times;</span>
              <div className="slider-container-wrapper"></div>
            </div>
            <div className="slider-navigation">
              <button className="prev-btn"></button>
              <button className="next-btn"></button>
            </div>
          </div>

          <div
            className={
              gallary
                ? "grid grid-cols-3 gap-5px"
                : "grid grid-cols-2 md:grid-cols-4 gap-10px p-5 md:p-30px lg:p-5 2xl:p-30px border border-borderColor2 dark:border-borderColor2-dark"
            }
          >
            {images.map((image, idx) => (
              <ImageSingle key={idx} image={image} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;
