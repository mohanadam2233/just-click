export const academicCoursesRootKey = ["academic-courses"];

function generateEntityKeys(entityName) {
  const root = [...academicCoursesRootKey, entityName];

  return {
    root: () => root,

    lists: () => [...root, "list"],
    list: (params = {}) => [...root, "list", params],

    infiniteLists: () => [...root, "infinite-list"],
    infiniteList: (params = {}) => [...root, "infinite-list", params],

    details: () => [...root, "detail"],
    detail: (id) => [...root, "detail", id],

    dropdowns: () => [...root, "dropdown"],
    dropdown: (params = {}) => [...root, "dropdown", params],

    mutations: () => [...root, "mutation"],
    create: () => [...root, "mutation", "create"],
    update: (id) => [...root, "mutation", "update", id],
    delete: (id) => [...root, "mutation", "delete", id],
    bulkDelete: () => [...root, "mutation", "bulk-delete"],
  };
}

export const academicCourseKeys = {
  root: academicCoursesRootKey,

  courses: generateEntityKeys("courses"),
  courseOfferings: generateEntityKeys("course-offerings"),
  chapters: generateEntityKeys("chapters"),
};
