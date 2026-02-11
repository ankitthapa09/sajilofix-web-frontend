import { apiClient } from "./axios";
import { API_ENDPOINTS } from "./endpoints";

type Role = "admin" | "authority" | "citizen";

type MeUser = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  phoneCountryCode?: string;
  phoneNationalNumber?: string;
  wardNumber?: string;
  municipality?: string;
  district?: string;
  tole?: string;
  dob?: string;
  citizenshipNumber?: string;
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

export type UsersUpdateMeInput = {
  fullName?: string;
  phone?: string;
  phoneCountryCode?: string;
  phoneNationalNumber?: string;
  wardNumber?: string;
  ward?: string;
  municipality?: string;
  district?: string;
  tole?: string;
  dob?: string;
  citizenshipNumber?: string;
};

export async function usersUpdateMe(input: UsersUpdateMeInput): Promise<GetMeResponse> {
  try {
    const resp = await apiClient.patch(API_ENDPOINTS.users.meUpdate, input);
    return resp.data as GetMeResponse;
  } catch (error: unknown) {
    throw new Error(unwrapError(error, "Failed to update profile"));
  }
}
