import { useState, useCallback, useRef } from "react";
import { createSession, sendMessage, getChatHistory } from "../utils/api";

export function useChat() {
  const [sessionId, setSessionId] = useState(null);
  const [messages,  setMessages]  = useState([]);
  const [thinking,  setThinking]  = useState(false);
  const [error,     setError]     = useState(null);
  const activeNoteId = useRef(null);

  const startSession = useCallback(async (noteId) => {
    if (activeNoteId.current === noteId && sessionId) return sessionId;
    setError(null);
    try {
      const { data } = await createSession(noteId);
      setSessionId(data.sessionId);
      setMessages([]);
      activeNoteId.current = noteId;
      return data.sessionId;
    } catch { setError("Could not start chat session."); }
  }, [sessionId]);

  const loadSession = useCallback(async (sid, noteId) => {
    try {
      const { data } = await getChatHistory(sid);
      setSessionId(sid);
      setMessages(data.messages);
      activeNoteId.current = noteId;
    } catch { setError("Could not load chat history."); }
  }, []);

  const send = useCallback(async (text) => {
    if (!sessionId || !text.trim()) return;
    const userMsg = { role: "user", content: text.trim(), createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setThinking(true); setError(null);
    try {
      const { data } = await sendMessage(sessionId, text.trim());
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply, createdAt: data.timestamp }]);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to get a response.");
      setMessages((prev) => prev.slice(0, -1));
    } finally { setThinking(false); }
  }, [sessionId]);

  const reset = useCallback(() => {
    setSessionId(null); setMessages([]); activeNoteId.current = null;
  }, []);

  return { sessionId, messages, thinking, error, startSession, loadSession, send, reset };
}
