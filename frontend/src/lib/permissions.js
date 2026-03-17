export function hasPermission(user, permission) {
  if (!user) return false;

  // super admin → allow all
  if (user.permissions?.includes("*")) return true;

  return user.permissions?.includes(permission);
}

export function hasAnyPermission(user, permissions = []) {
  if (!user) return false;

  if (user.permissions?.includes("*")) return true;

  return permissions.some((p) => user.permissions?.includes(p));
}
