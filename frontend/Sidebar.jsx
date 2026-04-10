import React from "react";
import {
  LayoutDashboard,
  GitBranch,
  FlaskConical,
  Upload,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "network", label: "Network Map", icon: GitBranch },
  { id: "scenarios", label: "Scenarios", icon: FlaskConical },
  { id: "upload", label: "Data Upload", icon: Upload },
  { id: "insights", label: "AI Insights", icon: Sparkles },
];

export default function Sidebar({ activeView, onNavigate, collapsed, onToggle }) {
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-icon">SC</div>
        {!collapsed && (
          <div className="brand-text">
            <h2>Supply Chain</h2>
            <span>Network Analyst</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeView === item.id ? "active" : ""}`}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="nav-icon" size={20} />
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-toggle">
        <button onClick={onToggle} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>
    </aside>
  );
}
