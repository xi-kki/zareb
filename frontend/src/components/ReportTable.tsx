import { Link } from "react-router-dom";

interface Report {
  id: string;
  document_id: string;
  standard: string;
  overall_score: number;
  audit_readiness: string;
  created_at: string;
  document?: { filename?: string };
}

interface ReportTableProps {
  reports: Report[];
}

function getScoreBadge(score: number): string {
  if (score >= 80) return "badge bg-success-50 text-success border border-success/20";
  if (score >= 50) return "badge bg-warning-50 text-warning border border-warning/20";
  return "badge bg-danger-50 text-danger border border-danger/20";
}

function getReadinessBadge(status: string): string {
  switch (status) {
    case "AUDIT READY": return "badge bg-success-50 text-success border border-success/20";
    case "MOSTLY READY": return "badge bg-warning-50 text-warning border border-warning/20";
    case "NEEDS WORK": return "badge bg-warning-50 text-warning border border-warning/20";
    default: return "badge bg-danger-50 text-danger border border-danger/20";
  }
}

export default function ReportTable({ reports }: ReportTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-100">
            <th className="text-left py-3 px-3 text-stone-400 font-medium text-xs uppercase tracking-wider">Document</th>
            <th className="text-left py-3 px-3 text-stone-400 font-medium text-xs uppercase tracking-wider">Standard</th>
            <th className="text-center py-3 px-3 text-stone-400 font-medium text-xs uppercase tracking-wider">Score</th>
            <th className="text-center py-3 px-3 text-stone-400 font-medium text-xs uppercase tracking-wider">Status</th>
            <th className="text-left py-3 px-3 text-stone-400 font-medium text-xs uppercase tracking-wider">Date</th>
            <th className="text-right py-3 px-3 text-stone-400 font-medium text-xs uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody>
          {reports.slice(0, 10).map((report) => (
            <tr key={report.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
              <td className="py-3.5 px-3 font-medium text-stone-900 max-w-[200px] truncate">
                {report.document?.filename || report.document_id?.slice(0, 8) + "..." || "Unknown"}
              </td>
              <td className="py-3.5 px-3 text-stone-500">{report.standard}</td>
              <td className="py-3.5 px-3 text-center">
                <span className={`${getScoreBadge(report.overall_score)}`}>
                  {report.overall_score}
                </span>
              </td>
              <td className="py-3.5 px-3 text-center">
                <span className={`${getReadinessBadge(report.audit_readiness)}`}>
                  {report.audit_readiness?.replace("_", " ") || "N/A"}
                </span>
              </td>
              <td className="py-3.5 px-3 text-stone-400 text-xs">
                {report.created_at ? new Date(report.created_at).toLocaleDateString() : "-"}
              </td>
              <td className="py-3.5 px-3 text-right">
                <Link
                  to={`/dashboard/reports/${report.id}`}
                  className="text-brand font-medium text-xs hover:text-brand-700 transition-colors"
                >
                  View Report →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
