"use client";

import BalbImage from "@/components/shared/animaited-images/BalbImage";
import BookImage from "@/components/shared/animaited-images/BookImage";
import GlobImage from "@/components/shared/animaited-images/GlobImage";
import {
  useMaterialDetail,
  useToggleMaterialFavorite,
  useTrackMaterialDownload,
  useTrackMaterialView,
} from "@/features/materials/hooks";
import { mapMaterialToCardModel } from "@/features/materials/utils";
import { getFileIcon, getSemesterBg } from "@/utils/fileIcons";
import Link from "next/link";
import { useEffect, useRef } from "react";

/* -------------------------------------------------------------------------- */
/* Utils                                                                      */
/* -------------------------------------------------------------------------- */

const formatFileSize = (sizeMb) => {
  if (sizeMb === null || sizeMb === undefined || Number.isNaN(Number(sizeMb))) {
    return "—";
  }

  const num = Number(sizeMb);
  return `${num % 1 === 0 ? num.toFixed(0) : num.toFixed(1)} MB`;
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

const getPagesOrSlidesLabel = (material) => {
  if (material?.file?.slideCount != null) {
    return `${material.file.slideCount} Slides`;
  }

  if (material?.file?.pageCount != null) {
    return `${material.file.pageCount} Pages`;
  }

  return "—";
};

/* -------------------------------------------------------------------------- */
/* UI Blocks                                                                  */
/* -------------------------------------------------------------------------- */

const HeroSkeleton = () => (
  <section className="relative overflow-hidden bg-blueDark py-16 lg:py-24 animate-pulse">
    <div className="container relative z-10">
      <div className="max-w-4xl">
        <div className="flex flex-wrap gap-2 mb-6">
          <div className="h-8 w-24 rounded-full bg-white/10" />
          <div className="h-8 w-28 rounded-full bg-white/10" />
          <div className="h-8 w-24 rounded-full bg-white/10" />
        </div>

        <div className="h-12 w-2/3 rounded bg-white/10 mb-4" />
        <div className="h-12 w-1/2 rounded bg-white/10 mb-6" />

        <div className="h-5 w-full max-w-2xl rounded bg-white/10 mb-3" />
        <div className="h-5 w-4/5 rounded bg-white/10" />
      </div>
    </div>
  </section>
);

const ContentSkeleton = () => (
  <main className="container py-12 lg:py-20">
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-pulse">
      <div className="lg:col-span-8 space-y-10">
        <div>
          <div className="h-8 w-56 rounded bg-gray-200 dark:bg-gray-800 mb-6" />
          <div className="space-y-4">
            <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-4 w-4/5 rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>

        <div className="bg-lightGrey11 dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="h-6 w-40 rounded bg-gray-200 dark:bg-gray-700 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-5 rounded bg-gray-200 dark:bg-gray-700"
              />
            ))}
          </div>
        </div>

        <section className="grid grid-cols-2 md:grid-cols-3 gap-8 p-8 border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900">
          {[...Array(6)].map((_, idx) => (
            <div key={idx}>
              <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-800 mb-2" />
              <div className="h-5 w-28 rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          ))}
        </section>
      </div>

      <div className="lg:col-span-4">
        <div className="sticky top-28 space-y-6">
          <div className="bg-blueDark p-8 rounded-2xl">
            <div className="h-6 w-32 rounded bg-white/10 mb-6" />
            <div className="space-y-4">
              <div className="h-12 w-full rounded bg-white/10" />
              <div className="h-12 w-full rounded bg-white/10" />
            </div>
          </div>

          <div className="bg-lightGrey11 dark:bg-gray-800 p-8 rounded-2xl border border-secondaryColor/20">
            <div className="h-6 w-40 rounded bg-gray-200 dark:bg-gray-700 mb-4" />
            <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700 mb-2" />
            <div className="h-4 w-4/5 rounded bg-gray-200 dark:bg-gray-700 mb-6" />
            <div className="h-11 w-full rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    </div>
  </main>
);

const ErrorState = ({ title, message, showRetry = true }) => (
  <div className="container py-16 lg:py-24">
    <div className="max-w-2xl mx-auto text-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm p-8 lg:p-10">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center text-3xl mb-6">
        <i className="icofont-warning-alt"></i>
      </div>

      <h1 className="text-2xl lg:text-3xl font-bold text-blackColor dark:text-white mb-4">
        {title}
      </h1>

      <p className="text-paragraphColor dark:text-gray-400 leading-relaxed mb-8">
        {message}
      </p>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Link
          href="/materials"
          className="px-5 py-3 rounded-xl bg-primaryColor text-white font-bold hover:opacity-90 transition-all"
        >
          Back to Materials
        </Link>

        {showRetry && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-blackColor dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

const MaterialDetailsPrimary = ({ id }) => {
  const numericId = Number(id);

  const { data, isLoading, isError, error } = useMaterialDetail(numericId, {
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60,
  });

  const { mutate: trackView } = useTrackMaterialView();
  const { mutate: trackDownload } = useTrackMaterialDownload();
  const { mutate: toggleFavorite } = useToggleMaterialFavorite();

  const hasTrackedViewRef = useRef(false);

  const rawMaterial = data?.data?.data;

  useEffect(() => {
    if (!numericId || !rawMaterial) return;
    if (hasTrackedViewRef.current) return;

    hasTrackedViewRef.current = true;
    trackView({ id: numericId, cooldown_seconds: 3600 });
  }, [numericId, rawMaterial, trackView]);

  if (!id || Number.isNaN(numericId)) {
    return (
      <ErrorState
        title="Invalid material link"
        message="The material ID in the URL is not valid."
        showRetry={false}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        <HeroSkeleton />
        <ContentSkeleton />
      </div>
    );
  }

  if (isError) {
    const status =
      error?.status || error?.response?.status || error?.cause?.status || null;

    if (status === 404) {
      return (
        <ErrorState
          title="Material not found"
          message="The material you are looking for does not exist or may have been removed."
          showRetry={false}
        />
      );
    }

    return (
      <ErrorState
        title="Could not load material"
        message="We were unable to connect to the server or load this material right now. Please check your connection and try again."
      />
    );
  }

  if (!rawMaterial) {
    return (
      <ErrorState
        title="Material not found"
        message="No material data was returned from the server."
        showRetry={false}
      />
    );
  }

  const material = {
    ...mapMaterialToCardModel(rawMaterial),
    learningObjectives: rawMaterial?.learning_objectives || [],
  };

  const isFavorite =
    material?.isFavorite ?? rawMaterial?.user_state?.is_favorite ?? false;

  const fileIconClass = getFileIcon(
    material?.file?.extension || material?.materialType,
  );
  const semesterBg = getSemesterBg(material?.semesterNumber || 1);

  const readHref = material?.file?.readUrl || rawMaterial?.file?.read_url || "";
  const downloadHref =
    material?.file?.downloadUrl || rawMaterial?.file?.download_url || "";

  const canPreviewInBrowser =
    material?.file?.canPreviewInBrowser ??
    rawMaterial?.file?.can_preview_in_browser ??
    false;

  const isDownloadable =
    material?.flags?.isDownloadable ??
    rawMaterial?.flags?.is_downloadable ??
    false;

  const canReadFile = Boolean(readHref);
  const canDownloadFile = Boolean(downloadHref) && isDownloadable;

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/materials/${numericId}`
      : "";

  const shareText = `New material uploaded: ${
    material?.title || "Material"
  }\n\nView here:\n${shareUrl}`;

  const handleOpenRead = () => {
    if (!canReadFile) return;
    window.open(readHref, "_blank", "noopener,noreferrer");
  };

  const handleOpenDownload = () => {
    if (!canDownloadFile) return;
    trackDownload(numericId);
    window.open(downloadHref, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      window.alert("Link copied successfully.");
    } catch {
      window.alert("Could not copy the link.");
    }
  };

  const handleShareWhatsApp = () => {
    if (!shareUrl) return;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleNativeShare = async () => {
    if (!shareUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: material?.title || "Material",
          text: "Check this material",
          url: shareUrl,
        });
        return;
      } catch {
        // user cancelled or native share failed
      }
    }

    handleShareWhatsApp();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Hero */}
      <section className="relative overflow-hidden bg-blueDark py-16 lg:py-24">
        <div className="opacity-30">
          <BookImage />
          <GlobImage />
          <BalbImage />
        </div>

        <div className="container relative z-10">
          <div className="max-w-4xl" data-aos="fade-up">
            <div className="flex flex-wrap gap-2 mb-6">
              {material?.courseCode ? (
                <span className="px-4 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold text-white uppercase tracking-wider">
                  {material.courseCode}
                </span>
              ) : null}

              {material?.departmentName ? (
                <span className="px-4 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold text-white uppercase tracking-wider">
                  {material.departmentName}
                </span>
              ) : null}

              {material?.semesterName ? (
                <span
                  className={`px-4 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider ${semesterBg}`}
                >
                  {material.semesterName}
                </span>
              ) : null}

              {material?.flags?.isEnabled ? (
                <span className="px-4 py-1 bg-secondaryColor/20 border border-secondaryColor/30 text-secondaryColor rounded-full text-xs font-bold uppercase tracking-wider">
                  Enabled
                </span>
              ) : (
                <span className="px-4 py-1 bg-red-500/20 border border-red-400/30 text-red-300 rounded-full text-xs font-bold uppercase tracking-wider">
                  Disabled
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white text-3xl shrink-0">
                <i className={fileIconClass}></i>
              </div>

              <div>
                <p className="text-sm text-white/70 uppercase tracking-widest font-bold">
                  {material?.materialType || "Material"}
                </p>
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                  {material?.title || "Untitled Material"}
                </h1>
              </div>
            </div>

            <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-3xl mb-10">
              {material?.description ||
                "No description was provided for this material."}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left */}
          <div className="lg:col-span-8 space-y-12">
            <section data-aos="fade-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-secondaryColor rounded-full"></div>
                <h2 className="text-3xl font-bold text-blackColor dark:text-white">
                  About this material
                </h2>
              </div>

              <div className="text-paragraphColor dark:text-gray-400 text-lg leading-relaxed space-y-6">
                <p>
                  {material?.description ||
                    "No detailed description is available for this material yet."}
                </p>

                <div className="bg-lightGrey11 dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <h4 className="text-xl font-bold text-blackColor dark:text-white mb-4">
                    Learning Objectives
                  </h4>

                  {material.learningObjectives?.length ? (
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {material.learningObjectives.map((item, i) => (
                        <li
                          key={`${item}-${i}`}
                          className="flex items-start gap-2"
                        >
                          <i className="icofont-check-circled text-secondaryColor mt-1"></i>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-paragraphColor dark:text-gray-400">
                      No learning objectives were added for this material.
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section
              className="grid grid-cols-2 md:grid-cols-3 gap-8 p-8 border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900"
              data-aos="fade-up"
            >
              {[
                { label: "Department", value: material?.departmentName || "—" },
                { label: "Semester", value: material?.semesterName || "—" },
                { label: "Course", value: material?.courseTitle || "—" },
                { label: "Course Code", value: material?.courseCode || "—" },
                { label: "Chapter", value: material?.chapterTitle || "—" },
                {
                  label: "Academic Year",
                  value: material?.academicYearName || "—",
                },
                {
                  label: "File Type",
                  value: material?.file?.extension?.toUpperCase() || "—",
                },
                {
                  label: "Size",
                  value: formatFileSize(material?.file?.sizeMb),
                },
                { label: "Length", value: getPagesOrSlidesLabel(material) },
                { label: "Created", value: formatDate(material?.createdAt) },
                { label: "Updated", value: formatDate(material?.updatedAt) },
                {
                  label: "Downloads",
                  value: String(material?.stats?.downloadCount || 0),
                },
              ].map((info, idx) => (
                <div key={idx}>
                  <p className="text-xs font-bold text-secondaryColor uppercase tracking-widest mb-1">
                    {info.label}
                  </p>
                  <p className="font-bold text-blackColor dark:text-white break-words">
                    {info.value}
                  </p>
                </div>
              ))}
            </section>
          </div>

          {/* Right */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div
                className="bg-blueDark p-8 rounded-2xl shadow-2xl relative overflow-hidden"
                data-aos="fade-left"
              >
                <h3 className="text-xl font-bold text-white mb-6 relative z-10">
                  Quick Actions
                </h3>

                <div className="space-y-4 relative z-10">
                  <button
                    type="button"
                    onClick={handleOpenRead}
                    disabled={!canReadFile}
                    className={`w-full py-4 font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                      canReadFile
                        ? "bg-secondaryColor hover:bg-white text-white hover:text-secondaryColor"
                        : "bg-secondaryColor/40 text-white/60 cursor-not-allowed"
                    }`}
                  >
                    <i className="icofont-eye-alt"></i>
                    {canPreviewInBrowser ? "Open Preview" : "Open Material"}
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenDownload}
                    disabled={!canDownloadFile}
                    className={`w-full py-4 border font-bold rounded-lg transition-all duration-300 text-center block ${
                      canDownloadFile
                        ? "bg-white/10 hover:bg-white/20 text-white border-white/20"
                        : "bg-white/5 text-white/50 border-white/10 cursor-not-allowed"
                    }`}
                  >
                    Download File
                  </button>

                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="w-full py-4 font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 bg-white/5 text-white/80 border border-white/10 hover:bg-white/10"
                  >
                    <i className="icofont-share"></i>
                    Share Material
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-full py-4 font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 bg-white/5 text-white/80 border border-white/10 hover:bg-white/10"
                  >
                    <i className="icofont-copy"></i>
                    Copy Link
                  </button>

                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="w-full py-4 font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366] hover:text-white"
                  >
                    <i className="icofont-brand-whatsapp"></i>
                    Share on WhatsApp
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      toggleFavorite({
                        id: numericId,
                        is_favorite: !isFavorite,
                      })
                    }
                    className={`w-full py-4 font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                      isFavorite
                        ? "bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white"
                        : "bg-white/5 text-white/80 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <i
                      className={
                        isFavorite ? "icofont-heart" : "icofont-heart-alt"
                      }
                    ></i>
                    {isFavorite ? "Saved to Favorites" : "Save to Favorites"}
                  </button>
                </div>

                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-secondaryColor/20 rounded-full blur-3xl"></div>
              </div>

              <div
                className="bg-lightGrey11 dark:bg-gray-800 p-8 rounded-2xl border border-secondaryColor/20"
                data-aos="fade-left"
                data-aos-delay="100"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-secondaryColor rounded-xl flex items-center justify-center text-white text-2xl">
                    <i className="icofont-file-powerpoint"></i>
                  </div>

                  <div>
                    <h4 className="font-bold text-blackColor dark:text-white">
                      File Summary
                    </h4>
                    <p className="text-xs text-secondaryColor font-bold uppercase">
                      {material?.materialType || "Material"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-paragraphColor dark:text-gray-400">
                      Type
                    </span>
                    <span className="font-bold text-blackColor dark:text-white uppercase">
                      {material?.file?.extension || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-paragraphColor dark:text-gray-400">
                      Size
                    </span>
                    <span className="font-bold text-blackColor dark:text-white">
                      {formatFileSize(material?.file?.sizeMb)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-paragraphColor dark:text-gray-400">
                      Length
                    </span>
                    <span className="font-bold text-blackColor dark:text-white">
                      {getPagesOrSlidesLabel(material)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-paragraphColor dark:text-gray-400">
                      Views
                    </span>
                    <span className="font-bold text-blackColor dark:text-white">
                      {material?.stats?.viewCount || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-paragraphColor dark:text-gray-400">
                      Downloads
                    </span>
                    <span className="font-bold text-blackColor dark:text-white">
                      {material?.stats?.downloadCount || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-4 text-center">
                <Link
                  href="/materials"
                  className="inline-flex items-center gap-2 text-sm font-bold text-primaryColor hover:underline"
                >
                  <i className="icofont-long-arrow-left"></i>
                  Back to all materials
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MaterialDetailsPrimary;
