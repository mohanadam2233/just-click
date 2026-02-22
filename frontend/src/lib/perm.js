export function hasPermission(perms, needed) {
  if (!perms?.length) return false;
  if (perms.includes("*") || perms.includes("*:*")) return true;

  const [needEntity, needAction = "*"] = String(needed).split(":");
  const ne = String(needEntity || "").trim().toLowerCase();
  const na = String(needAction || "").trim().toUpperCase();

  return perms.some((p) => {
    const s = String(p || "").trim();
    if (!s) return false;
    if (s === "*" || s === "*:*") return true;

    const [ownEntity, ownAction = "*"] = s.split(":");
    const oe = String(ownEntity || "").trim().toLowerCase();
    const oa = String(ownAction || "").trim().toUpperCase();

    if (oe !== ne && oe !== "*") return false;
    if (oa === "*" || oa === "MANAGE") return true;
    return oa === na;
  });
}