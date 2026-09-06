export type Role = "student" | "agency" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  phone?: string | null;
  avatarUrl?: string | null;
}

export interface University {
  id: string;
  name: string;
  country: string;
  region: string | null;
  city: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  description: string | null;
  admissionRequirements?: string | null;
  applicationStartDate?: string | null;
  applicationDeadline?: string | null;
  galleryImageUrls?: string[];
  ranking: number | null;
  websiteUrl: string | null;
  isFeatured: boolean;
}

export interface Program {
  id: string;
  universityId: string;
  name: string;
  degreeLevel: string;
  field: string | null;
  durationMonths: number | null;
  tuitionFeeUsd: string | null;
  intakeMonths: string[];
  description: string | null;
}

export interface Scholarship {
  id: string;
  universityId: string | null;
  title: string;
  provider: string | null;
  category: string | null;
  amountUsd: string | null;
  coveragePercent: number | null;
  deadline: string | null;
  eligibility: string | null;
  description: string | null;
  applyUrl: string | null;
}

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "documents_requested"
  | "accepted"
  | "rejected"
  | "withdrawn";

export interface Application {
  id: string;
  status: ApplicationStatus;
  intake: string | null;
  notes: string | null;
  submittedAt: string | null;
  decidedAt: string | null;
  createdAt: string;
  program: { id: string; name: string; degreeLevel: string };
  university: { id: string; name: string; country: string; logoUrl: string | null };
}

export type DocumentStatus = "pending" | "approved" | "rejected";

export interface StudentDocument {
  id: string;
  type: string;
  fileName: string;
  filePath: string;
  status: DocumentStatus;
  reviewNote: string | null;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}
