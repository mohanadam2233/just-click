import { fetchJSON } from "@/lib/http";

export const authApi = {
  login: (payload) =>
    fetchJSON("/auth/login", { method: "POST", body: JSON.stringify(payload) }),

  logout: () =>
    fetchJSON("/auth/logout", { method: "POST" }),

  me: () =>
    fetchJSON("/auth/me"),
  verifyEmail: ({ username, token }) =>
    fetchJSON(
      `/auth/verify-email?username=${encodeURIComponent(username)}&token=${encodeURIComponent(token)}`
    ),

  getMyProfilePage: () =>
    fetchJSON("/auth/me/profile-page"),

  updateMyProfilePage: (payload) =>
    fetchJSON("/auth/me/profile-page/update", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};