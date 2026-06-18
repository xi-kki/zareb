import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { reports } from "../api/client";
import { useState } from "react";
import { ArrowLeft, Download, RefreshCw, MessageSquare, AlertTriangle, Info, CheckCircle, Copy, Check } from "lucide-react";
import ScoreGauge from "../components/ScoreGauge";
import GapCard from "../components/GapCard";

export default function ReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"critical" | "moderate" | "minor">("critical");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: report, isLoading } = useQuery({
    queryKey: ["report", id],
    queryFn: () => reports.get(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-20">
        <p className="text-[#6B7280]">Report not found</p>
        <button onClick={() => navigate("/dashboard")} className="btn-primary mt-4">Back to Dashboard</button>
      </div>
    );
  }

  const gaps = report.gaps_found || [];
  const critical = gaps.filter((g: any) => g.severity === "CRITICAL");
  const moderate = gaps.filter((g: any) => g.severity === "MODERATE");
  const minor = gaps.filter((g: any) => g.severity === "MINOR");
  const recommendations = report.recommendations || [];
  const criticalIssues = report.critical_issues || [];

  const tabCounts = {
    critical: critical.length,
    moderate: moderate.length,
    minor: minor.length,
  };

  const getReadinessColor = (status: string) => {
    switch (status) {
      case "AUDIT READY": return "bg-[#16A34A] text-white";
      case "MOSTLY READY": return "bg-[#D97706] text-white";
      case "NEEDS WORK": return "bg-[#D97706] text-white";
      default: return "bg-[#DC2626] text-white";
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div>
      {/* Back button */}
      <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-[#6B7280] hover:text-[#111827] mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Top Section */}
      <div className="card mb-6">
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Score */}
          <div className="w-40">
            <ScoreGauge score={report.overall_score} size="sm" />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#111827] mb-1">
              {report.document?.filename || "Compliance Report"}
            </h1>
            <div className="flex flex-wrap gap-2 text-sm text-[#6B7280] mb-3">
              <span className="bg-gray-100 px-2 py-1 rounded">Type: {report.document?.doc_type || "N/A"}</span>
              <span className="bg-gray-100 px-2 py-1 rounded">Standard: {report.standard}</span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getReadinessColor(report.audit_readiness)}`}>
                {report.audit_readiness?.replace("_", " ") || "NOT READY"}
              </span>
            </div>

            <p className="text-[#6B7280] text-sm">{report.document_summary}</p>

            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => navigate(`/dashboard/chat/${report.id}`)}
                className="btn-secondary inline-flex items-center gap-2 text-sm py-2 px-4"
              >
                <MessageSquare className="w-4 h-4" /> Ask Nuri about this report
              </button>
              <button className="btn-secondary inline-flex items-center gap-2 text-sm py-2 px-4">
                <Download className="w-4 h-4" /> Download PDF
              </button>
              <button
                onClick={() => navigate("/dashboard/upload")}
                className="btn-secondary inline-flex items-center gap-2 text-sm py-2 px-4"
              >
                <RefreshCw className="w-4 h-4" /> Re-analyze
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-6">
        <div className="flex border-b border-gray-100 mb-4">
          {(["critical", "moderate", "minor"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-[#6B7280] hover:text-[#111827]"
              }`}
            >
              {tab === "critical" && <AlertTriangle className="w-4 h-4" />}
              {tab === "moderate" && <Info className="w-4 h-4" />}
              {tab === "minor" && <CheckCircle className="w-4 h-4" />}
              <span className="capitalize">{tab === "critical" ? "Critical" : tab === "moderate" ? "Moderate" : "Minor"}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                tab === "critical" ? "bg-danger-50 text-danger" :
                tab === "moderate" ? "bg-warning-50 text-warning" :
                "bg-info-50 text-info"
              }`}>
                {tabCounts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Gap Cards */}
        <div className="space-y-3">
          {(activeTab === "critical" ? critical : activeTab === "moderate" ? moderate : minor).map((gap: any, i: number) => (
            <GapCard key={i} gap={gap} onCopy={(text) => handleCopy(text, `gap-${i}`)} copiedId={copiedId} />
          ))}
          {(activeTab === "critical" ? critical : activeTab === "moderate" ? moderate : minor).length === 0 && (
            <p className="text-center text-[#6B7280] py-8">No {activeTab} issues found</p>
          )}
        </div>
      </div>

      {/* Critical Issues Summary */}
      {criticalIssues.length > 0 && (
        <div className="card mb-6 border-l-4 border-l-danger">
          <h3 className="font-semibold text-[#111827] mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-danger" /> Critical Issues Summary
          </h3>
          <ul className="space-y-2">
            {criticalIssues.map((issue: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#6B7280]">
                <span className="text-danger mt-1">•</span>
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="card mb-6">
          <h3 className="font-semibold text-[#111827] mb-4">Recommendations</h3>
          <div className="space-y-4">
            {recommendations.map((rec: any, i: number) => (
              <div key={i} className="border border-gray-100 rounded-lg p-4">
                <h4 className="font-medium text-[#111827] mb-2">{rec.title}</h4>
                <p className="text-sm text-[#6B7280] mb-3">{rec.detail}</p>
                {rec.example_language && (
                  <div className="bg-gray-50 rounded-lg p-3 relative group">
                    <pre className="text-sm text-[#111827] whitespace-pre-wrap font-sans">{rec.example_language}</pre>
                    <button
                      onClick={() => handleCopy(rec.example_language, `rec-${i}`)}
                      className="absolute top-2 right-2 p-1.5 bg-white rounded border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy"
                    >
                      {copiedId === `rec-${i}` ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-[#6B7280]" />}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Notes */}
      {report.export_specific_notes && (
        <div className="card mb-6 border-l-4 border-l-warning bg-warning-50/50">
          <h3 className="font-semibold text-[#111827] mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" /> Africa → EU/UK Export Notes
          </h3>
          <p className="text-sm text-[#6B7280] whitespace-pre-wrap">{report.export_specific_notes}</p>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex flex-wrap gap-3">
        <button className="btn-primary inline-flex items-center gap-2 text-sm">
          <Download className="w-4 h-4" /> Download Report as PDF
        </button>
        <button
          onClick={() => navigate("/dashboard/upload")}
          className="btn-secondary inline-flex items-center gap-2 text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Re-analyze with different standard
        </button>
        <button
          onClick={() => navigate(`/dashboard/chat/${report.id}`)}
          className="btn-secondary inline-flex items-center gap-2 text-sm"
        >
          <MessageSquare className="w-4 h-4" /> Ask Nuri a question
        </button>
      </div>
    </div>
  );
}
