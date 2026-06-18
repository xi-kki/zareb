import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { checklists } from "../api/client";
import { CheckSquare, Download, FileText, ChevronRight, Loader2 } from "lucide-react";

const STANDARDS = ["HACCP", "FSMA", "BRCGS", "SQF", "ISO22000", "NAFDAC", "KEBS", "FDA_EU"];

export default function ChecklistsPage() {
  const [standard, setStandard] = useState("HACCP");
  const [completed, setCompleted] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["checklist", standard],
    queryFn: () => checklists.get(standard),
  });

  const { data: savedData } = useQuery({
    queryKey: ["checklist-progress", standard],
    queryFn: () => checklists.getProgress(standard),
  });

  const saveMutation = useMutation({
    mutationFn: (items: string[]) => checklists.save(standard, items),
  });

  // Auto-save with debounce
  const saveProgress = useCallback(
    (() => {
      let timeout: ReturnType<typeof setTimeout>;
      return (items: string[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          saveMutation.mutate(items);
        }, 2000);
      };
    })(),
    [standard]
  );

  useEffect(() => {
    if (savedData?.completed_items) {
      setCompleted(savedData.completed_items);
    } else {
      setCompleted([]);
    }
  }, [savedData]);

  const toggleItem = (id: string) => {
    setCompleted((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id];
      saveProgress(updated);
      return updated;
    });
  };

  const items = data?.items || [];
  const progress = items.length > 0 ? Math.round((completed.length / items.length) * 100) : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111827] mb-6">Compliance Checklists</h1>

      {/* Standard Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STANDARDS.map((s) => (
          <button
            key={s}
            onClick={() => setStandard(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              standard === s
                ? "bg-primary text-white"
                : "bg-white border border-gray-200 text-[#6B7280] hover:border-primary hover:text-primary"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[#111827]">Progress</span>
          <span className="text-sm text-[#6B7280]">{completed.length}/{items.length} ({progress}%)</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className="bg-primary h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="card">
          {items.length === 0 ? (
            <p className="text-center text-[#6B7280] py-8">No checklist items found for this standard</p>
          ) : (
            <div className="space-y-2">
              {items.map((item: any) => (
                <label
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    completed.includes(item.id) ? "bg-primary-50" : "hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={completed.includes(item.id)}
                    onChange={() => toggleItem(item.id)}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${completed.includes(item.id) ? "text-primary line-through" : "text-[#111827]"}`}>
                      {item.text}
                    </p>
                    {item.principle && (
                      <p className="text-xs text-[#6B7280]">Principle {item.principle}</p>
                    )}
                  </div>
                  {completed.includes(item.id) && <CheckSquare className="w-5 h-5 text-primary" />}
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button className="btn-primary inline-flex items-center gap-2 text-sm">
          <FileText className="w-4 h-4" /> Generate Gap Report from Checklist
        </button>
        <button className="btn-secondary inline-flex items-center gap-2 text-sm">
          <Download className="w-4 h-4" /> Export as PDF
        </button>
      </div>
    </div>
  );
}
