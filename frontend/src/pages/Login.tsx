import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { auth } from "../api/client";
import { LogIn, Mail, ArrowRight, CheckCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [magicSent, setMagicSent] = useState(false);

  const loginMutation = useMutation({
    mutationFn: auth.login,
    onSuccess: (data) => {
      localStorage.setItem("nuri_token", data.access_token);
      navigate("/dashboard");
    },
    onError: () => setError("Invalid email or password"),
  });

  const magicMutation = useMutation({
    mutationFn: auth.magicLink,
    onSuccess: () => setMagicSent(true),
    onError: (err: any) => setError(err?.response?.data?.detail || "Failed to send magic link"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ email, password });
  };

  const handleMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMagicSent(false);
    magicMutation.mutate({ email });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="font-bold text-[#111827] text-2xl">Nuri</span>
          </Link>
        </div>

        <div className="card">
          <h1 className="text-2xl font-bold text-[#111827] mb-2">Welcome back</h1>
          <p className="text-[#6B7280] mb-6">Sign in to check your compliance</p>

          {error && (
            <div className="bg-danger-50 text-danger-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {magicSent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-[#111827] mb-2">Magic link sent!</h3>
              <p className="text-sm text-[#6B7280] mb-4">
                Check your email inbox (or server console in dev mode) for your sign-in link.
                <br />It expires in 15 minutes.
              </p>
              <button
                onClick={() => setMagicSent(false)}
                className="text-primary font-medium text-sm hover:underline"
              >
                Send another link
              </button>
            </div>
          ) : mode === "password" ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1">Email</label>
                  <input
                    type="email"
                    required
                    className="input-field"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1">Password</label>
                  <input
                    type="password"
                    required
                    className="input-field"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                  <LogIn className="w-4 h-4" />
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-3 text-[#6B7280]">or</span>
                </div>
              </div>

              <button
                onClick={() => setMode("magic")}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" /> Sign in with Magic Link
              </button>
            </>
          ) : (
            <>
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#111827] mb-1">Email</label>
                  <input
                    type="email"
                    required
                    className="input-field"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={magicMutation.isPending}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {magicMutation.isPending ? "Sending..." : "Send Magic Link"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-3 text-[#6B7280]">or</span>
                </div>
              </div>

              <button
                onClick={() => setMode("password")}
                className="text-primary text-sm font-medium hover:underline text-center w-full"
              >
                Sign in with password instead
              </button>
            </>
          )}

          <p className="text-center text-sm text-[#6B7280] mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
