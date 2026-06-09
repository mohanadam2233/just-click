export const rootKey = ["academic"];

function generateEntityKeys(entityName) {
  const root = [...rootKey, entityName];
  return {
    root: () => root,
    lists: () => [...root, "list"],
    list: (params = {}) => [...root, "list", params],
    details: () => [...root, "detail"],
    detail: (id) => [...root, "detail", id],
    dropdowns: () => [...root, "dropdown"],
    dropdown: (params = {}) => [...root, "dropdown", params],
  };
}

export const academicKeys = {
  root: rootKey,
  faculties: generateEntityKeys("faculties"),
  departments: generateEntityKeys("departments"),
  courses: generateEntityKeys("courses"),
  chapters: generateEntityKeys("chapters"),
  semesters: generateEntityKeys("semesters"),
  academicYears: generateEntityKeys("academic-years"),

  courseOfferings: {
    root: () => [...rootKey, "course-offerings"],
    materialDropdown: (params = {}) => [
      ...rootKey,
      "course-offerings",
      "material-dropdown",
      params,
    ],
    chaptersDropdown: (courseOfferingId, params = {}) => [
      ...rootKey,
      "course-offerings",
      courseOfferingId,
      "chapters-dropdown",
      params,
    ],
  },
};
