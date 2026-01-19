"use server";

import { redirect } from "next/navigation";

import type { LoginFormData, SignupFormData } from "@/app/(auth)/schema";
import { login, register } from "@/lib/api/auth";
import { clearAuthCookies, setAuthToken, setUserData } from "@/lib/cookie";

type ActionResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

export async function handleRegister(formData: SignupFormData): Promise<ActionResult> {
  try {
    const response = await register(formData);

    if (response?.success) {
      if (response?.token) await setAuthToken(response.token);
      if (response?.data) await setUserData(response.data);
    }

    return {
      success: Boolean(response?.success),
      message: response?.message ?? "Registration completed",
      data: response?.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Registration failed",
    };
  }
}

export async function handleLogin(formData: LoginFormData): Promise<ActionResult> {
  try {
    const response = await login(formData);

    if (response?.success) {
      if (response?.token) await setAuthToken(response.token);
      if (response?.data) await setUserData(response.data);
    }

    return {
      success: Boolean(response?.success),
      message: response?.message ?? "Login completed",
      data: response?.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Login failed",
    };
  }
}

export async function handleLogout(): Promise<never> {
  await clearAuthCookies();
  redirect("/login");
}
