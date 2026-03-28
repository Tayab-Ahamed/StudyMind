import React, { useState } from "react";
import { useNotes } from "../../hooks/useNotes";
import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";
import SummaryPanel from "../../components/notes/SummaryPanel";
import ChatPanel from "../../components/chat/ChatPanel";

const TABS = [
  {
    id: "summary", label: "Summary",
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  },
  {
    id: "chat", label: "Chat",
    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
];

export default function DashboardPage() {
  const { notes, loading, uploading, uploadProgress, error, setError, upload, remove, summarize } = useNotes();
  const [selectedNote, setSelectedNote] = useState(null);
  const [activeTab,    setActiveTab]    = useState("summary");
  const [uploadError,  setUploadError]  = useState(null);

  const handleUpload = async (file) => {
    setUploadError(null);
    try {
      const note = await upload(file);
      setSelectedNote({ ...note, hasSummary: false });
    } catch (e) { setUploadError(e.message); }
  };

  const handleDelete = async (id) => {
    await remove(id);
    if (selectedNote?.id === id) setSelectedNote(null);
  };

  const handleSummarize = async (id) => {
    const result = await summarize(id);
    if (selectedNote?.id === id) setSelectedNote((n) => ({ ...n, hasSummary: true, summary: result }));
    return result;
  };

  const handleSelectNote = (note) => {
    setSelectedNote(note);
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      <Sidebar
        notes={notes}
        loading={loading}
        uploading={uploading}
        uploadProgress={uploadProgress}
        uploadError={uploadError}
        selectedNote={selectedNote}
        onUpload={handleUpload}
        onSelect={handleSelectNote}
        onDelete={handleDelete}
        onSummarize={handleSummarize}
      />

      {/* Main panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar selectedNote={selectedNote} />

        {/* Tab bar */}
        <div className="flex items-center gap-1 px-5 pt-3 pb-0 border-b flex-shrink-0"
          style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-all duration-150 -mb-px
                ${activeTab === tab.id
                  ? "border-brand-500 text-brand-500"
                  : "border-transparent hover:text-[var(--text-primary)]"}`}
              style={{ color: activeTab === tab.id ? "#ff7410" : "var(--text-muted)" }}>
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Panel content */}
        <div className="flex-1 overflow-hidden" style={{ background: "var(--bg-primary)" }}>
          {activeTab === "summary"
            ? <SummaryPanel note={selectedNote} onSummarize={handleSummarize} />
            : <ChatPanel selectedNote={selectedNote} />
          }
        </div>
      </div>
    </div>
  );
}
