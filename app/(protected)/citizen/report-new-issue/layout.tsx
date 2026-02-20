import React from "react";
import { ReportIssueProvider } from "@/features/citizen/components/ReportIssueProvider";

export default function ReportNewIssueLayout({ children }: { children: React.ReactNode }) {
  return <ReportIssueProvider>{children}</ReportIssueProvider>;
}
