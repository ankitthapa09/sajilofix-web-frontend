import IssueDetailsPageBase from "@/features/shared/issues/IssueDetailsPageBase";

export default function AuthorityIssueDetailsPage() {
  return (
    <IssueDetailsPageBase
      backHref="/authority/issues"
      backLabel="Back to All Issues"
      canUpdateStatus
    />
  );
}
