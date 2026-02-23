import { fetchJSON } from "@/lib/http";

export const signupApi = {
  registerStudent: (payload) =>
    fetchJSON("/education_people/public/students/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};