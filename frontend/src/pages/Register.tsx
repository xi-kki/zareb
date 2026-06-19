import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { auth } from "../api/client";
import { UserPlus, Leaf } from "lucide-react";

const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "Other"];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    company_name: "",
    country: "Nigeria",
    export_market: "EU",
  });
  const [error, setError] = useState("");

  const registerMutation = useMutation({
    mutationFn: auth.register,
    onSuccess: (data) => {
      localStorage.setItem("zareb_token", data.access_token);
      localStorage.setItem("zareb_user", JSON.stringify(data.user));
      navigate("/dashboard");
    },
    onError: (err: any) => {
      setError(err?.response?.data?.detail || "Registration failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    registerMutation.mutate(form);
  };

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

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
          <h1 className="font-display text-2xl font-bold text-stone-900 mb-2">Get started free</h1>
          <p className="text-stone-500 mb-6 text-sm">First 3 compliance checks on us</p>

          {error && (
            <div className="bg-danger-50 text-danger-700 border border-danger/10 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="input-field"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Company Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="Your food company"
                value={form.company_name}
                onChange={(e) => update("company_name", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Country</label>
              <select
                className="input-field"
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Export Market Target</label>
              <select
                className="input-field"
                value={form.export_market}
                onChange={(e) => update("export_market", e.target.value)}
              >
                <option value="EU">European Union (EU)</option>
                <option value="UK">United Kingdom (UK)</option>
                <option value="Both">Both EU & UK</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {registerMutation.isPending ? "Creating account..." : "Create Account"}
              <UserPlus className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-sm text-stone-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand font-medium hover:text-brand-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
