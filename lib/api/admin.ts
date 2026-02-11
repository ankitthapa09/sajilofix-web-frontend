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

type CreateCitizenRequest = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  wardNumber: string;
  municipality: string;
  district?: string;
  tole?: string;
  dob?: string;
  citizenshipNumber?: string;
  status: Status;
};

type AuthorityDetail = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  wardNumber?: string;
  municipality?: string;
  department?: string;
  status: Status;
  role: "authority";
  profilePhoto?: string;
};

type CitizenDetail = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  wardNumber?: string;
  municipality?: string;
  district?: string;
  tole?: string;
  dob?: string;
  citizenshipNumber?: string;
  status: Status;
  role: "citizen";
  profilePhoto?: string;
};

type UpdateAuthorityRequest = Partial<
  Pick<AuthorityDetail, "fullName" | "email" | "phone" | "wardNumber" | "municipality" | "department" | "status">
> & {
  password?: string;
};

type UpdateCitizenRequest = Partial<
  Pick<
    CitizenDetail,
    "fullName" | "email" | "phone" | "wardNumber" | "municipality" | "district" | "tole" | "dob" | "citizenshipNumber" | "status"
  >
> & {
  password?: string;
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

export async function adminCreateCitizen(payload: CreateCitizenRequest): Promise<ApiResponse> {
  try {
    const response = await apiClient.post(API_ENDPOINTS.admin.citizens, payload);
    return response.data as ApiResponse;
  } catch (error: unknown) {
    throw new Error(unwrapError(error, "Failed to create citizen account"));
  }
}

export async function adminGetAuthority(id: string): Promise<AuthorityDetail> {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.admin.authorities}/${id}`);
    const data = response.data as { success?: boolean; data?: AuthorityDetail };
    if (!data?.data) throw new Error("Invalid response");
    return data.data;
  } catch (error: unknown) {
    throw new Error(unwrapError(error, "Failed to load authority"));
  }
}

export async function adminUpdateAuthority(id: string, payload: UpdateAuthorityRequest): Promise<ApiResponse> {
  try {
    const response = await apiClient.patch(`${API_ENDPOINTS.admin.authorities}/${id}`, payload);
    return response.data as ApiResponse;
  } catch (error: unknown) {
    throw new Error(unwrapError(error, "Failed to update authority"));
  }
}

export async function adminDeleteAuthority(id: string): Promise<ApiResponse> {
  try {
    const response = await apiClient.delete(`${API_ENDPOINTS.admin.authorities}/${id}`);
    return response.data as ApiResponse;
  } catch (error: unknown) {
    throw new Error(unwrapError(error, "Failed to delete authority"));
  }
}

export async function adminGetCitizen(id: string): Promise<CitizenDetail> {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.admin.citizens}/${id}`);
    const data = response.data as { success?: boolean; data?: CitizenDetail };
    if (!data?.data) throw new Error("Invalid response");
    return data.data;
  } catch (error: unknown) {
    throw new Error(unwrapError(error, "Failed to load citizen"));
  }
}

export async function adminUpdateCitizen(id: string, payload: UpdateCitizenRequest): Promise<ApiResponse> {
  try {
    const response = await apiClient.patch(`${API_ENDPOINTS.admin.citizens}/${id}`, payload);
    return response.data as ApiResponse;
  } catch (error: unknown) {
    throw new Error(unwrapError(error, "Failed to update citizen"));
  }
}

export async function adminDeleteCitizen(id: string): Promise<ApiResponse> {
  try {
    const response = await apiClient.delete(`${API_ENDPOINTS.admin.citizens}/${id}`);
    return response.data as ApiResponse;
  } catch (error: unknown) {
    throw new Error(unwrapError(error, "Failed to delete citizen"));
  }
}
