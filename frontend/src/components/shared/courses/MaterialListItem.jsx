// "use client";

// import {
//   useToggleMaterialFavorite,
//   useTrackMaterialDownload,
//   useTrackMaterialView,
// } from "@/features/materials/hooks";
// import { getFileIcon, getSemesterBg } from "@/utils/fileIcons";
// import Link from "next/link";

// const formatFileSize = (sizeMb) => {
//   if (sizeMb === null || sizeMb === undefined || Number.isNaN(Number(sizeMb))) {
//     return "—";
//   }

//   const num = Number(sizeMb);
//   return `${num % 1 === 0 ? num.toFixed(0) : num.toFixed(1)} MB`;
// };

// const getSafeFileName = (material) => {
//   const title = material?.title || "material";
//   const ext = material?.file?.extension || material?.materialType || "file";
//   const safeTitle = title.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").trim();

//   return `${safeTitle || "material"}.${String(ext).replace(/^\./, "")}`;
// };

// const normalizeUrl = (url) => {
//   if (!url) return "#";
//   return url.replace("http://127.0.0.1:7000", "http://localhost:7000");
// };

// const MaterialListItem = ({ material, onToggleFavorite, onShareMaterial }) => {
//   const { mutate: toggleFavorite } = useToggleMaterialFavorite();
//   const { mutate: trackView } = useTrackMaterialView();
//   const { mutate: trackDownload } = useTrackMaterialDownload();

//   const id = material?.id;
//   const title = material?.title || "Untitled Material";
//   const chapterTitle = material?.chapterTitle || "No Chapter";
//   const courseTitle = material?.courseTitle || "";
//   const semesterNumber = material?.semesterNumber;
//   const materialType = material?.materialType || "file";

//   const fileExtension = material?.file?.extension || materialType;
//   const fileSize = formatFileSize(material?.file?.sizeMb);
//   const pageCount = material?.file?.pageCount;
//   const slideCount = material?.file?.slideCount;
//   const downloadUrl = material?.file?.downloadUrl || "#";
//   const readUrl = material?.file?.readUrl || "#";
//   const canPreviewInBrowser = material?.file?.canPreviewInBrowser ?? false;

//   const downloadCount = material?.stats?.downloadCount || 0;
//   const viewCount = material?.stats?.viewCount || 0;

//   const fileIconClass = getFileIcon(fileExtension);
//   const semesterBg = getSemesterBg(semesterNumber || 1);

//   const pagesOrSlides =
//     slideCount != null
//       ? `${slideCount} slides`
//       : pageCount != null
//         ? `${pageCount} pages`
//         : "No page info";

//   const handleViewClick = () => {
//     if (!id) return;
//     trackView({ id, cooldown_seconds: 3600 });
//   };

//   const handleFavoriteClick = async (e) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (!id) return;

//     if (typeof onToggleFavorite === "function") {
//       await onToggleFavorite(material);
//       return;
//     }

//     toggleFavorite({ id, is_favorite: !material?.isFavorite });
//   };

//   const handleShareClick = (e) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (typeof onShareMaterial === "function") {
//       onShareMaterial(material);
//       return;
//     }

//     const shareUrl =
//       typeof window !== "undefined"
//         ? `${window.location.origin}/materials/${id}`
//         : "";

//     if (!shareUrl) return;

//     const shareText = `New material uploaded: ${
//       material?.title || "Material"
//     }\n\nView here:\n${shareUrl}`;

//     if (navigator.share) {
//       navigator
//         .share({
//           title: material?.title || "Material",
//           text: "Check this material",
//           url: shareUrl,
//         })
//         .catch(() => {
//           const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
//             shareText,
//           )}`;
//           window.open(whatsappUrl, "_blank", "noopener,noreferrer");
//         });
//       return;
//     }

//     const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
//     window.open(whatsappUrl, "_blank", "noopener,noreferrer");
//   };

//   const handleDownloadClick = async (e) => {
//     e.preventDefault();
//     e.stopPropagation();

//     const finalDownloadUrl = normalizeUrl(downloadUrl);

//     if (!id || !finalDownloadUrl || finalDownloadUrl === "#") return;

//     try {
//       const token =
//         localStorage.getItem("token") ||
//         localStorage.getItem("access_token") ||
//         localStorage.getItem("authToken");

//       const response = await fetch(finalDownloadUrl, {
//         method: "GET",
//         credentials: "include",
//         headers: token ? { Authorization: `Bearer ${token}` } : {},
//       });

//       if (response.status === 401) {
//         alert("Your login session expired. Please login again.");
//         return;
//       }

//       if (!response.ok) {
//         alert("Download failed. Please try again.");
//         return;
//       }

//       const blob = await response.blob();
//       const blobUrl = window.URL.createObjectURL(blob);

//       const link = document.createElement("a");
//       link.href = blobUrl;
//       link.download = getSafeFileName(material);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();

//       window.URL.revokeObjectURL(blobUrl);

//       trackDownload(id);
//     } catch (error) {
//       console.error("Download failed:", error);
//       alert("Download failed. Please check your connection.");
//     }
//   };

//   return (
//     <tr className="group transition-all">
//       <td className="py-3 px-2 border-y border-l border-borderColor/40 dark:border-borderColor-dark/20 rounded-l-xl group-hover:bg-lightGrey7/30 dark:group-hover:bg-whiteColor-dark/5">
//         <div className="flex items-center gap-4">
//           <div className="w-10 h-10 rounded-lg bg-primaryColor/5 flex items-center justify-center group-hover:bg-primaryColor group-hover:text-whiteColor transition-all duration-300 shrink-0">
//             <i className={`${fileIconClass} text-xl`}></i>
//           </div>

//           <div className="flex flex-col min-w-0">
//             <Link
//               href={`/materials/${id}`}
//               className="font-bold text-blackColor dark:text-whiteColor text-sm hover:text-primaryColor line-clamp-1"
//             >
//               {title}
//             </Link>

//             <span className="text-[10px] text-contentColor font-medium uppercase tracking-tight line-clamp-1">
//               {chapterTitle}
//             </span>

//             {courseTitle ? (
//               <span className="text-[10px] text-contentColor/70 line-clamp-1">
//                 {courseTitle}
//               </span>
//             ) : null}
//           </div>
//         </div>
//       </td>

//       <td className="py-3 px-2 border-y border-borderColor/40 dark:border-borderColor-dark/20 group-hover:bg-lightGrey7/30 dark:group-hover:bg-whiteColor-dark/5">
//         <div className="flex flex-col">
//           <div className="flex items-center gap-2 flex-wrap">
//             {semesterNumber ? (
//               <span
//                 className={`text-[9px] text-whiteColor px-1.5 py-0.5 rounded font-bold ${semesterBg}`}
//               >
//                 SEM {semesterNumber}
//               </span>
//             ) : null}

//             <span className="text-xs font-bold text-blackColor dark:text-whiteColor uppercase">
//               {fileExtension}
//             </span>
//           </div>

//           <span className="text-[11px] text-contentColor">
//             {fileSize} • {pagesOrSlides}
//           </span>
//         </div>
//       </td>

//       <td className="py-3 px-2 border-y border-borderColor/40 dark:border-borderColor-dark/20 group-hover:bg-lightGrey7/30 dark:group-hover:bg-whiteColor-dark/5">
//         <div className="flex flex-col gap-1 text-contentColor">
//           <div className="flex items-center gap-1.5">
//             <i className="icofont-download text-base"></i>
//             <span className="text-sm font-bold">{downloadCount}</span>
//           </div>

//           <div className="flex items-center gap-1.5">
//             <i className="icofont-eye-alt text-base"></i>
//             <span className="text-xs font-semibold">{viewCount}</span>
//           </div>
//         </div>
//       </td>

//       <td className="py-3 pr-4 pl-2 border-y border-r border-borderColor/40 dark:border-borderColor-dark/20 rounded-r-xl group-hover:bg-lightGrey7/30 dark:group-hover:bg-whiteColor-dark/5 text-right">
//         <div className="flex items-center justify-end gap-3">
//           <button
//             type="button"
//             onClick={handleFavoriteClick}
//             className="text-contentColor hover:text-red-500 transition-colors"
//             aria-label={
//               material?.isFavorite
//                 ? "Remove from favorites"
//                 : "Add to favorites"
//             }
//           >
//             <i
//               className={
//                 material?.isFavorite
//                   ? "icofont-heart text-red-500"
//                   : "icofont-heart-alt"
//               }
//             ></i>
//           </button>

//           <button
//             type="button"
//             onClick={handleShareClick}
//             className="text-contentColor hover:text-primaryColor transition-colors"
//             aria-label="Share material"
//             title="Share material"
//           >
//             <i className="icofont-share"></i>
//           </button>

//           <a
//             href={
//               canPreviewInBrowser ? normalizeUrl(readUrl) : `/materials/${id}`
//             }
//             target={canPreviewInBrowser ? "_blank" : undefined}
//             rel={canPreviewInBrowser ? "noopener noreferrer" : undefined}
//             onClick={handleViewClick}
//             className="text-xs font-bold text-primaryColor hover:underline"
//           >
//             View
//           </a>

//           <button
//             type="button"
//             onClick={handleDownloadClick}
//             className="px-4 py-2 rounded-lg bg-blackColor dark:bg-primaryColor text-whiteColor text-xs font-bold hover:opacity-90 transition-all"
//           >
//             Download
//           </button>
//         </div>
//       </td>
//     </tr>
//   );
// };

// export default MaterialListItem;
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

const normalizeUrl = (url) => {
  if (!url) return "#";
  return String(url).replace("http://127.0.0.1:7000", "http://localhost:7000");
};

const getMaterialFile = (material) => {
  return material?.file || material?.rawItem?.file || {};
};

const getDownloadUrl = (material) => {
  const file = getMaterialFile(material);
  return normalizeUrl(file.downloadUrl || file.download_url || "");
};

const getReadUrl = (material) => {
  const file = getMaterialFile(material);
  return normalizeUrl(file.readUrl || file.read_url || "");
};

const getFileExtension = (material) => {
  const file = getMaterialFile(material);
  return file.extension || material?.materialType || "file";
};

const getCanPreviewInBrowser = (material) => {
  const file = getMaterialFile(material);

  return Boolean(
    file.canPreviewInBrowser ??
    file.can_preview_in_browser ??
    material?.rawItem?.file?.can_preview_in_browser ??
    false,
  );
};

const getSafeFileName = (material) => {
  const title = material?.title || "material";
  const ext = getFileExtension(material);
  const safeTitle = title.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").trim();

  return `${safeTitle || "material"}.${String(ext).replace(/^\./, "")}`;
};

const getFilenameFromContentDisposition = (headerValue) => {
  if (!headerValue) return null;

  const utf8Match = headerValue.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].replace(/["]/g, ""));
    } catch {
      return utf8Match[1].replace(/["]/g, "");
    }
  }

  const normalMatch = headerValue.match(/filename="?([^"]+)"?/i);
  if (normalMatch?.[1]) return normalMatch[1];

  return null;
};

const getAuthHeaders = () => {
  if (typeof window === "undefined") return {};

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken");

  return token ? { Authorization: `Bearer ${token}` } : {};
};

const downloadBlobFromUrl = async ({ url, filename }) => {
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    throw new Error("Your login session expired. Please login again.");
  }

  if (!response.ok) {
    throw new Error("Download failed. Please try again.");
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const text = await response.text().catch(() => "");
    throw new Error(
      text || "Download failed. Server returned JSON instead of a file.",
    );
  }

  const blob = await response.blob();

  const responseFileName = getFilenameFromContentDisposition(
    response.headers.get("content-disposition"),
  );

  const blobUrl = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = responseFileName || filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(blobUrl);
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

  const file = getMaterialFile(material);
  const fileExtension = getFileExtension(material);
  const fileSize = formatFileSize(file.sizeMb ?? file.size_mb);
  const pageCount = file.pageCount ?? file.page_count;
  const slideCount = file.slideCount ?? file.slide_count;
  const downloadUrl = getDownloadUrl(material);
  const readUrl = getReadUrl(material);
  const canPreviewInBrowser = getCanPreviewInBrowser(material);

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

  const viewHref =
    canPreviewInBrowser && readUrl && readUrl !== "#"
      ? readUrl
      : `/materials/${id}`;

  const handleViewClick = () => {
    if (!id) return;
    trackView({ id, cooldown_seconds: 3600 });
  };

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!id) return;

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

  const handleDownloadClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!id || !downloadUrl || downloadUrl === "#") {
      alert("No download file is available.");
      return;
    }

    try {
      await downloadBlobFromUrl({
        url: downloadUrl,
        filename: getSafeFileName(material),
      });

      trackDownload(id);
    } catch (error) {
      console.error("Download failed:", error);
      alert(error?.message || "Download failed. Please check your connection.");
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
            href={viewHref}
            target={canPreviewInBrowser ? "_blank" : undefined}
            rel={canPreviewInBrowser ? "noopener noreferrer" : undefined}
            onClick={handleViewClick}
            className="text-contentColor hover:text-primaryColor transition-colors"
            aria-label="View material"
            title="View material"
          >
            <i className="icofont-eye-alt"></i>
          </a>

          <button
            type="button"
            onClick={handleDownloadClick}
            className="px-4 py-2 rounded-lg bg-blackColor dark:bg-primaryColor text-whiteColor text-xs font-bold hover:opacity-90 transition-all"
          >
            Download
          </button>
        </div>
      </td>
    </tr>
  );
};

export default MaterialListItem;
