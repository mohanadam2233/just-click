export const materialsKeys = {
  root: ["materials"],

  lists: () => [...materialsKeys.root, "list"],

  list: (params = {}) => [...materialsKeys.lists(), params],

  details: () => [...materialsKeys.root, "detail"],

  detail: (id) => [...materialsKeys.details(), id],

  filterOptionsRoot: () => [...materialsKeys.root, "filter-options"],

  filterOptions: (params = {}) => [
    ...materialsKeys.filterOptionsRoot(),
    params,
  ],
  create: () => [...materialsKeys.root, "create"],

  update: (id) => [...materialsKeys.root, "update", id],

  delete: (id) => [...materialsKeys.root, "delete", id],

  bulkDelete: () => [...materialsKeys.root, "bulk-delete"],
};
