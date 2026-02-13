"use server";

import { redirect } from "next/navigation";

import type {
  LoginFormData,
  SignupFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
} from "@/app/(auth)/schema";
import { login, register, requestPasswordReset, resetPassword } from "@/lib/api/auth";
import { clearAuthCookies, setAuthToken, setUserData } from "@/lib/cookie";

type ActionResult<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

type UserSessionData = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  profilePhoto?: string;
  [key: string]: unknown;
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

export async function handleForgotPassword(formData: ForgotPasswordFormData): Promise<ActionResult> {
  try {
    const response = await requestPasswordReset(formData);
    return {
      success: Boolean(response?.success ?? true),
      message: response?.message ?? "If the email exists, a reset link has been sent",
      data: response?.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unable to send reset link",
    };
  }
}

export async function handleResetPassword(
  token: string,
  formData: ResetPasswordFormData,
): Promise<ActionResult> {
  try {
    const response = await resetPassword(token, formData);
    return {
      success: Boolean(response?.success ?? true),
      message: response?.message ?? "Password reset successfully",
      data: response?.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unable to reset password",
    };
  }
}

export async function syncUserData(userData: UserSessionData): Promise<ActionResult<UserSessionData>> {
  try {
    await setUserData(userData);
    return {
      success: true,
      message: "User session updated",
      data: userData,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update session",
    };
  }
}
