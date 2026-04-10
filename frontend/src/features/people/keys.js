export const peopleKeys = {
  students: {
    lists: () => ["students", "list"],
    list: (filters) => ["students", "list", { ...filters }],
    detail: (id) => ["students", "detail", id],
  },
  staff: {
    lists: () => ["staff", "list"],
    list: (filters) => ["staff", "list", { ...filters }],
    detail: (id) => ["staff", "detail", id],
  },
  onboarding: {
    lists: () => ["onboarding", "list"],
    list: (filters) => ["onboarding", "list", { ...filters }],
    detail: (id) => ["onboarding", "detail", id],
  }
};
