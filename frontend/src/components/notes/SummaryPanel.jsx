import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Spinner, SkeletonText, EmptyState, Alert } from "../ui";

export default function SummaryPanel({ note, onSummarize }) {
  const [summary,  setSummary]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const handleSummarize = async () => {
    setLoading(true); setError(null);
    try {
      const result = await onSummarize(note.id);
      setSummary(result);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  if (!note) {
    return <EmptyState icon="✨" title="Select a note" description="Choose a note from the sidebar to view its AI summary" />;
  }

  const hasSummaryContent = summary || note.summary;

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: "var(--border)" }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "var(--text-muted)" }}>AI Summary</p>
          <h2 className="text-base font-bold truncate max-w-sm" style={{ color: "var(--text-primary)" }}>{note.name}</h2>
        </div>
        {!hasSummaryContent && !loading && (
          <button onClick={handleSummarize} className="btn-brand">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            Generate Summary
          </button>
        )}
        {hasSummaryContent && !loading && (
          <button onClick={handleSummarize} disabled={loading}
            className="btn-secondary text-xs gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Regenerate
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {loading && (
          <div>
            <div className="flex items-center gap-3 mb-6 p-4 rounded-xl animate-pulse-brand"
              style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border)" }}>
              <Spinner size="md" className="text-brand-500" />
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Generating summary…</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Claude is reading your notes</p>
              </div>
            </div>
            <SkeletonText lines={8} />
          </div>
        )}

        {error && !loading && <Alert message={error} onDismiss={() => setError(null)} />}

        {!loading && hasSummaryContent && (
          <div className="prose-content animate-fade-up">
            <ReactMarkdown>{summary || note.summary}</ReactMarkdown>
          </div>
        )}

        {!loading && !error && !hasSummaryContent && (
          <EmptyState icon="📋"
            title="No summary yet"
            description="Click 'Generate Summary' to get an AI-powered overview of your notes"
            action={
              <button onClick={handleSummarize} className="btn-brand">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                Generate Summary
              </button>
            }
          />
        )}

        {/* Metadata footer */}
        {hasSummaryContent && !loading && (
          <div className="mt-6 pt-4 border-t flex items-center gap-4" style={{ borderColor: "var(--border)" }}>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {note.charCount ? `${note.charCount.toLocaleString()} characters` : ""}
            </span>
            <span className="badge badge-success">✓ Summary ready</span>
          </div>
        )}
      </div>
    </div>
  );
}
