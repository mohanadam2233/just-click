import { fetchJSON } from "@/lib/http";

export const materialsApi = {
  list: () => fetchJSON("/materials/list"),
  detail: (id) => fetchJSON(`/materials/${id}`),
};