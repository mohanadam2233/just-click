"use client";

import { useMutation } from "@tanstack/react-query";
import { signupApi } from "./api";

export function useRegisterStudent(options = {}) {
  return useMutation({
    mutationFn: signupApi.registerStudent,
    ...options,
  });
}
