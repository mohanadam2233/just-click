import { fetchJSON } from "@/lib/http";

function cleanParams(params = {}) {
  const cleaned = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    cleaned[key] = value;
  });
  return cleaned;
}

function toQueryString(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(cleanParams(params)).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

export const peopleApi = {
  // --- Students ---
  getStudentsList: (params) => fetchJSON(`/admin/students/list${toQueryString(params)}`, { method: "GET" }),
  getStudent: (id) => fetchJSON(`/admin/students/${id}`, { method: "GET" }),
  updateStudent: ({ id, payload }) => fetchJSON(`/admin/students/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  // --- Staff ---
  getStaffList: (params) => fetchJSON(`/admin/staff/list${toQueryString(params)}`, { method: "GET" }),
  getStaff: (id) => fetchJSON(`/admin/staff/${id}`, { method: "GET" }),
  updateStaff: ({ id, payload }) => fetchJSON(`/admin/staff/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  // --- Onboarding ---
  getOnboardingList: (params) => fetchJSON(`/admin/onboarding/list${toQueryString(params)}`, { method: "GET" }),
  getOnboarding: (id) => fetchJSON(`/admin/onboarding/${id}`, { method: "GET" }),
};
