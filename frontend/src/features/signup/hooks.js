"use client";

import { useMutation } from "@tanstack/react-query";
import { signupApi } from "./api";

export function useRegisterStudent() {
  return useMutation({
    mutationFn: signupApi.registerStudent,
  });
}