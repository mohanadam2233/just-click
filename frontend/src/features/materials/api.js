import { fetchJSON } from "@/lib/http";

/**
 * Remove undefined, null, and empty string values
 */
function cleanParams(params = {}) {
  const cleaned = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    // keep false / 0 / true
    cleaned[key] = value;
  });

  return cleaned;
}

/**
 * Convert params object to query string
 */
function toQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(cleanParams(params)).forEach(([key, value]) => {
    searchParams.append(key, String(value));
  });

  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Build FormData for create/update material
 * API expects:
 * - key "payload" => JSON string
 * - key "file" => uploaded file
 */
function buildMaterialFormData({ payload, file }) {
  const formData = new FormData();

  formData.append("payload", JSON.stringify(payload || {}));

  if (file) {
    formData.append("file", file);
  }

  return formData;
}

export const materialsApi = {
  /**
   * Create material
   * body must be FormData
   */
  createMaterial: ({ payload, file }) =>
    fetchJSON("/materials/create/material", {
      method: "POST",
      body: buildMaterialFormData({ payload, file }),
    }),

  /**
   * Update material
   * Adjust endpoint if your backend uses another route
   * Example assumed: /materials/{id}/update
   */
  updateMaterial: ({ id, payload, file }) =>
    fetchJSON(`/materials/${id}/update`, {
      method: "PUT",
      body: buildMaterialFormData({ payload, file }),
    }),

  /**
   * Get single material detail
   */
  getMaterial: (id) =>
    fetchJSON(`/materials/get/${id}`, {
      method: "GET",
    }),

  /**
   * List materials
   * supports page or cursor params
   */
  getMaterialsList: (params = {}) =>
    fetchJSON(`/materials/list${toQueryString(params)}`, {
      method: "GET",
    }),
  /**
   * Get materials filter options
   * supports optional params like:
   * - semester_id
   * - course_id
   * - chapter_id
   * - academic_year_id
   */
  getMaterialFilterOptions: (params = {}) =>
    fetchJSON(`/materials/filter-options${toQueryString(params)}`, {
      method: "GET",
    }),
  /**
   * Delete single material
   */
  deleteMaterial: (id) =>
    fetchJSON(`/materials/${id}/delete`, {
      method: "DELETE",
    }),

  /**
   * Bulk delete materials
   */
  bulkDeleteMaterials: ({ ids }) =>
    fetchJSON("/materials/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),

  /**
   * List favorite materials
   */
  getFavoritesList: (params = {}) =>
    fetchJSON(`/materials/favorites/list${toQueryString(params)}`, {
      method: "GET",
    }),

  /**
   * Toggle material favorite status
   */
  setFavorite: ({ id, is_favorite }) =>
    fetchJSON(`/materials/${id}/favorite`, {
      method: "POST",
      body: JSON.stringify({ is_favorite }),
    }),

  /**
   * Track material view
   */
  trackView: (id, cooldown_seconds = 3600) =>
    fetchJSON(`/materials/${id}/view?cooldown_seconds=${cooldown_seconds}`, {
      method: "POST",
    }),

  /**
   * Track material download
   */
  trackDownload: (id) =>
    fetchJSON(`/materials/${id}/download`, {
      method: "POST",
    }),
};
