"use client";

import useNotify from "./useNotify";

export default function useSweetAlert() {
  const notify = useNotify();

  return (type = "success", message = "Done", options = {}) => {
    const safeMessage = String(message || "Done");

    if (type === "success") return notify.success(safeMessage, options);
    if (type === "error") return notify.error(safeMessage, options);
    if (type === "warning") return notify.warning(safeMessage, options);
    if (type === "info") return notify.info(safeMessage, options);

    return notify.show(type, safeMessage, options);
  };
}
