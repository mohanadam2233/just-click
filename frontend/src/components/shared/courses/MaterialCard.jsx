// // components/shared/courses/MaterialCard.jsx
// "use client";
// import { useWishlistContext } from "@/contexts/WshlistContext";
// import Link from "next/link";
// import React from "react";
// import { getFileIcon, getSemesterBg } from "@/utils/fileIcons";

// const MaterialCard = ({ material }) => {
//   const { addProductToWishlist } = useWishlistContext();
//   const { id, title, semester, chapter, fileType, size, pages, slides, downloads } = material;

//   const fileIconClass = getFileIcon(fileType);
//   const semesterBg = getSemesterBg(semester);

//   return (
//     <div className="group bg-transparent border border-borderColor dark:border-borderColor-dark rounded-xl overflow-hidden hover:border-primaryColor dark:hover:border-primaryColor transition-all duration-300 flex flex-col h-full">
//       {/* Visual Area - Fixed Height */}
//       <div className="relative aspect-video bg-lightGrey7/30 dark:bg-whiteColor-dark/5 flex items-center justify-center overflow-hidden">
//         <i className={`${fileIconClass} text-6xl text-primaryColor/80 group-hover:scale-110 transition-transform duration-500`}></i>

//         {/* Floating Badges */}
//         <div className="absolute top-3 left-3 flex gap-2">
//           <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md text-whiteColor ${semesterBg}`}>
//             Sem {semester}
//           </span>
//         </div>

//         <button
//           onClick={() => addProductToWishlist({ ...material, isMaterial: true, quantity: 1 })}
//           className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white dark:bg-darkdeep3-dark shadow-sm flex items-center justify-center text-contentColor hover:text-red-500 transition-colors"
//         >
//           <i className="icofont-heart-alt"></i>
//         </button>
//       </div>

//       {/* Content Area - Fixed Flex Growth to keep cards same height */}
//       <div className="p-5 flex flex-col flex-grow">
//         <div className="flex items-center gap-2 mb-2">
//           <span className="text-[10px] font-bold text-primaryColor uppercase tracking-wider">{fileType}</span>
//           <span className="text-[10px] text-contentColor">•</span>
//           <span className="text-[10px] text-contentColor uppercase tracking-wider">{size}</span>
//         </div>

//         {/* Line Clamp: Limits title to 2 lines so heights stay identical */}
//         <Link href={`/courses/${id}`} className="block">
//           <h5 className="text-base font-bold text-blackColor dark:text-whiteColor leading-snug mb-2 group-hover:text-primaryColor transition-colors line-clamp-2 min-h-[2.8rem]">
//             {title}
//           </h5>
//         </Link>

//         <p className="text-xs text-contentColor dark:text-contentColor-dark mb-4 line-clamp-1 italic">
//           {chapter || "No chapter info"}
//         </p>

//         {/* Footer info and Actions */}
//         <div className="mt-auto pt-4 border-t border-borderColor/50 dark:border-borderColor-dark/50 flex items-center justify-between">
//           <div className="flex items-center gap-1 text-contentColor">
//              <i className="icofont-download text-sm"></i>
//              <span className="text-xs font-semibold">{downloads || 0}</span>
//           </div>

//           <div className="flex gap-2">
//             <Link
//               href={`/materials/${id}/view`}
//               className="p-2 rounded-lg border border-borderColor dark:border-borderColor-dark text-contentColor hover:bg-primaryColor hover:text-whiteColor hover:border-primaryColor transition-all"
//             >
//               <i className="icofont-eye-alt"></i>
//             </Link>
//             <a
//               href={`/materials/${id}/download`}
//               className="px-4 py-2 rounded-lg bg-blackColor dark:bg-primaryColor text-whiteColor text-xs font-bold hover:opacity-90 transition-all"
//             >
//               Download
//             </a>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MaterialCard;
"use client";

import { useWishlistContext } from "@/contexts/WshlistContext";
import { getFileIcon, getSemesterBg } from "@/utils/fileIcons";
import Link from "next/link";

const formatFileSize = (sizeMb) => {
  if (sizeMb === null || sizeMb === undefined || Number.isNaN(Number(sizeMb))) {
    return "—";
  }

  const num = Number(sizeMb);
  return `${num % 1 === 0 ? num.toFixed(0) : num.toFixed(1)} MB`;
};

const MaterialCard = ({ material }) => {
  const { addProductToWishlist } = useWishlistContext();

  const id = material?.id;
  const title = material?.title || "Untitled Material";
  const chapterTitle = material?.chapterTitle || "No chapter info";
  const semesterNumber = material?.semesterNumber;
  const semesterName = material?.semesterName || "Semester";
  const courseTitle = material?.courseTitle || "";
  const materialType = material?.materialType || "file";

  const fileExtension = material?.file?.extension || materialType;
  const fileSize = formatFileSize(material?.file?.sizeMb);
  const pageCount = material?.file?.pageCount;
  const slideCount = material?.file?.slideCount;
  const downloadUrl = material?.file?.downloadUrl || "#";
  const readUrl = material?.file?.readUrl || "#";
  const canPreviewInBrowser = material?.file?.canPreviewInBrowser ?? false;

  const downloadCount = material?.stats?.downloadCount || 0;

  const fileIconClass = getFileIcon(fileExtension);
  const semesterBg = getSemesterBg(semesterNumber || 1);

  const infoLabel =
    slideCount != null
      ? `${slideCount} slides`
      : pageCount != null
        ? `${pageCount} pages`
        : materialType;

  return (
    <div className="group bg-transparent border border-borderColor dark:border-borderColor-dark rounded-xl overflow-hidden hover:border-primaryColor dark:hover:border-primaryColor transition-all duration-300 flex flex-col h-full">
      {/* Visual Area */}
      <div className="relative aspect-video bg-lightGrey7/30 dark:bg-whiteColor-dark/5 flex items-center justify-center overflow-hidden">
        <i
          className={`${fileIconClass} text-6xl text-primaryColor/80 group-hover:scale-110 transition-transform duration-500`}
        ></i>

        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          {semesterNumber ? (
            <span
              className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md text-whiteColor ${semesterBg}`}
            >
              Sem {semesterNumber}
            </span>
          ) : semesterName ? (
            <span
              className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md text-whiteColor ${semesterBg}`}
            >
              {semesterName}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() =>
            addProductToWishlist({
              ...material,
              isMaterial: true,
              quantity: 1,
            })
          }
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white dark:bg-darkdeep3-dark shadow-sm flex items-center justify-center text-contentColor hover:text-red-500 transition-colors"
          aria-label="Add to wishlist"
        >
          <i className="icofont-heart-alt"></i>
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-[10px] font-bold text-primaryColor uppercase tracking-wider">
            {fileExtension}
          </span>
          <span className="text-[10px] text-contentColor">•</span>
          <span className="text-[10px] text-contentColor uppercase tracking-wider">
            {fileSize}
          </span>
          {infoLabel ? (
            <>
              <span className="text-[10px] text-contentColor">•</span>
              <span className="text-[10px] text-contentColor uppercase tracking-wider">
                {infoLabel}
              </span>
            </>
          ) : null}
        </div>

        <Link href={`/materials/${id}`} className="block">
          <h5 className="text-base font-bold text-blackColor dark:text-whiteColor leading-snug mb-2 group-hover:text-primaryColor transition-colors line-clamp-2 min-h-[2.8rem]">
            {title}
          </h5>
        </Link>

        <p className="text-xs text-contentColor dark:text-contentColor-dark mb-1 line-clamp-1 italic">
          {chapterTitle}
        </p>

        {courseTitle ? (
          <p className="text-[11px] text-contentColor/80 dark:text-contentColor-dark/80 mb-4 line-clamp-1">
            {courseTitle}
          </p>
        ) : (
          <div className="mb-4" />
        )}

        <div className="mt-auto pt-4 border-t border-borderColor/50 dark:border-borderColor-dark/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 text-contentColor">
            <i className="icofont-download text-sm"></i>
            <span className="text-xs font-semibold">{downloadCount}</span>
          </div>

          <div className="flex gap-2">
            <a
              href={canPreviewInBrowser ? readUrl : `/materials/${id}/view`}
              target={canPreviewInBrowser ? "_blank" : undefined}
              rel={canPreviewInBrowser ? "noopener noreferrer" : undefined}
              className="p-2 rounded-lg border border-borderColor dark:border-borderColor-dark text-contentColor hover:bg-primaryColor hover:text-whiteColor hover:border-primaryColor transition-all"
              aria-label="View material"
            >
              <i className="icofont-eye-alt"></i>
            </a>

            <a
              href={downloadUrl}
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
