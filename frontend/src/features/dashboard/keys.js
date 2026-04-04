export const dashboardKeys = {
  all: ["dashboard"],
  adminSummary: (params = {}) => [...dashboardKeys.all, "admin-summary", params],
};
