/**
 * Extract a clean user-facing message from API errors (fetchJSON / APIError).
 */
export function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (!error) return fallback;

  const direct = typeof error.message === "string" ? error.message.trim() : "";
  if (direct && !direct.startsWith("HTTP ")) {
    return direct;
  }

  const info = error.info;
  if (info && typeof info === "object") {
    if (typeof info.message === "string" && info.message.trim()) {
      return info.message.trim();
    }

    const errors = info.errors;
    if (errors && typeof errors === "object") {
      const parts = Object.values(errors)
        .flat()
        .filter(Boolean)
        .map(String);
      if (parts.length) return parts.join(" ");
    }
  }

  if (direct) return direct;
  return fallback;
}

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isValidEmail(value) {
  const text = String(value || "").trim();
  return EMAIL_RE.test(text);
}
