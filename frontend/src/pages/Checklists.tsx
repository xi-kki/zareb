import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { checklists } from "../api/client";
import { CheckSquare, Download, FileText, ChevronRight, Loader2, ClipboardList } from "lucide-react";

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

  const debouncedSave = useRef<ReturnType<typeof setTimeout>>();
  const saveProgress = useCallback(
    (items: string[]) => {
      clearTimeout(debouncedSave.current);
      debouncedSave.current = setTimeout(() => {
        saveMutation.mutate(items);
      }, 2000);
    },
    [standard, saveMutation]
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
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-stone-900 mb-2">Compliance Checklists</h1>
        <p className="text-stone-500">Track your readiness against each standard.</p>
      </div>

      {/* Standard Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STANDARDS.map((s) => (
          <button
            key={s}
            onClick={() => setStandard(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
              standard === s
                ? "bg-brand text-white shadow-sm"
                : "bg-white border border-stone-200 text-stone-500 hover:border-brand/30 hover:text-brand"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="card-warm mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-stone-700">Progress</span>
          <span className="text-sm text-stone-500">{completed.length}/{items.length} ({progress}%)</span>
        </div>
        <div className="w-full bg-stone-100 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-brand to-brand-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      ) : (
        <div className="card">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-500">No checklist items found for this standard</p>
            </div>
          ) : (
            <div className="space-y-1">
              {items.map((item: any) => (
                <label
                  key={item.id}
                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-150 ${
                    completed.includes(item.id) ? "bg-brand-50/50 border border-brand/10" : "hover:bg-stone-50 border border-transparent"
                  }`}
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={completed.includes(item.id)}
                      onChange={() => toggleItem(item.id)}
                      className="w-5 h-5 rounded border-stone-300 text-brand focus:ring-brand/30 accent-brand"
                    />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${completed.includes(item.id) ? "text-brand line-through" : "text-stone-800"}`}>
                      {item.text}
                    </p>
                    {item.principle && (
                      <p className="text-xs text-stone-400 mt-0.5">Principle {item.principle}</p>
                    )}
                  </div>
                  {completed.includes(item.id) && (
                    <CheckSquare className="w-5 h-5 text-brand" />
                  )}
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
