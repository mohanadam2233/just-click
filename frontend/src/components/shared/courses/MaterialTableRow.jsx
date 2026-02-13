// components/shared/courses/MaterialTableRow.jsx
"use client";
import { useWishlistContext } from "@/contexts/WshlistContext";
import Link from "next/link";
import React from "react";
import { getFileIcon, getSemesterBg } from "@/utils/fileIcons";

const MaterialTableRow = ({ material }) => {
  const { addProductToWishlist } = useWishlistContext();
  const {
    id,
    title,
    semester,
    chapter,
    fileType,
    size,
    pages,
    slides,
    uploadDate,
    downloads,
  } = material;

  const fileIconClass = getFileIcon(fileType);
  const semesterBg = getSemesterBg(semester);

  // Format date
  const formattedDate = new Date(uploadDate).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <tr className="border-b border-borderColor dark:border-borderColor-dark hover:bg-lightGrey10 dark:hover:bg-lightGrey10-dark transition-colors">
      {/* Title Column */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${semesterBg} bg-opacity-20 flex items-center justify-center`}>
            <i className={`${fileIconClass} text-xl text-white`}></i>
          </div>
          <div>
            <Link 
              href={`/materials/${id}`}
              className="text-sm font-medium text-blackColor dark:text-whiteColor hover:text-primaryColor dark:hover:text-primaryColor transition"
            >
              {title}
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {chapter} • Sem {semester}
            </p>
          </div>
        </div>
      </td>

      {/* File Info Column */}
      <td className="px-6 py-4">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <span className="font-medium uppercase">{fileType}</span>
          <span className="mx-2 text-gray-400">•</span>
          <span>{size}</span>
          {pages && (
            <>
              <span className="mx-2 text-gray-400">•</span>
              <span>{pages} pages</span>
            </>
          )}
          {slides && (
            <>
              <span className="mx-2 text-gray-400">•</span>
              <span>{slides} slides</span>
            </>
          )}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          <i className="icofont-download mr-1"></i> {downloads || 0} downloads
        </div>
      </td>

      {/* Upload Date Column */}
      <td className="px-6 py-4">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {formattedDate}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          <i className="icofont-clock-time mr-1"></i> Added
        </div>
      </td>

      {/* Actions Column */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              addProductToWishlist({
                ...material,
                isMaterial: true,
                quantity: 1,
              })
            }
            className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-primaryColor hover:text-white hover:border-primaryColor transition"
            title="Add to favorites"
          >
            <i className="icofont-heart"></i>
          </button>
          <Link
            href={`/materials/${id}/view`}
            target="_blank"
            className="px-3 py-1.5 bg-primaryColor/10 hover:bg-primaryColor text-primaryColor hover:text-white rounded-lg text-sm font-medium transition flex items-center gap-1"
            title="View material"
          >
            <i className="icofont-eye-alt"></i>
            <span className="hidden sm:inline">View</span>
          </Link>
          <a
            href={`/materials/${id}/download`}
            className="px-3 py-1.5 bg-secondaryColor/10 hover:bg-secondaryColor text-secondaryColor hover:text-white rounded-lg text-sm font-medium transition flex items-center gap-1"
            title="Download"
          >
            <i className="icofont-download"></i>
            <span className="hidden sm:inline">Download</span>
          </a>
        </div>
      </td>
    </tr>
  );
};

export default MaterialTableRow;