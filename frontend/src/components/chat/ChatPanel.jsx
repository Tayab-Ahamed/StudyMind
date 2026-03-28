import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { useChat } from "../../hooks/useChat";
import { ThinkingDots, EmptyState, Alert } from "../ui";

function ChatBubble({ msg, isLatest }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""} ${isLatest ? "animate-fade-up" : ""}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5
        ${isUser ? "bg-brand-500 text-white" : "text-white"}`}
        style={isUser ? {} : { background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
        {isUser ? "U" : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        )}
      </div>

      {/* Content */}
      <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed
        ${isUser
          ? "bg-brand-500 text-white rounded-tr-sm"
          : "rounded-tl-sm prose-content"}`}
        style={isUser ? {} : { background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
        {isUser ? <p>{msg.content}</p> : <ReactMarkdown>{msg.content}</ReactMarkdown>}
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  "What are the main topics covered?",
  "Give me a quick overview",
  "What are the key definitions?",
  "Create 5 quiz questions for me",
];

export default function ChatPanel({ selectedNote }) {
  const { sessionId, messages, thinking, error, startSession, send } = useChat();
  const [input,    setInput]    = useState("");
  const [started,  setStarted]  = useState(false);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const prevNoteId = useRef(null);

  useEffect(() => {
    if (!selectedNote) return;
    if (prevNoteId.current === selectedNote.id) return;
    prevNoteId.current = selectedNote.id;
    setStarted(false);
    startSession(selectedNote.id).then(() => setStarted(true));
  }, [selectedNote, startSession]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const handleSend = useCallback(async (text) => {
    const t = (text || input).trim();
    if (!t || thinking || !started) return;
    setInput("");
    await send(t);
    inputRef.current?.focus();
  }, [input, thinking, started, send]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  if (!selectedNote) {
    return <EmptyState icon="💬" title="Select a note" description="Choose a note to start a Q&A session" />;
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: "var(--border)" }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: "var(--text-muted)" }}>Chat</p>
          <h2 className="text-base font-bold truncate max-w-sm" style={{ color: "var(--text-primary)" }}>{selectedNote.name}</h2>
        </div>
        {messages.length > 0 && (
          <span className="badge badge-muted">{Math.floor(messages.length / 2)} exchanges</span>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {/* Empty + suggestions */}
        {messages.length === 0 && !thinking && started && (
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff7410" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Ask anything about your notes</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Claude will answer based on your document</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => handleSend(s)}
                  className="text-left text-xs px-3 py-2.5 rounded-xl font-medium transition-all duration-100 hover:scale-[1.02]"
                  style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading session */}
        {!started && selectedNote && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Starting session…</p>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <ChatBubble key={i} msg={msg} isLatest={i === messages.length - 1} />
        ))}

        {/* Thinking */}
        {thinking && (
          <div className="flex gap-3 animate-fade-up">
            <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
              style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm"
              style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
              <ThinkingDots />
            </div>
          </div>
        )}

        {error && <Alert message={error} type="error" />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t flex-shrink-0" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
        <div className="flex gap-2 items-end">
          <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey} placeholder="Ask a question about your notes…"
            rows={1} disabled={thinking || !started}
            className="input resize-none text-sm flex-1"
            style={{ minHeight: "42px", maxHeight: "120px", lineHeight: "1.5" }} />
          <button onClick={() => handleSend()} disabled={!input.trim() || thinking || !started}
            className="btn-brand px-4 py-2.5 flex-shrink-0 self-end">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <p className="text-[11px] mt-2 text-right" style={{ color: "var(--text-muted)" }}>
          Enter to send · Shift+Enter for newline
        </p>
      </div>
    </div>
  );
}
