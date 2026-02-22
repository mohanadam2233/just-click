import { fetchJSON } from "@/lib/http";

export const authApi = {
  login: (payload) =>
    fetchJSON("/auth/login", { method: "POST", body: JSON.stringify(payload) }),

  logout: () =>
    fetchJSON("/auth/logout", { method: "POST" }),

  me: () =>
    fetchJSON("/auth/me"),
};