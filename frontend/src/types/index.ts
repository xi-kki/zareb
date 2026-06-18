export interface User {
  id: string;
  email: string;
  company_name: string;
  country: string;
  export_market: string;
  created_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  filename: string;
  doc_type: string;
  cloudinary_url: string;
  upload_date: string;
  status: "pending" | "analyzed" | "failed";
}

export interface Gap {
  severity: "CRITICAL" | "MODERATE" | "MINOR";
  section: string;
  issue: string;
  fix: string;
}

export interface Recommendation {
  title: string;
  detail: string;
  example_language: string;
}

export interface ComplianceReport {
  id: string;
  user_id: string;
  document_id: string;
  standard: string;
  overall_score: number;
  gaps_found: Gap[];
  recommendations: Recommendation[];
  critical_issues: string[];
  export_specific_notes: string;
  audit_readiness: "NOT READY" | "NEEDS WORK" | "MOSTLY READY" | "AUDIT READY";
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  principle?: number;
  section?: number;
}

export type Standard =
  | "HACCP"
  | "FSMA"
  | "SQF"
  | "BRCGS"
  | "ISO22000"
  | "NAFDAC"
  | "KEBS"
  | "FDA_EU";

export type DocType =
  | "haccp_plan"
  | "ingredient_list"
  | "product_label"
  | "sop"
  | "audit_report"
  | "supplier_cert"
  | "other";
