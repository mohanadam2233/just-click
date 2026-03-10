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

const MaterialListItem = ({ material }) => {
  const { addProductToWishlist } = useWishlistContext();

  const id = material?.id;
  const title = material?.title || "Untitled Material";
  const chapterTitle = material?.chapterTitle || "No Chapter";
  const courseTitle = material?.courseTitle || "";
  const semesterNumber = material?.semesterNumber;
  const materialType = material?.materialType || "file";

  const fileExtension = material?.file?.extension || materialType;
  const fileSize = formatFileSize(material?.file?.sizeMb);
  const pageCount = material?.file?.pageCount;
  const slideCount = material?.file?.slideCount;
  const downloadUrl = material?.file?.downloadUrl || "#";
  const readUrl = material?.file?.readUrl || "#";
  const canPreviewInBrowser = material?.file?.canPreviewInBrowser ?? false;

  const downloadCount = material?.stats?.downloadCount || 0;
  const viewCount = material?.stats?.viewCount || 0;

  const fileIconClass = getFileIcon(fileExtension);
  const semesterBg = getSemesterBg(semesterNumber || 1);

  const pagesOrSlides =
    slideCount != null
      ? `${slideCount} slides`
      : pageCount != null
        ? `${pageCount} pages`
        : "No page info";

  return (
    <tr className="group transition-all">
      {/* Title Column */}
      <td className="py-3 px-2 border-y border-l border-borderColor/40 dark:border-borderColor-dark/20 rounded-l-xl group-hover:bg-lightGrey7/30 dark:group-hover:bg-whiteColor-dark/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primaryColor/5 flex items-center justify-center group-hover:bg-primaryColor group-hover:text-whiteColor transition-all duration-300 shrink-0">
            <i className={`${fileIconClass} text-xl`}></i>
          </div>

          <div className="flex flex-col min-w-0">
            <Link
              href={`/materials/${id}`}
              className="font-bold text-blackColor dark:text-whiteColor text-sm hover:text-primaryColor line-clamp-1"
            >
              {title}
            </Link>

            <span className="text-[10px] text-contentColor font-medium uppercase tracking-tight line-clamp-1">
              {chapterTitle}
            </span>

            {courseTitle ? (
              <span className="text-[10px] text-contentColor/70 line-clamp-1">
                {courseTitle}
              </span>
            ) : null}
          </div>
        </div>
      </td>

      {/* Info Column */}
      <td className="py-3 px-2 border-y border-borderColor/40 dark:border-borderColor-dark/20 group-hover:bg-lightGrey7/30 dark:group-hover:bg-whiteColor-dark/5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            {semesterNumber ? (
              <span
                className={`text-[9px] text-whiteColor px-1.5 py-0.5 rounded font-bold ${semesterBg}`}
              >
                SEM {semesterNumber}
              </span>
            ) : null}

            <span className="text-xs font-bold text-blackColor dark:text-whiteColor uppercase">
              {fileExtension}
            </span>
          </div>

          <span className="text-[11px] text-contentColor">
            {fileSize} • {pagesOrSlides}
          </span>
        </div>
      </td>

      {/* Stats Column */}
      <td className="py-3 px-2 border-y border-borderColor/40 dark:border-borderColor-dark/20 group-hover:bg-lightGrey7/30 dark:group-hover:bg-whiteColor-dark/5">
        <div className="flex flex-col gap-1 text-contentColor">
          <div className="flex items-center gap-1.5">
            <i className="icofont-download text-base"></i>
            <span className="text-sm font-bold">{downloadCount}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <i className="icofont-eye-alt text-base"></i>
            <span className="text-xs font-semibold">{viewCount}</span>
          </div>
        </div>
      </td>

      {/* Actions Column */}
      <td className="py-3 pr-4 pl-2 border-y border-r border-borderColor/40 dark:border-borderColor-dark/20 rounded-r-xl group-hover:bg-lightGrey7/30 dark:group-hover:bg-whiteColor-dark/5 text-right">
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() =>
              addProductToWishlist({
                ...material,
                isMaterial: true,
                quantity: 1,
              })
            }
            className="text-contentColor hover:text-red-500 transition-colors"
            aria-label="Add to wishlist"
          >
            <i className="icofont-heart-alt"></i>
          </button>

          <a
            href={canPreviewInBrowser ? readUrl : `/materials/${id}/view`}
            target={canPreviewInBrowser ? "_blank" : undefined}
            rel={canPreviewInBrowser ? "noopener noreferrer" : undefined}
            className="text-xs font-bold text-primaryColor hover:underline"
          >
            View
          </a>

          <a
            href={downloadUrl}
            className="bg-primaryColor/10 text-primaryColor hover:bg-primaryColor hover:text-whiteColor px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          >
            Download
          </a>
        </div>
      </td>
    </tr>
  );
};

export default MaterialListItem;
