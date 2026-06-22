import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3, Users, FileText, TrendingUp, Globe,
  Loader2, AlertTriangle, Trash2, RefreshCw, Shield
} from "lucide-react";
import { useI18n } from "../i18n";

interface AdminStats {
  total_users: number;
  total_documents: number;
  total_reports: number;
  average_score: number;
  users_by_country: Record<string, number>;
  users_by_market: Record<string, number>;
  new_users_7d: number;
  admin_emails: string[];
}

interface UserData {
  id: string;
  email: string;
  company_name: string;
  country: string;
  export_market: string;
  created_at: string;
}

export default function AdminPage() {
  const { t: tr } = useI18n();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"overview" | "users">("overview");
  const [userPage, setUserPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchStats = async () => {
    const token = localStorage.getItem("zareb_token");
    try {
      const res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) {
        navigate("/dashboard");
        return;
      }
      const data = await res.json();
      setStats(data);
    } catch {
      setError("Failed to load admin stats");
    }
  };

  const fetchUsers = async (page: number = 1) => {
    const token = localStorage.getItem("zareb_token");
    try {
      const res = await fetch(`/api/admin/users?page=${page}&per_page=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 403) {
        navigate("/dashboard");
        return;
      }
      const data = await res.json();
      setUsers(data.users || []);
      setTotalUsers(data.total || 0);
    } catch {
      setError("Failed to load users");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    const token = localStorage.getItem("zareb_token");
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers(userPage);
      fetchStats();
    } catch {
      setError("Failed to delete user");
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchStats(), fetchUsers()]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <Shield className="w-12 h-12 text-stone-300 mx-auto mb-4" />
        <p className="text-stone-500">Admin access required</p>
        <button onClick={() => navigate("/dashboard")} className="btn-primary mt-4">Back to Dashboard</button>
      </div>
    );
  }

  const totalPages = Math.ceil(totalUsers / 50);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-stone-900 mb-2">Admin Dashboard</h1>
            <p className="text-stone-500">System overview and user management.</p>
          </div>
          <button onClick={() => { fetchStats(); fetchUsers(userPage); }} className="btn-ghost border border-stone-200 rounded-lg">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-danger-50 text-danger-700 border border-danger/10 px-4 py-3 rounded-xl text-sm mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["overview", "users"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === t ? "bg-brand text-white shadow-sm" : "bg-white border border-stone-200 text-stone-500 hover:border-brand/30"
            }`}
          >
            {t === "overview" ? tr("admin.overview") : tr("admin.users")}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[
              { icon: Users, label: "Total Users", value: stats.total_users, color: "bg-brand-50 text-brand" },
              { icon: FileText, label: "Documents", value: stats.total_documents, color: "bg-info-50 text-info" },
              { icon: BarChart3, label: "Reports", value: stats.total_reports, color: "bg-warning-50 text-warning" },
              { icon: TrendingUp, label: "Avg Score", value: `${stats.average_score}%`, color: "bg-success-50 text-success" },
              { icon: Globe, label: "New (7d)", value: stats.new_users_7d, color: "bg-brand-50 text-brand" },
            ].map((stat, i) => (
              <div key={i} className="card-warm flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-display text-2xl font-bold text-stone-900">{stat.value}</p>
                  <p className="text-sm text-stone-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Users by Country */}
            <div className="card">
              <h3 className="font-display font-semibold text-stone-900 mb-4">Users by Country</h3>
              <div className="space-y-2">
                {Object.entries(stats.users_by_country).length === 0 && (
                  <p className="text-stone-400 text-sm">No data yet</p>
                )}
                {Object.entries(stats.users_by_country).map(([country, count]) => (
                  <div key={country} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-stone-600">{country}</span>
                    <span className="text-sm font-semibold text-stone-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Users by Market */}
            <div className="card">
              <h3 className="font-display font-semibold text-stone-900 mb-4">Users by Export Market</h3>
              <div className="space-y-2">
                {Object.entries(stats.users_by_market).length === 0 && (
                  <p className="text-stone-400 text-sm">No data yet</p>
                )}
                {Object.entries(stats.users_by_market).map(([market, count]) => (
                  <div key={market} className="flex items-center justify-between py-1.5">
                    <span className="text-sm text-stone-600">{market}</span>
                    <span className="text-sm font-semibold text-stone-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "users" && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-stone-900">
              {tr("admin.users")} ({totalUsers})
            </h3>
          </div>

          {users.length === 0 ? (
            <p className="text-stone-400 text-sm py-8 text-center">{tr("admin.noUsers")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100">
                    <th className="text-left py-3 px-3 text-stone-500 font-medium">Email</th>
                    <th className="text-left py-3 px-3 text-stone-500 font-medium">Company</th>
                    <th className="text-left py-3 px-3 text-stone-500 font-medium">Country</th>
                    <th className="text-left py-3 px-3 text-stone-500 font-medium">Market</th>
                    <th className="text-left py-3 px-3 text-stone-500 font-medium">Joined</th>
                    <th className="text-right py-3 px-3 text-stone-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                      <td className="py-3 px-3 text-stone-900">{u.email}</td>
                      <td className="py-3 px-3 text-stone-600">{u.company_name || "—"}</td>
                      <td className="py-3 px-3">{u.country}</td>
                      <td className="py-3 px-3">{u.export_market}</td>
                      <td className="py-3 px-3 text-stone-500 text-xs">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-danger hover:text-danger-700 transition-colors p-1"
                          title={tr("admin.deleteUser")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => { setUserPage(p); fetchUsers(p); }}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    p === userPage ? "bg-brand text-white" : "bg-stone-100 text-stone-500 hover:bg-brand-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
