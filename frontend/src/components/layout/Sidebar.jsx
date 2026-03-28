import React, { useState, useCallback } from "react";
import { SkeletonList, Alert } from "../ui";

function NoteItem({ note, selected, onSelect, onDelete, onSummarize }) {
  const [summarizing, setSummarizing] = useState(false);

  const handleSummarize = async (e) => {
    e.stopPropagation();
    setSummarizing(true);
    try { await onSummarize(note.id); } finally { setSummarizing(false); }
  };

  const timeAgo = (iso) => {
    const m = Math.floor((Date.now() - new Date(iso)) / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div onClick={() => onSelect(note)}
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-100
        ${selected ? "bg-brand-500/10 border border-brand-500/20" : "hover:bg-[var(--bg-tertiary)] border border-transparent"}`}>

      {/* File icon */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm
        ${note.fileType === "pdf" ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"}`}>
        {note.fileType === "pdf" ? "📄" : "📝"}
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: selected ? "#ff7410" : "var(--text-primary)" }}>
          {note.name}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{timeAgo(note.createdAt)}</span>
          {note.hasSummary && <span className="badge badge-success text-[10px] py-0 px-1.5">✓ Summary</span>}
        </div>
      </div>

      {/* Hover actions */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1
        opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "var(--bg-secondary)" }}>
        {!note.hasSummary && (
          <button onClick={handleSummarize} disabled={summarizing}
            className="text-[11px] px-2 py-1 rounded-lg bg-brand-500/10 text-brand-500 hover:bg-brand-500/20 font-semibold transition-colors whitespace-nowrap">
            {summarizing ? "…" : "✨"}
          </button>
        )}
        <button onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
          className="text-xs p-1 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

function UploadZone({ onUpload, uploading, progress }) {
  const [drag, setDrag] = useState(false);

  const handleFile = useCallback((file) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith(".pdf") && !name.endsWith(".txt")) {
      alert("Only PDF and .txt files are supported.");
      return;
    }
    onUpload(file);
  }, [onUpload]);

  return (
    <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
      className={`relative border-2 border-dashed rounded-2xl p-5 text-center transition-all duration-200 cursor-pointer
        ${drag ? "border-brand-500 bg-brand-500/5" : "border-[var(--border)] hover:border-brand-500/50 hover:bg-brand-500/3"}`}>
      <input type="file" accept=".pdf,.txt" disabled={uploading}
        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        onChange={(e) => handleFile(e.target.files[0])} />

      {uploading ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-brand-500">Uploading… {progress}%</p>
          <div className="w-full rounded-full h-1" style={{ background: "var(--border)" }}>
            <div className="bg-brand-500 h-1 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="w-8 h-8 rounded-xl bg-brand-500/10 flex items-center justify-center mx-auto">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff7410" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <p className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
            Drop file or <span className="text-brand-500">browse</span>
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>PDF or TXT · max 10 MB</p>
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ notes, loading, uploading, uploadProgress, uploadError, selectedNote, onUpload, onSelect, onDelete, onSummarize }) {
  const [search, setSearch] = useState("");
  const filtered = notes.filter(n => n.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col border-r" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow-sm flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        </div>
        <span className="font-bold text-base" style={{ color: "var(--text-primary)" }}>StudyMind</span>
        <span className="ml-auto badge badge-muted text-[10px]">{notes.length}</span>
      </div>

      {/* Upload */}
      <div className="p-3 border-b" style={{ borderColor: "var(--border)" }}>
        <UploadZone onUpload={onUpload} uploading={uploading} progress={uploadProgress} />
        {uploadError && <div className="mt-2"><Alert message={uploadError} type="error" /></div>}
      </div>

      {/* Search */}
      <div className="px-3 pt-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--text-muted)" }}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input className="input pl-8 py-2 text-xs" placeholder="Search notes…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {loading ? <SkeletonList count={4} height="h-14" /> :
         filtered.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-2xl opacity-20 mb-2">📚</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {search ? "No matching notes" : "Upload your first note"}
            </p>
          </div>
        ) : filtered.map((note) => (
          <NoteItem key={note.id} note={note} selected={selectedNote?.id === note.id}
            onSelect={onSelect} onDelete={onDelete} onSummarize={onSummarize} />
        ))}
      </div>
    </aside>
  );
}
