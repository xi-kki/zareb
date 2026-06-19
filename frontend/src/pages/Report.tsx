import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { reports } from "../api/client";
import { useState } from "react";
import { ArrowLeft, Download, RefreshCw, MessageSquare, AlertTriangle, Info, CheckCircle, Copy, Check, Loader2, Sparkles } from "lucide-react";
import ScoreGauge from "../components/ScoreGauge";
import GapCard from "../components/GapCard";

export default function ReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"critical" | "moderate" | "minor">("critical");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const { data: report, isLoading } = useQuery({
    queryKey: ["report", id],
    queryFn: () => reports.get(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-brand border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-20">
        <p className="text-stone-500">Report not found</p>
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
      case "AUDIT READY": return "bg-success text-white";
      case "MOSTLY READY": return "bg-warning text-white";
      case "NEEDS WORK": return "bg-warning text-white";
      default: return "bg-danger text-white";
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
      <button onClick={() => navigate("/dashboard")} className="btn-ghost mb-4">
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
            <h1 className="font-display text-xl font-bold text-stone-900 mb-1">
              {report.document?.filename || "Compliance Report"}
            </h1>
            <div className="flex flex-wrap gap-2 text-sm text-stone-500 mb-3">
              <span className="bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200">Type: {report.document?.doc_type || "N/A"}</span>
              <span className="bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200">Standard: {report.standard}</span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className={`inline-block px-3 py-1 rounded-pill text-sm font-semibold ${getReadinessColor(report.audit_readiness)}`}>
                {report.audit_readiness?.replace("_", " ") || "NOT READY"}
              </span>
            </div>

            <p className="text-stone-500 text-sm leading-relaxed">{report.document_summary}</p>

            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => navigate(`/dashboard/chat/${report.id}`)}
                className="btn-secondary inline-flex items-center gap-2 text-sm !py-2 !px-5"
              >
                <MessageSquare className="w-4 h-4" /> Ask Zareb about this report
              </button>
              <button
                onClick={async () => {
                  setDownloading(true);
                  try {
                    const { reports } = await import("../api/client");
                    await reports.downloadPdf(report.id);
                  } catch (e) {
                    console.error("PDF download failed", e);
                  }
                  setDownloading(false);
                }}
                disabled={downloading}
                className="btn-ghost border border-stone-200 rounded-lg disabled:opacity-50"
              >
                {downloading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating PDF...</>
                ) : (
                  <><Download className="w-4 h-4" /> Download PDF</>
                )}
              </button>
              <button
                onClick={() => navigate("/dashboard/upload")}
                className="btn-ghost border border-stone-200 rounded-lg"
              >
                <RefreshCw className="w-4 h-4" /> Re-analyze
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-6">
        <div className="flex border-b border-stone-100 mb-4">
          {(["critical", "moderate", "minor"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-all duration-150 flex items-center gap-2 ${
                activeTab === tab
                  ? "border-brand text-brand"
                  : "border-transparent text-stone-400 hover:text-stone-700"
              }`}
            >
              {tab === "critical" && <AlertTriangle className="w-4 h-4" />}
              {tab === "moderate" && <Info className="w-4 h-4" />}
              {tab === "minor" && <CheckCircle className="w-4 h-4" />}
              <span className="capitalize">{tab === "critical" ? "Critical" : tab === "moderate" ? "Moderate" : "Minor"}</span>
              <span className={`text-xs px-2 py-0.5 rounded-pill font-medium ${
                tab === "critical" ? "bg-danger-50 text-danger" :
                tab === "moderate" ? "bg-warning-50 text-warning" :
                "bg-brand-50 text-brand"
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
            <p className="text-center text-stone-400 py-8 text-sm">No {activeTab} issues found</p>
          )}
        </div>
      </div>

      {/* Critical Issues Summary */}
      {criticalIssues.length > 0 && (
        <div className="card mb-6 border-l-4 border-l-danger bg-danger-50/30">
          <h3 className="font-display font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-danger" /> Critical Issues Summary
          </h3>
          <ul className="space-y-2">
            {criticalIssues.map((issue: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
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
          <h3 className="font-display font-semibold text-stone-900 mb-4">Recommendations</h3>
          <div className="space-y-4">
            {recommendations.map((rec: any, i: number) => (
              <div key={i} className="border border-stone-100 rounded-xl p-5 hover:border-stone-200 transition-colors">
                <h4 className="font-medium text-stone-900 mb-2">{rec.title}</h4>
                <p className="text-sm text-stone-500 mb-3 leading-relaxed">{rec.detail}</p>
                {rec.example_language && (
                  <div className="bg-stone-50 rounded-xl p-4 relative group border border-stone-100">
                    <pre className="text-sm text-stone-700 whitespace-pre-wrap font-sans">{rec.example_language}</pre>
                    <button
                      onClick={() => handleCopy(rec.example_language, `rec-${i}`)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-lg border border-stone-200 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:shadow-md"
                      title="Copy"
                    >
                      {copiedId === `rec-${i}` ? <Check className="w-4 h-4 text-brand" /> : <Copy className="w-4 h-4 text-stone-400" />}
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
        <div className="card mb-6 border-l-4 border-l-warning bg-warning-50/40">
          <h3 className="font-display font-semibold text-stone-900 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" /> Africa → EU/UK Export Notes
          </h3>
          <p className="text-sm text-stone-600 whitespace-pre-wrap leading-relaxed">{report.export_specific_notes}</p>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={async () => {
            setDownloading(true);
            try {
              const { reports } = await import("../api/client");
              await reports.downloadPdf(report.id);
            } catch (e) {
              console.error("PDF download failed", e);
            }
            setDownloading(false);
          }}
          disabled={downloading}
          className="btn-primary inline-flex items-center gap-2 text-sm disabled:opacity-50"
        >
          {downloading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generating PDF...</>
          ) : (
            <><Download className="w-4 h-4" /> Download Report as PDF</>
          )}
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
          <MessageSquare className="w-4 h-4" /> Ask Zareb a question
        </button>
      </div>
    </div>
  );
}
