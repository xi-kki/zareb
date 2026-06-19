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

  const borderColor = isCritical ? "border-l-danger" : isModerate ? "border-l-warning" : "border-l-brand";
  const bgColor = isCritical ? "bg-danger-50/30" : isModerate ? "bg-warning-50/30" : "bg-brand-50/30";
  const icon = isCritical ? AlertTriangle : isModerate ? Info : CheckCircle;
  const Icon = icon;

  return (
    <div className={`border border-stone-100 border-l-4 ${borderColor} rounded-xl overflow-hidden transition-colors`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-stone-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${isCritical ? "text-danger" : isModerate ? "text-warning" : "text-brand"}`} />
          <div>
            <span className={`text-xs font-semibold uppercase ${isCritical ? "text-danger" : isModerate ? "text-warning" : "text-brand"}`}>
              {gap.severity}
            </span>
            <p className="text-sm font-medium text-stone-900">{gap.issue}</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 space-y-3">
          <div className="pl-8">
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">Section Affected</p>
            <p className="text-sm text-stone-800 mt-0.5">{gap.section}</p>
          </div>
          <div className="pl-8">
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">Exact Problem</p>
            <p className="text-sm text-stone-800 mt-0.5">{gap.issue}</p>
          </div>
          <div className="pl-8">
            <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">Specific Fix</p>
            <p className="text-sm text-stone-800 mt-0.5">{gap.fix}</p>
          </div>
          <div className="pl-8">
            <button
              onClick={() => onCopy(gap.fix)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-700 transition-colors"
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
