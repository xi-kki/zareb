import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { documents, reports } from "../api/client";
import { FileText, BarChart3, AlertTriangle, Upload, MessageSquare } from "lucide-react";
import ScoreGauge from "../components/ScoreGauge";
import ReportTable from "../components/ReportTable";

export default function Dashboard() {
  const { data: docs = [] } = useQuery({ queryKey: ["documents"], queryFn: documents.list });
  const { data: reps = [] } = useQuery({ queryKey: ["reports"], queryFn: reports.list });

  // Stats
  const docCount = Array.isArray(docs) ? docs.length : 0;
  const reportCount = Array.isArray(reps) ? reps.length : 0;
  const criticalCount = Array.isArray(reps)
    ? reps.reduce((sum: number, r: any) => sum + (r.critical_issues?.length || 0), 0)
    : 0;

  // Average score
  const avgScore = Array.isArray(reps) && reps.length > 0
    ? Math.round(reps.reduce((sum: number, r: any) => sum + (r.overall_score || 0), 0) / reps.length)
    : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111827] mb-6">Dashboard</h1>

      {/* Score Ring + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1">
          <ScoreGauge score={avgScore} />
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#111827]">{docCount}</p>
              <p className="text-sm text-[#6B7280]">Documents Uploaded</p>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="w-12 h-12 bg-info-50 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#111827]">{reportCount}</p>
              <p className="text-sm text-[#6B7280]">Reports Generated</p>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${criticalCount > 0 ? "bg-danger-50" : "bg-gray-50"}`}>
              <AlertTriangle className={`w-6 h-6 ${criticalCount > 0 ? "text-danger" : "text-[#6B7280]"}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${criticalCount > 0 ? "text-danger" : "text-[#111827]"}`}>{criticalCount}</p>
              <p className="text-sm text-[#6B7280]">Critical Issues</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 mb-8">
        <Link to="/dashboard/upload" className="btn-primary inline-flex items-center gap-2 text-sm">
          <Upload className="w-4 h-4" /> Upload Document
        </Link>
        <Link to="/dashboard/chat" className="btn-secondary inline-flex items-center gap-2 text-sm">
          <MessageSquare className="w-4 h-4" /> Ask Kamara
        </Link>
      </div>

      {/* Recent Reports */}
      <div className="card">
        <h2 className="text-lg font-semibold text-[#111827] mb-4">Recent Reports</h2>
        {Array.isArray(reps) && reps.length > 0 ? (
          <ReportTable reports={reps} />
        ) : (
          <div className="text-center py-12 text-[#6B7280]">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No reports yet</p>
            <p className="text-sm mt-1">Upload a document to get your first compliance analysis</p>
            <Link to="/dashboard/upload" className="btn-primary inline-flex items-center gap-2 mt-4 text-sm">
              <Upload className="w-4 h-4" /> Upload Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
