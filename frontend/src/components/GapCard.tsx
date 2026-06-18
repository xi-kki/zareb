import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check, AlertTriangle, Info, CheckCircle } from "lucide-react";

interface Gap {
  severity: "CRITICAL" | "MODERATE" | "MINOR";
  section: string;
  issue: string;
  fix: string;
}

interface GapCardProps {
  gap: Gap;
  onCopy: (text: string) => void;
  copiedId: string | null;
}

export default function GapCard({ gap, onCopy, copiedId }: GapCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isCritical = gap.severity === "CRITICAL";
  const isModerate = gap.severity === "MODERATE";

  const borderColor = isCritical ? "border-l-danger" : isModerate ? "border-l-warning" : "border-l-info";
  const bgColor = isCritical ? "bg-danger-50/50" : isModerate ? "bg-warning-50/50" : "bg-info-50/50";
  const icon = isCritical ? AlertTriangle : isModerate ? Info : CheckCircle;
  const Icon = icon;

  return (
    <div className={`border border-gray-100 border-l-4 ${borderColor} rounded-lg overflow-hidden transition-colors`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${isCritical ? "text-danger" : isModerate ? "text-warning" : "text-info"}`} />
          <div>
            <span className={`text-xs font-semibold uppercase ${isCritical ? "text-danger" : isModerate ? "text-warning" : "text-info"}`}>
              {gap.severity}
            </span>
            <p className="text-sm font-medium text-[#111827]">{gap.issue}</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-[#6B7280]" /> : <ChevronDown className="w-4 h-4 text-[#6B7280]" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 space-y-3">
          <div className="pl-8">
            <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wide">Section Affected</p>
            <p className="text-sm text-[#111827]">{gap.section}</p>
          </div>
          <div className="pl-8">
            <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wide">Exact Problem</p>
            <p className="text-sm text-[#111827]">{gap.issue}</p>
          </div>
          <div className="pl-8">
            <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wide">Specific Fix</p>
            <p className="text-sm text-[#111827]">{gap.fix}</p>
          </div>
          <div className="pl-8">
            <button
              onClick={() => onCopy(gap.fix)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-700 transition-colors"
            >
              {copiedId ? (
                <><Check className="w-3.5 h-3.5" /> Copied!</>
              ) : (
                <><Copy className="w-3.5 h-3.5" /> Copy fix language</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
