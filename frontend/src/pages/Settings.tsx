import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { auth } from "../api/client";
import { Settings, Save, Loader2, Leaf } from "lucide-react";

const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "Other"];

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    company_name: "",
    country: "Nigeria",
    export_market: "EU",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("zareb_user");
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      setForm({
        company_name: u.company_name || "",
        country: u.country || "Nigeria",
        export_market: u.export_market || "EU",
      });
    }
  }, []);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSaveProfile = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-stone-900 mb-2">Settings</h1>
        <p className="text-stone-500">Manage your account and preferences.</p>
      </div>

      {/* Company Profile */}
      <div className="card mb-6">
        <h2 className="font-display text-lg font-semibold text-stone-900 mb-4">Company Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
            <input type="email" value={user.email} disabled className="input-field bg-stone-50 text-stone-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Company Name</label>
            <input
              type="text"
              className="input-field"
              value={form.company_name}
              onChange={(e) => update("company_name", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Country</label>
            <select className="input-field" value={form.country} onChange={(e) => update("country", e.target.value)}>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Export Market Target</label>
            <select className="input-field" value={form.export_market} onChange={(e) => update("export_market", e.target.value)}>
              <option value="EU">European Union (EU)</option>
              <option value="UK">United Kingdom (UK)</option>
              <option value="Both">Both EU & UK</option>
            </select>
          </div>
          <button onClick={handleSaveProfile} className="btn-primary inline-flex items-center gap-2">
            <Save className="w-4 h-4" /> {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Export Market Preferences */}
      <div className="card mb-6">
        <h2 className="font-display text-lg font-semibold text-stone-900 mb-4">Export Market Preferences</h2>
        <p className="text-sm text-stone-500 mb-4">
          Zareb tailors compliance checks to your target markets. Your current preference:{' '}
          <span className="font-semibold text-stone-700">{form.export_market}</span>
        </p>
        <div className="flex gap-3">
          {["EU", "UK", "Both"].map((m) => (
            <button
              key={m}
              onClick={() => update("export_market", m)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                form.export_market === m
                  ? "bg-brand text-white shadow-sm"
                  : "bg-stone-100 text-stone-500 hover:bg-stone-200"
              }`}
            >
              {m === "EU" ? "European Union" : m === "UK" ? "United Kingdom" : "Both"}
            </button>
          ))}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="card mb-6">
        <h2 className="font-display text-lg font-semibold text-stone-900 mb-4">Notifications</h2>
        <div className="space-y-3">
          {[
            { id: "report_ready", label: "Email me when a compliance report is ready" },
            { id: "weekly_summary", label: "Weekly compliance summary" },
            { id: "reg_updates", label: "Regulatory updates for my target markets" },
          ].map((n) => (
            <label key={n.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 cursor-pointer transition-colors">
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-stone-300 text-brand focus:ring-brand/30 accent-brand" />
              <span className="text-sm text-stone-700">{n.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Change Password */}
      <div className="card mb-6">
        <h2 className="font-display text-lg font-semibold text-stone-900 mb-4">Change Password</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Current Password</label>
            <input type="password" className="input-field" placeholder="Enter current password" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">New Password</label>
            <input type="password" className="input-field" placeholder="At least 6 characters" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Confirm New Password</label>
            <input type="password" className="input-field" placeholder="Confirm new password" />
          </div>
          <button className="btn-primary inline-flex items-center gap-2">
            <Save className="w-4 h-4" /> Update Password
          </button>
        </div>
      </div>
    </div>
  );
}
