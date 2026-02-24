"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type IssueCategory =
  | "roads_potholes"
  | "electricity"
  | "water_supply"
  | "waste_management"
  | "street_lights"
  | "public_infrastructure"
  | "others";

export type IssueUrgency = "low" | "medium" | "high" | "urgent";

export type IssueLocationDraft = {
  latitude?: string;
  longitude?: string;
  address: string;
  district: string;
  municipality: string;
  ward: string;
  landmark?: string;
};

export type IssueDetailsDraft = {
  title: string;
  description: string;
};

export type IssueDraft = {
  category?: IssueCategory;
  photos: File[];
  location: IssueLocationDraft;
  details: IssueDetailsDraft;
  urgency?: IssueUrgency;
};

type ReportIssueContextValue = {
  draft: IssueDraft;
  setCategory: (category: IssueCategory) => void;
  setPhotos: (photos: File[]) => void;
  updateLocation: (patch: Partial<IssueLocationDraft>) => void;
  updateDetails: (patch: Partial<IssueDetailsDraft>) => void;
  setUrgency: (urgency: IssueUrgency) => void;
  resetDraft: () => void;
};

const DEFAULT_DRAFT: IssueDraft = {
  category: undefined,
  photos: [],
  location: {
    latitude: "",
    longitude: "",
    address: "",
    district: "",
    municipality: "",
    ward: "",
    landmark: "",
  },
  details: {
    title: "",
    description: "",
  },
  urgency: undefined,
};

const ReportIssueContext = createContext<ReportIssueContextValue | null>(null);

export function ReportIssueProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<IssueDraft>(DEFAULT_DRAFT);

  const setCategory = useCallback((category: IssueCategory) => {
    setDraft((prev) => ({ ...prev, category }));
  }, []);

  const setPhotos = useCallback((photos: File[]) => {
    setDraft((prev) => ({ ...prev, photos }));
  }, []);

  const updateLocation = useCallback((patch: Partial<IssueLocationDraft>) => {
    setDraft((prev) => ({
      ...prev,
      location: { ...prev.location, ...patch },
    }));
  }, []);

  const updateDetails = useCallback((patch: Partial<IssueDetailsDraft>) => {
    setDraft((prev) => ({
      ...prev,
      details: { ...prev.details, ...patch },
    }));
  }, []);

  const setUrgency = useCallback((urgency: IssueUrgency) => {
    setDraft((prev) => ({ ...prev, urgency }));
  }, []);

  const resetDraft = useCallback(() => {
    setDraft(DEFAULT_DRAFT);
  }, []);

  const value = useMemo(
    () => ({
      draft,
      setCategory,
      setPhotos,
      updateLocation,
      updateDetails,
      setUrgency,
      resetDraft,
    }),
    [draft, resetDraft, setCategory, setPhotos, setUrgency, updateDetails, updateLocation]
  );

  return <ReportIssueContext.Provider value={value}>{children}</ReportIssueContext.Provider>;
}

export function useReportIssue() {
  const ctx = useContext(ReportIssueContext);
  if (!ctx) {
    throw new Error("useReportIssue must be used within ReportIssueProvider");
  }
  return ctx;
}
