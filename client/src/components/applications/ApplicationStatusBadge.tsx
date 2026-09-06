import { ApplicationStatus } from "@/lib/types";

const STYLES: Record<ApplicationStatus, string> = {
  draft: "bg-surface-container text-outline ring-outline/20",
  submitted: "bg-secondary-container/20 text-secondary ring-secondary/20",
  under_review: "bg-secondary-container/20 text-secondary ring-secondary/20",
  documents_requested: "bg-error-container text-on-error-container ring-error/20",
  accepted: "bg-green-100 text-green-700 ring-green-700/20",
  rejected: "bg-error-container text-on-error-container ring-error/20",
  withdrawn: "bg-surface-container text-outline ring-outline/20",
};

const LABELS: Record<ApplicationStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under review",
  documents_requested: "Action required",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

const NEXT_STEP: Record<ApplicationStatus, string> = {
  draft: "Complete and submit your application",
  submitted: "Awaiting initial review",
  under_review: "Wait for a decision from the university",
  documents_requested: "Upload the requested documents",
  accepted: "Accept your offer of admission",
  rejected: "This application has closed",
  withdrawn: "This application was withdrawn",
};

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full font-label-md text-label-md font-semibold ring-1 ring-inset ${STYLES[status]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-2"></span>
      {LABELS[status]}
    </span>
  );
}

export function applicationNextStep(status: ApplicationStatus) {
  return NEXT_STEP[status];
}
