import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/surveys', icon: ClipboardList, label: 'Encuestas' },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 border-r border-[#30363d] bg-[#161b22] flex flex-col z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#30363d]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-600/30">
          <FileText className="h-4 w-4 text-white" />
        </div>
        <div className="leading-tight">
          <p className="text-xs font-bold text-[#e6edf3] tracking-wide">GOV</p>
          <p className="text-[10px] text-[#8b949e]">Encuestas Público</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 group
              ${isActive
                ? 'bg-blue-600/15 text-blue-400 border border-blue-600/20'
                : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </span>
                {isActive && <ChevronRight className="h-3 w-3 opacity-60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#30363d]">
        <p className="text-[10px] text-[#484f58]">v1.0.0 · Módulo Encuestas</p>
      </div>
    </aside>
  );
};

export default Sidebar;
