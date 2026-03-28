import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

function Avatar({ name, size = "sm" }) {
  const initials = name ? name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  const colors = ["#ff7410","#6366f1","#10b981","#3b82f6","#ec4899","#f59e0b"];
  const color = colors[name?.charCodeAt(0) % colors.length] || colors[0];
  const s = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={`${s} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ background: color }}>
      {initials}
    </div>
  );
}

export default function TopBar({ selectedNote }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="flex items-center gap-3 px-5 py-3 border-b flex-shrink-0"
      style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Notes</span>
        {selectedNote && (
          <>
            <span style={{ color: "var(--border)" }}>›</span>
            <span className="text-sm font-semibold truncate max-w-xs" style={{ color: "var(--text-primary)" }}>
              {selectedNote.name}
            </span>
            <span className={`badge ${selectedNote.fileType === "pdf" ? "badge-brand" : "badge-muted"} text-xs ml-1`}>
              {selectedNote.fileType?.toUpperCase()}
            </span>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button onClick={toggle}
          className="btn-icon w-9 h-9"
          style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}>
          {dark ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen(o => !o)}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all duration-100"
            style={{ background: menuOpen ? "var(--bg-tertiary)" : "transparent" }}>
            <Avatar name={user?.name} />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>{user?.name}</p>
              <p className="text-xs leading-tight" style={{ color: "var(--text-muted)" }}>{user?.email}</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)" }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 card p-1.5 z-50 animate-fade-up shadow-lg">
              <div className="px-3 py-2 mb-1">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{user?.name}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{user?.email}</p>
              </div>
              <div className="divider my-1" />
              <button onClick={() => { setMenuOpen(false); logout(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors font-medium">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
