import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { documents, reports } from "../api/client";
import { FileText, BarChart3, AlertTriangle, Upload, MessageSquare, Sparkles } from "lucide-react";
import ScoreGauge from "../components/ScoreGauge";
import ReportTable from "../components/ReportTable";

export default function Dashboard() {
  const { data: docs = [] } = useQuery({ queryKey: ["documents"], queryFn: documents.list });
  const { data: reps = [] } = useQuery({ queryKey: ["reports"], queryFn: reports.list });

  const docCount = Array.isArray(docs) ? docs.length : 0;
  const reportCount = Array.isArray(reps) ? reps.length : 0;
  const criticalCount = Array.isArray(reps)
    ? reps.reduce((sum: number, r: any) => sum + (r.critical_issues?.length || 0), 0)
    : 0;

  const avgScore = Array.isArray(reps) && reps.length > 0
    ? Math.round(reps.reduce((sum: number, r: any) => sum + (r.overall_score || 0), 0) / reps.length)
    : 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-stone-900 mb-2">Dashboard</h1>
        <p className="text-stone-500">Your compliance overview at a glance.</p>
      </div>

      {/* Score Ring + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1">
          <div className="card flex flex-col items-center py-6">
            <ScoreGauge score={avgScore} />
            <p className="text-sm text-stone-500 mt-3">Average compliance score</p>
          </div>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-warm flex items-center gap-4 hover:shadow-card transition-shadow duration-200">
            <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-brand" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-stone-900">{docCount}</p>
              <p className="text-sm text-stone-500">Documents Uploaded</p>
            </div>
          </div>
          <div className="card-warm flex items-center gap-4 hover:shadow-card transition-shadow duration-200">
            <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-brand" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-stone-900">{reportCount}</p>
              <p className="text-sm text-stone-500">Reports Generated</p>
            </div>
          </div>
          <div className="card-warm flex items-center gap-4 hover:shadow-card transition-shadow duration-200">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${criticalCount > 0 ? "bg-danger-50" : "bg-stone-50"}`}>
              <AlertTriangle className={`w-6 h-6 ${criticalCount > 0 ? "text-danger" : "text-stone-400"}`} />
            </div>
            <div>
              <p className={`font-display text-2xl font-bold ${criticalCount > 0 ? "text-danger" : "text-stone-900"}`}>{criticalCount}</p>
              <p className="text-sm text-stone-500">Critical Issues</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link to="/dashboard/upload" className="btn-primary inline-flex items-center gap-2 text-sm">
          <Upload className="w-4 h-4" /> Upload Document
        </Link>
        <Link to="/dashboard/chat" className="btn-secondary inline-flex items-center gap-2 text-sm">
          <MessageSquare className="w-4 h-4" /> Ask Zareb
        </Link>
      </div>

      {/* Recent Reports */}
      <div className="card">
        <h2 className="font-display text-lg font-semibold text-stone-900 mb-4">Recent Reports</h2>
        {Array.isArray(reps) && reps.length > 0 ? (
          <ReportTable reports={reps} />
        ) : (
          <div className="text-center py-12 text-stone-500">
            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-stone-300" />
            </div>
            <p className="font-medium text-stone-700">No reports yet</p>
            <p className="text-sm mt-1">Upload a document to get your first compliance analysis</p>
            <Link to="/dashboard/upload" className="btn-primary inline-flex items-center gap-2 mt-6 text-sm">
              <Upload className="w-4 h-4" /> Upload Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
