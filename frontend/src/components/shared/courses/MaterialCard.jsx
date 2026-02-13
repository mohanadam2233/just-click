
// components/shared/courses/MaterialCard.jsx
"use client";
import { useWishlistContext } from "@/contexts/WshlistContext";
import Link from "next/link";
import React from "react";
import { getFileIcon, getSemesterBg } from "@/utils/fileIcons";

const MaterialCard = ({ material }) => {
  const { addProductToWishlist } = useWishlistContext();
  const { id, title, semester, chapter, fileType, size, pages, slides, downloads } = material;

  const fileIconClass = getFileIcon(fileType);
  const semesterBg = getSemesterBg(semester);

  return (
    <div className="group bg-transparent border border-borderColor dark:border-borderColor-dark rounded-xl overflow-hidden hover:border-primaryColor dark:hover:border-primaryColor transition-all duration-300 flex flex-col h-full">
      {/* Visual Area - Fixed Height */}
      <div className="relative aspect-video bg-lightGrey7/30 dark:bg-whiteColor-dark/5 flex items-center justify-center overflow-hidden">
        <i className={`${fileIconClass} text-6xl text-primaryColor/80 group-hover:scale-110 transition-transform duration-500`}></i>
        
        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md text-whiteColor ${semesterBg}`}>
            Sem {semester}
          </span>
        </div>

        <button
          onClick={() => addProductToWishlist({ ...material, isMaterial: true, quantity: 1 })}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white dark:bg-darkdeep3-dark shadow-sm flex items-center justify-center text-contentColor hover:text-red-500 transition-colors"
        >
          <i className="icofont-heart-alt"></i>
        </button>
      </div>

      {/* Content Area - Fixed Flex Growth to keep cards same height */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold text-primaryColor uppercase tracking-wider">{fileType}</span>
          <span className="text-[10px] text-contentColor">•</span>
          <span className="text-[10px] text-contentColor uppercase tracking-wider">{size}</span>
        </div>

        {/* Line Clamp: Limits title to 2 lines so heights stay identical */}
        <Link href={`/courses/${id}`} className="block">
          <h5 className="text-base font-bold text-blackColor dark:text-whiteColor leading-snug mb-2 group-hover:text-primaryColor transition-colors line-clamp-2 min-h-[2.8rem]">
            {title}
          </h5>
        </Link>

        <p className="text-xs text-contentColor dark:text-contentColor-dark mb-4 line-clamp-1 italic">
          {chapter || "No chapter info"}
        </p>

        {/* Footer info and Actions */}
        <div className="mt-auto pt-4 border-t border-borderColor/50 dark:border-borderColor-dark/50 flex items-center justify-between">
          <div className="flex items-center gap-1 text-contentColor">
             <i className="icofont-download text-sm"></i>
             <span className="text-xs font-semibold">{downloads || 0}</span>
          </div>
          
          <div className="flex gap-2">
            <Link 
              href={`/materials/${id}/view`}
              className="p-2 rounded-lg border border-borderColor dark:border-borderColor-dark text-contentColor hover:bg-primaryColor hover:text-whiteColor hover:border-primaryColor transition-all"
            >
              <i className="icofont-eye-alt"></i>
            </Link>
            <a 
              href={`/materials/${id}/download`}
              className="px-4 py-2 rounded-lg bg-blackColor dark:bg-primaryColor text-whiteColor text-xs font-bold hover:opacity-90 transition-all"
            >
              Download
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialCard;