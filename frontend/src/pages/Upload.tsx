import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { documents, analysis } from "../api/client";
import { Upload, FileText, Loader2 } from "lucide-react";

const DOC_TYPES = [
  { value: "haccp_plan", label: "HACCP Plan" },
  { value: "ingredient_list", label: "Ingredient List / Bill of Materials" },
  { value: "product_label", label: "Product Label" },
  { value: "sop", label: "Standard Operating Procedure (SOP)" },
  { value: "audit_report", label: "Previous Audit Report" },
  { value: "supplier_cert", label: "Supplier Certificate" },
  { value: "other", label: "Other" },
];

const STANDARDS = [
  { value: "HACCP", label: "HACCP (General)" },
  { value: "FSMA", label: "FSMA (US FDA)" },
  { value: "SQF", label: "SQF (Safe Quality Food)" },
  { value: "BRCGS", label: "BRCGS (UK Retail)" },
  { value: "ISO22000", label: "ISO 22000" },
  { value: "NAFDAC", label: "NAFDAC (Nigeria)" },
  { value: "KEBS", label: "KEBS (Kenya)" },
  { value: "FDA_EU", label: "EU Food Law" },
];

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("haccp_plan");
  const [standard, setStandard] = useState("HACCP");
  const [progress, setProgress] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file selected");
      setProgress("Uploading document...");
      const doc = await documents.upload(file, docType);
      return doc;
    },
    onSuccess: async (doc) => {
      setProgress("Analyzing with Claude... (30-60 seconds)");
      setIsAnalyzing(true);
      try {
        const report = await analysis.analyze(doc.id, standard);
        navigate(`/dashboard/reports/${report.id}`);
      } catch {
        setProgress("Analysis started. Check reports page.");
        setTimeout(() => navigate("/dashboard"), 1500);
      }
    },
    onError: (err: any) => {
      setProgress(err?.response?.data?.detail || "Upload failed");
      setIsAnalyzing(false);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 1,
  });

  const handleAnalyze = () => {
    if (!file) return;
    uploadMutation.mutate();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111827] mb-6">Upload Document</h1>

      <div className="max-w-2xl">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors mb-6 ${
            isDragActive
              ? "border-primary bg-primary-50"
              : file
              ? "border-primary bg-primary-50/50"
              : "border-gray-300 hover:border-primary hover:bg-gray-50"
          }`}
        >
          <input {...getInputProps()} />
          {file ? (
            <div className="flex flex-col items-center">
              <FileText className="w-12 h-12 text-primary mb-3" />
              <p className="font-semibold text-[#111827]">{file.name}</p>
              <p className="text-sm text-[#6B7280]">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="text-sm text-danger hover:underline mt-2"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-12 h-12 text-[#6B7280] mb-3" />
              <p className="font-semibold text-[#111827]">
                {isDragActive ? "Drop your file here" : "Drag & drop your file here"}
              </p>
              <p className="text-sm text-[#6B7280]">or click to browse</p>
              <p className="text-xs text-[#6B7280] mt-2">PDF, DOCX, DOC, JPG, PNG · Max 10MB</p>
            </div>
          )}
        </div>

        {/* Document Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#111827] mb-1">Document Type</label>
          <select
            className="input-field"
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            disabled={isAnalyzing}
          >
            {DOC_TYPES.map((dt) => (
              <option key={dt.value} value={dt.value}>{dt.label}</option>
            ))}
          </select>
        </div>

        {/* Standard */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#111827] mb-1">Standard to Check Against</label>
          <select
            className="input-field"
            value={standard}
            onChange={(e) => setStandard(e.target.value)}
            disabled={isAnalyzing}
          >
            {STANDARDS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={!file || uploadMutation.isPending}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {uploadMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {progress || "Analyzing..."}
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              Analyze with Kamara
            </>
          )}
        </button>

        {isAnalyzing && !uploadMutation.isPending && (
          <div className="mt-4 bg-info-50 text-info-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {progress}
          </div>
        )}
      </div>
    </div>
  );
}
