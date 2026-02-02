import { apiClient } from "./axios";
import { API_ENDPOINTS } from "./endpoints";

type Role = "admin" | "authority" | "citizen";

type MeUser = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  wardNumber?: string;
  municipality?: string;
  profilePhoto?: string;
  role: Role;
};

type GetMeResponse = {
  user: MeUser;
};

function unwrapError(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message || err.message || fallback;
}

export async function usersGetMe(): Promise<GetMeResponse> {
  try {
    const resp = await apiClient.get(API_ENDPOINTS.users.me);
    return resp.data as GetMeResponse;
  } catch (error: unknown) {
    throw new Error(unwrapError(error, "Failed to load profile"));
  }
}

export async function usersUpdateMyPhoto(file: File): Promise<GetMeResponse> {
  try {
    const formData = new FormData();
    formData.append("photo", file);

    const resp = await apiClient.put(API_ENDPOINTS.users.mePhoto, formData, {
      headers: {
        // Let the browser set the multipart boundary
        "Content-Type": "multipart/form-data",
      },
    });

    return resp.data as GetMeResponse;
  } catch (error: unknown) {
    throw new Error(unwrapError(error, "Failed to upload photo"));
  }
}
