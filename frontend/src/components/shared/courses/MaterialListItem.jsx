// components/shared/courses/MaterialListItem.jsx
"use client";
import { useWishlistContext } from "@/contexts/WshlistContext";
import Link from "next/link";
import React from "react";
import { getFileIcon, getSemesterBg } from "@/utils/fileIcons";

const MaterialListItem = ({ material }) => {
  const { addProductToWishlist } = useWishlistContext();
  const { id, title, semester, chapter, fileType, size, pages, downloads } = material;

  const fileIconClass = getFileIcon(fileType);
  const semesterBg = getSemesterBg(semester);

  return (
    <tr className="group transition-all">
      {/* Title Column */}
      <td className="py-3 px-2 border-y border-l border-borderColor/40 dark:border-borderColor-dark/20 rounded-l-xl group-hover:bg-lightGrey7/30 dark:group-hover:bg-whiteColor-dark/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primaryColor/5 flex items-center justify-center group-hover:bg-primaryColor group-hover:text-whiteColor transition-all duration-300">
            <i className={`${fileIconClass} text-xl`}></i>
          </div>
          <div className="flex flex-col">
            <Link href={`/courses/${id}`} className="font-bold text-blackColor dark:text-whiteColor text-sm hover:text-primaryColor line-clamp-1">
              {title}
            </Link>
            <span className="text-[10px] text-contentColor font-medium uppercase tracking-tight">
              {chapter || "No Chapter"}
            </span>
          </div>
        </div>
      </td>

      {/* Info Column */}
      <td className="py-3 px-2 border-y border-borderColor/40 dark:border-borderColor-dark/20 group-hover:bg-lightGrey7/30 dark:group-hover:bg-whiteColor-dark/5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
             <span className={`text-[9px] text-whiteColor px-1.5 py-0.5 rounded font-bold ${semesterBg}`}>SEM {semester}</span>
             <span className="text-xs font-bold text-blackColor dark:text-whiteColor uppercase">{fileType}</span>
          </div>
          <span className="text-[11px] text-contentColor">{size} • {pages || 0} pages</span>
        </div>
      </td>

      {/* Stats Column */}
      <td className="py-3 px-2 border-y border-borderColor/40 dark:border-borderColor-dark/20 group-hover:bg-lightGrey7/30 dark:group-hover:bg-whiteColor-dark/5">
        <div className="flex items-center gap-1.5 text-contentColor">
          <i className="icofont-download text-base"></i>
          <span className="text-sm font-bold">{downloads || 0}</span>
        </div>
      </td>

      {/* Actions Column */}
      <td className="py-3 pr-4 pl-2 border-y border-r border-borderColor/40 dark:border-borderColor-dark/20 rounded-r-xl group-hover:bg-lightGrey7/30 dark:group-hover:bg-whiteColor-dark/5 text-right">
        <div className="flex items-center justify-end gap-3">
          <button 
            onClick={() => addProductToWishlist({...material, isMaterial: true, quantity: 1})}
            className="text-contentColor hover:text-red-500 transition-colors"
          >
            <i className="icofont-heart-alt"></i>
          </button>
          <Link href={`/materials/${id}/view`} className="text-xs font-bold text-primaryColor hover:underline">
            View
          </Link>
          <a href={`/materials/${id}/download`} className="bg-primaryColor/10 text-primaryColor hover:bg-primaryColor hover:text-whiteColor px-3 py-1.5 rounded-lg text-xs font-bold transition-all">
            Download
          </a>
        </div>
      </td>
    </tr>
  );
};

export default MaterialListItem;