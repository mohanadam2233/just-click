"use client";

import Swal from "sweetalert2";
import { getApiErrorMessage } from "@/lib/apiErrors";

const toastBase = Swal.mixin({
  toast: true,
  position: "bottom-start", // Frappe-like bottom toast
  showConfirmButton: false,
  showCloseButton: true,
  timer: 2600,
  timerProgressBar: false,
  customClass: {
    popup: "jc-toast-popup",
    title: "jc-toast-title",
    closeButton: "jc-toast-close",
    icon: "jc-toast-icon",
  },
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

export default function useNotify() {
  const show = (icon = "success", title = "Done", options = {}) => {
    return toastBase.fire({
      icon,
      title: String(title || "Done"),
      ...options,
    });
  };

  return {
    show,

    success: (title = "Saved", options = {}) => show("success", title, options),

    error: (title = "Something went wrong", options = {}) => {
      const message =
        typeof title === "object" && title !== null
          ? getApiErrorMessage(title)
          : String(title || "Something went wrong");
      return show("error", message, options);
    },

    info: (title = "Info", options = {}) => show("info", title, options),

    warning: (title = "Warning", options = {}) =>
      show("warning", title, options),

    loading: (title = "Please wait...") =>
      Swal.fire({
        title: String(title || "Please wait..."),
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        customClass: {
          popup: "jc-modal-popup",
          title: "jc-modal-title",
        },
        didOpen: () => {
          Swal.showLoading();
        },
      }),

    close: () => Swal.close(),
  };
}
