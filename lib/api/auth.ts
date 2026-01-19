import { type LoginFormData, type SignupFormData } from "@/app/(auth)/schema";
import { apiClient } from "./axios";
import { API_ENDPOINTS } from "./endpoints";

export const register = async (registerData: SignupFormData) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.auth.register, registerData);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    throw new Error(err.response?.data?.message || err.message || "Registration failed");
  }
};

export const login = async (loginData: LoginFormData) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.auth.login, loginData);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    throw new Error(err.response?.data?.message || err.message || "Login failed");
  }
};
