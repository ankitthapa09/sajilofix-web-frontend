import { apiClient } from "./axios";
import { API_ENDPOINTS } from "./endpoints";

type Role = "admin" | "authority" | "citizen";

type Status = "active" | "suspended";

type AdminUserRow = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  department?: string;
  status: Status;
  joinedDate: string;
  lastActive: string;
  activity: string;
};

type ListUsersResponse = {
  success: boolean;
  data: AdminUserRow[];
};

type CreateAuthorityRequest = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  wardNumber: string;
  municipality: string;
  department?: string;
  status: Status;
};

type ApiResponse<T = unknown> = {
  success?: boolean;
  message?: string;
  data?: T;
};

function unwrapError(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message || err.message || fallback;
}

export async function adminListUsers(): Promise<ListUsersResponse> {
  try {
    const response = await apiClient.get(API_ENDPOINTS.admin.users);
    return response.data as ListUsersResponse;
  } catch (error: unknown) {
    throw new Error(unwrapError(error, "Failed to load users"));
  }
}

export async function adminCreateAuthority(payload: CreateAuthorityRequest): Promise<ApiResponse> {
  try {
    const response = await apiClient.post(API_ENDPOINTS.admin.authorities, payload);
    return response.data as ApiResponse;
  } catch (error: unknown) {
    throw new Error(unwrapError(error, "Failed to create authority account"));
  }
}
