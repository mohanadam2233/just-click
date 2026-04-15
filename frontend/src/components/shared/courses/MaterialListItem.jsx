"use client";

import {
  useToggleMaterialFavorite,
  useTrackMaterialDownload,
  useTrackMaterialView,
} from "@/features/materials/hooks";
import { getFileIcon, getSemesterBg } from "@/utils/fileIcons";
import Link from "next/link";

const formatFileSize = (sizeMb) => {
  if (sizeMb === null || sizeMb === undefined || Number.isNaN(Number(sizeMb))) {
    return "—";
  }

  const num = Number(sizeMb);
  return `${num % 1 === 0 ? num.toFixed(0) : num.toFixed(1)} MB`;
};

const getSafeFileName = (material) => {
  const title = material?.title || "material";
  const ext = material?.file?.extension || material?.materialType || "file";

  const safeTitle = title.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").trim();
  return `${safeTitle}.${String(ext).replace(/^\./, "")}`;
};

const MaterialListItem = ({ material, onToggleFavorite, onShareMaterial }) => {
  const { mutate: toggleFavorite } = useToggleMaterialFavorite();
  const { mutate: trackView } = useTrackMaterialView();
  const { mutate: trackDownload } = useTrackMaterialDownload();

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

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (typeof onToggleFavorite === "function") {
      await onToggleFavorite(material);
      return;
    }

    toggleFavorite({ id, is_favorite: !material?.isFavorite });
  };

  const handleShareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (typeof onShareMaterial === "function") {
      onShareMaterial(material);
      return;
    }

    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/materials/${id}`
        : "";

    if (!shareUrl) return;

    const shareText = `New material uploaded: ${
      material?.title || "Material"
    }\n\nView here:\n${shareUrl}`;

    if (navigator.share) {
      navigator
        .share({
          title: material?.title || "Material",
          text: "Check this material",
          url: shareUrl,
        })
        .catch(() => {
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
            shareText,
          )}`;
          window.open(whatsappUrl, "_blank", "noopener,noreferrer");
        });
      return;
    }

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleViewClick = (e) => {
    e.stopPropagation();
    trackView({ id, cooldown_seconds: 3600 });
  };

  const handleDownloadClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!downloadUrl || downloadUrl === "#") return;

    try {
      trackDownload(id);

      const response = await fetch(downloadUrl, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = getSafeFileName(material);
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <tr className="group transition-all">
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

      <td className="py-3 pr-4 pl-2 border-y border-r border-borderColor/40 dark:border-borderColor-dark/20 rounded-r-xl group-hover:bg-lightGrey7/30 dark:group-hover:bg-whiteColor-dark/5 text-right">
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleFavoriteClick}
            className="text-contentColor hover:text-red-500 transition-colors"
            aria-label={
              material?.isFavorite
                ? "Remove from favorites"
                : "Add to favorites"
            }
          >
            <i
              className={
                material?.isFavorite
                  ? "icofont-heart text-red-500"
                  : "icofont-heart-alt"
              }
            ></i>
          </button>

          <button
            type="button"
            onClick={handleShareClick}
            className="text-contentColor hover:text-primaryColor transition-colors"
            aria-label="Share material"
            title="Share material"
          >
            <i className="icofont-share"></i>
          </button>

          <a
            href={canPreviewInBrowser ? readUrl : `/materials/${id}`}
            target={canPreviewInBrowser ? "_blank" : undefined}
            rel={canPreviewInBrowser ? "noopener noreferrer" : undefined}
            onClick={handleViewClick}
            className="text-xs font-bold text-primaryColor hover:underline"
          >
            View
          </a>

          <button
            type="button"
            onClick={handleDownloadClick}
            className="bg-primaryColor/10 text-primaryColor hover:bg-primaryColor hover:text-whiteColor px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          >
            Download
          </button>
        </div>
      </td>
    </tr>
  );
};

export default MaterialListItem;
