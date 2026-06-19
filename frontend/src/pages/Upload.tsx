import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { documents, analysis } from "../api/client";
import { Upload, FileText, Loader2, Camera, ScanLine, Sparkles } from "lucide-react";
import CameraScanner from "../components/CameraScanner";

const DOC_TYPES = [
  { value: "product_label", label: "Product Label / Ingredient List" },
  { value: "haccp_plan", label: "HACCP Plan" },
  { value: "ingredient_list", label: "Bill of Materials (BOM)" },
  { value: "sop", label: "Standard Operating Procedure (SOP)" },
  { value: "audit_report", label: "Previous Audit Report" },
  { value: "supplier_cert", label: "Supplier Certificate" },
  { value: "other", label: "Other" },
];

const STANDARDS = [
  { value: "BRCGS", label: "BRCGS (UK Retail — Sainsbury's, Tesco, Waitrose)" },
  { value: "HACCP", label: "HACCP (General)" },
  { value: "FSMA", label: "FSMA (US FDA)" },
  { value: "SQF", label: "SQF (Safe Quality Food)" },
  { value: "ISO22000", label: "ISO 22000" },
  { value: "NAFDAC", label: "NAFDAC (Nigeria)" },
  { value: "KEBS", label: "KEBS (Kenya)" },
  { value: "FDA_EU", label: "EU Food Law — Novel Food & Allergens" },
];

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("product_label");
  const [standard, setStandard] = useState("BRCGS");
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
      setProgress("Analyzing with AI... (30-60 seconds)");
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
      setProgress(err?.response?.data?.detail || "Upload failed. Try again.");
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

  const handleCameraCapture = (capturedFile: File) => {
    setFile(capturedFile);
    setDocType("product_label");
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-stone-900 mb-3">
          Check your compliance in 30 seconds
        </h1>
        <p className="text-stone-500 leading-relaxed">
          Upload a label, HACCP plan, or audit report. Zareb scans it against your target standard
          and tells you exactly where you stand — <span className="text-stone-700 font-medium">before the auditor does.</span>
        </p>
      </div>

      {/* Camera Scanner */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
            <Camera className="w-4 h-4 text-brand" />
          </div>
          <span className="text-sm font-medium text-stone-700">Snap a photo of any label</span>
        </div>
        <CameraScanner onCapture={handleCameraCapture} disabled={isAnalyzing} />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 border-t border-stone-200" />
        <span className="text-xs text-stone-400 font-medium tracking-wider uppercase">Or upload a file</span>
        <div className="flex-1 border-t border-stone-200" />
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-200 mb-6 ${
          isDragActive
            ? "border-brand bg-brand-50/50"
            : file
            ? "border-success bg-success-50/30"
            : "border-stone-200 hover:border-brand/40 hover:bg-cream-100/50"
        }`}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-success-50 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-success" />
            </div>
            <p className="font-display font-semibold text-stone-900">{file.name}</p>
            <p className="text-sm text-stone-500 mt-1">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="text-sm text-danger hover:text-danger-700 transition-colors mt-3 font-medium"
            >
              Remove and try another file
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-stone-400" />
            </div>
            <p className="font-display font-semibold text-stone-700 text-lg">
              {isDragActive ? "Drop your file here" : "Drag & drop a file, or click to browse"}
            </p>
            <p className="text-sm text-stone-400 mt-2">
              PDF, DOCX, JPG, PNG — up to 10MB
            </p>
          </div>
        )}
      </div>

      {/* Document Type + Standard */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            What are you checking?
          </label>
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
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Standard to check against
          </label>
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
      </div>

      {/* CTA */}
      <button
        onClick={handleAnalyze}
        disabled={!file || uploadMutation.isPending}
        className="btn-primary w-full flex items-center justify-center gap-2 py-4"
      >
        {uploadMutation.isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {progress || "Analyzing..."}
          </>
        ) : (
          <>
            <ScanLine className="w-5 h-5" />
            {file ? "Run compliance check — it's free" : "Select a file to get started"}
          </>
        )}
      </button>

      {isAnalyzing && !uploadMutation.isPending && (
        <div className="mt-4 bg-brand-50 text-brand-700 border border-brand/10 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          {progress}
        </div>
      )}

      {/* Trust signal */}
      <p className="text-xs text-stone-400 text-center mt-6">
        Free for your first 3 checks. No credit card required.
      </p>
    </div>
  );
}
