import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { auth } from "../api/client";
import { Loader2, CheckCircle, XCircle, Leaf } from "lucide-react";

export default function VerifyMagicLink() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("No verification token found.");
      return;
    }

    auth
      .verifyMagic(token)
      .then((data) => {
        localStorage.setItem("zareb_token", data.access_token);
        localStorage.setItem("zareb_user", JSON.stringify(data.user));
        setStatus("success");
        setTimeout(() => navigate("/dashboard"), 1500);
      })
      .catch((err) => {
        setStatus("error");
        setError(err?.response?.data?.detail || "Link expired or invalid. Request a new one.");
      });
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-cream-200 flex items-center justify-center px-4">
      <div className="card max-w-md w-full text-center py-12">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-brand to-brand-800 rounded-xl flex items-center justify-center shadow-sm">
            <Leaf className="w-6 h-6 text-white" />
          </div>
        </div>

        {status === "verifying" && (
          <>
            <Loader2 className="w-12 h-12 text-brand animate-spin mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold text-stone-900 mb-2">Verifying your link...</h2>
            <p className="text-stone-500 text-sm">Please wait a moment</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-brand" />
            </div>
            <h2 className="font-display text-xl font-bold text-stone-900 mb-2">Signed in!</h2>
            <p className="text-stone-500 text-sm">Redirecting to dashboard...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-danger-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-danger" />
            </div>
            <h2 className="font-display text-xl font-bold text-stone-900 mb-2">Link expired</h2>
            <p className="text-stone-500 text-sm mb-6">{error}</p>
            <button onClick={() => navigate("/login")} className="btn-primary">
              Request new link
            </button>
          </>
        )}
      </div>
    </div>
  );
}
