import { apiClient } from "./axios";
import { API_ENDPOINTS } from "./endpoints";
import type { IssueDraft } from "@/features/citizen/components/ReportIssueProvider";

export type IssueLocation = {
  latitude?: number;
  longitude?: number;
  address: string;
  district?: string;
  municipality?: string;
  ward?: string;
  landmark?: string;
};

export type IssueListItem = {
  id: string;
  category: string;
  title: string;
  description: string;
  urgency: string;
  status: string;
  location: IssueLocation;
  photos: string[];
  createdAt: string;
  reporterId?: string;
  reporterName?: string;
  statusUpdatedByRole?: "admin" | "authority";
  statusUpdatedByUserId?: string;
  statusUpdatedAt?: string;
};

export type UpdateIssueStatusResult = {
  id: string;
  status: string;
  updatedAt: string;
  statusUpdatedByRole?: "admin" | "authority";
  statusUpdatedByUserId?: string;
  statusUpdatedAt?: string;
};

export type ReverseGeocodeResult = {
  address: string;
  district?: string;
  municipality?: string;
  ward?: string;
  landmark?: string;
  latitude: number;
  longitude: number;
};

function unwrapError(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err.response?.data?.message || err.message || fallback;
}

export async function createIssueReport(draft: IssueDraft) {
  try {
    const formData = new FormData();
    if (!draft.category) {
      throw new Error("Category is required");
    }
    if (!draft.urgency) {
      throw new Error("Urgency is required");
    }

    formData.append("category", draft.category);
    formData.append("title", draft.details.title);
    formData.append("description", draft.details.description);
    formData.append("urgency", draft.urgency);

    const toNumber = (value?: string) => {
      if (!value) return undefined;
      const num = Number(value);
      return Number.isFinite(num) ? num : undefined;
    };

    const location = {
      latitude: toNumber(draft.location.latitude),
      longitude: toNumber(draft.location.longitude),
      address: draft.location.address,
      district: draft.location.district,
      municipality: draft.location.municipality,
      ward: draft.location.ward,
      landmark: draft.location.landmark || undefined,
    };

    formData.append("location", JSON.stringify(location));

    draft.photos.forEach((file) => {
      formData.append("photos", file);
    });

    const resp = await apiClient.post(API_ENDPOINTS.issues.create, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return resp.data as { success?: boolean; message?: string; data?: unknown };
  } catch (error: unknown) {
    throw new Error(unwrapError(error, "Failed to submit issue"));
  }
}

export async function listIssueReports() {
  try {
    const resp = await apiClient.get(API_ENDPOINTS.issues.list);
    return (resp.data?.data ?? []) as IssueListItem[];
  } catch (error: unknown) {
    throw new Error(unwrapError(error, "Failed to load reports"));
  }
}

export async function listAuthorityIssues() {
  try {
    const resp = await apiClient.get(API_ENDPOINTS.issues.list);
    return (resp.data?.data ?? []) as IssueListItem[];
  } catch (error: unknown) {
    throw new Error(unwrapError(error, "Failed to load issues"));
  }
}

export async function listPriorityIssues() {
  try {
    const resp = await apiClient.get(API_ENDPOINTS.issues.priority);
    return (resp.data?.data ?? []) as IssueListItem[];
  } catch (error: unknown) {
    throw new Error(unwrapError(error, "Failed to load priority issues"));
  }
}

export async function updateIssueStatus(id: string, status: string) {
  try {
    const resp = await apiClient.patch(API_ENDPOINTS.issues.updateStatus(id), { status });
    return resp.data as { success?: boolean; message?: string; data?: UpdateIssueStatusResult };
  } catch (error: unknown) {
    throw new Error(unwrapError(error, "Failed to update status"));
  }
}

export async function getIssueReport(id: string) {
  try {
    const resp = await apiClient.get(API_ENDPOINTS.issues.get(id));
    return resp.data?.data as IssueListItem;
  } catch (error: unknown) {
    throw new Error(unwrapError(error, "Failed to load report"));
  }
}

export async function deleteIssueReport(id: string) {
  try {
    const resp = await apiClient.delete(API_ENDPOINTS.issues.delete(id));
    return resp.data as { success?: boolean; message?: string; data?: { id: string } };
  } catch (error: unknown) {
    throw new Error(unwrapError(error, "Failed to delete issue"));
  }
}

export async function reverseGeocodeLocation(latitude: number, longitude: number) {
  try {
    const resp = await apiClient.get(API_ENDPOINTS.issues.reverseGeocode, {
      params: { lat: latitude, lng: longitude },
    });
    return resp.data?.data as ReverseGeocodeResult;
  } catch (error: unknown) {
    throw new Error(unwrapError(error, "Failed to auto-fill location"));
  }
}
