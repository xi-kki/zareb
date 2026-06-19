import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { auth } from "../api/client";
import { LogIn, Mail, ArrowRight, CheckCircle, Leaf } from "lucide-react";

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
      localStorage.setItem("zareb_token", data.access_token);
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
    <div className="min-h-screen bg-cream-200 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 bg-gradient-to-br from-brand to-brand-800 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-stone-900 text-2xl">Zareb</span>
          </Link>
        </div>

        <div className="card">
          <h1 className="font-display text-2xl font-bold text-stone-900 mb-2">Welcome back</h1>
          <p className="text-stone-500 mb-6 text-sm">Sign in to check your compliance</p>

          {error && (
            <div className="bg-danger-50 text-danger-700 border border-danger/10 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          {magicSent ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-brand" />
              </div>
              <h3 className="font-display font-semibold text-stone-900 mb-2">Magic link sent!</h3>
              <p className="text-sm text-stone-500 mb-4">
                Check your email inbox (or server console in dev mode) for your sign-in link.
                <br />It expires in 15 minutes.
              </p>
              <button
                onClick={() => setMagicSent(false)}
                className="text-brand font-medium text-sm hover:text-brand-700 transition-colors"
              >
                Send another link
              </button>
            </div>
          ) : mode === "password" ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
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
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
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
                  <div className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-3 text-stone-400">or</span>
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
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
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
                  <div className="w-full border-t border-stone-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-3 text-stone-400">or</span>
                </div>
              </div>

              <button
                onClick={() => setMode("password")}
                className="text-brand text-sm font-medium hover:text-brand-700 transition-colors text-center w-full"
              >
                Sign in with password instead
              </button>
            </>
          )}

          <p className="text-center text-sm text-stone-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand font-medium hover:text-brand-700 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
