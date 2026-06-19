import { NavLink, useNavigate } from "react-router-dom";
import { FileText, BarChart3, CheckSquare, MessageSquare, Settings, LogOut, Upload, Leaf } from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: BarChart3, label: "Dashboard" },
  { to: "/dashboard/upload", icon: Upload, label: "Upload" },
  { to: "/dashboard/chat", icon: MessageSquare, label: "Chat" },
  { to: "/dashboard/checklists", icon: CheckSquare, label: "Checklists" },
  { to: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("zareb_token");
    localStorage.removeItem("zareb_user");
    navigate("/");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-stone-200 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-stone-100">
        <NavLink to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand to-brand-800 rounded-xl flex items-center justify-center shadow-sm">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-stone-900 text-xl">Zareb</span>
            <p className="text-[11px] text-stone-400 leading-tight font-medium">Compliance Checker</p>
          </div>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/dashboard"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-brand-50 text-brand-700 border border-brand/10"
                  : "text-stone-500 hover:bg-stone-50 hover:text-stone-900 border border-transparent"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-4 space-y-2">
        {/* Trust badge */}
        <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-brand-50 to-cream-100 border border-brand/10">
          <p className="text-[11px] text-brand-700 font-medium leading-tight">
            Free for your first 3 checks
          </p>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-stone-500 hover:bg-danger-50 hover:text-danger w-full transition-all duration-150 border border-transparent hover:border-danger/10"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
