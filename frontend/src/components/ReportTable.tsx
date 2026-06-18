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

function getScoreColor(score: number): string {
  if (score >= 80) return "text-[#16A34A] bg-[#F0FDF4]";
  if (score >= 50) return "text-[#D97706] bg-[#FFFBEB]";
  return "text-[#DC2626] bg-[#FEF2F2]";
}

function getReadinessColor(status: string): string {
  switch (status) {
    case "AUDIT READY": return "text-[#16A34A] bg-[#F0FDF4]";
    case "MOSTLY READY": return "text-[#D97706] bg-[#FFFBEB]";
    case "NEEDS WORK": return "text-[#D97706] bg-[#FFFBEB]";
    default: return "text-[#DC2626] bg-[#FEF2F2]";
  }
}

export default function ReportTable({ reports }: ReportTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 px-2 text-[#6B7280] font-medium">Document</th>
            <th className="text-left py-3 px-2 text-[#6B7280] font-medium">Standard</th>
            <th className="text-center py-3 px-2 text-[#6B7280] font-medium">Score</th>
            <th className="text-center py-3 px-2 text-[#6B7280] font-medium">Status</th>
            <th className="text-left py-3 px-2 text-[#6B7280] font-medium">Date</th>
            <th className="text-right py-3 px-2 text-[#6B7280] font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {reports.slice(0, 10).map((report) => (
            <tr key={report.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-2 font-medium text-[#111827] max-w-[200px] truncate">
                {report.document?.filename || report.document_id?.slice(0, 8) + "..." || "Unknown"}
              </td>
              <td className="py-3 px-2 text-[#6B7280]">{report.standard}</td>
              <td className="py-3 px-2 text-center">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getScoreColor(report.overall_score)}`}>
                  {report.overall_score}
                </span>
              </td>
              <td className="py-3 px-2 text-center">
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getReadinessColor(report.audit_readiness)}`}>
                  {report.audit_readiness?.replace("_", " ") || "N/A"}
                </span>
              </td>
              <td className="py-3 px-2 text-[#6B7280] text-xs">
                {report.created_at ? new Date(report.created_at).toLocaleDateString() : "-"}
              </td>
              <td className="py-3 px-2 text-right">
                <Link
                  to={`/dashboard/reports/${report.id}`}
                  className="text-primary font-medium text-xs hover:underline"
                >
                  View Report
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
