import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { auth } from "../api/client";
import { Settings, Save, Loader2 } from "lucide-react";

const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "Other"];

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    company_name: "",
    country: "Nigeria",
    export_market: "EU",
  });
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("nuri_user");
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      setForm({ company_name: u.company_name || "", country: u.country || "Nigeria", export_market: u.export_market || "EU" });
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[#111827] mb-6">Settings</h1>

      {/* Company Profile */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-[#111827] mb-4">Company Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1">Email</label>
            <input type="email" value={user.email} disabled className="input-field bg-gray-50 text-[#6B7280]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1">Company Name</label>
            <input
              type="text"
              className="input-field"
              value={form.company_name}
              onChange={(e) => update("company_name", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1">Country</label>
            <select className="input-field" value={form.country} onChange={(e) => update("country", e.target.value)}>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1">Export Market Target</label>
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
        <h2 className="text-lg font-semibold text-[#111827] mb-4">Export Market Preferences</h2>
        <p className="text-sm text-[#6B7280] mb-4">
          Nuri tailors compliance checks to your target markets. Your current preference: <strong>{form.export_market}</strong>
        </p>
        <div className="flex gap-3">
          {["EU", "UK", "Both"].map((m) => (
            <button
              key={m}
              onClick={() => update("export_market", m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                form.export_market === m
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-[#6B7280] hover:bg-gray-200"
              }`}
            >
              {m === "EU" ? "European Union" : m === "UK" ? "United Kingdom" : "Both"}
            </button>
          ))}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-[#111827] mb-4">Notifications</h2>
        <div className="space-y-3">
          {[
            { id: "report_ready", label: "Email me when a compliance report is ready" },
            { id: "weekly_summary", label: "Weekly compliance summary" },
            { id: "reg_updates", label: "Regulatory updates for my target markets" },
          ].map((n) => (
            <label key={n.id} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
              <span className="text-sm text-[#111827]">{n.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Change Password */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-[#111827] mb-4">Change Password</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1">Current Password</label>
            <input type="password" className="input-field" placeholder="Enter current password" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1">New Password</label>
            <input type="password" className="input-field" placeholder="At least 6 characters" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#111827] mb-1">Confirm New Password</label>
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
