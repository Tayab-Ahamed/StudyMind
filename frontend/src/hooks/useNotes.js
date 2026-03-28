import { useState, useEffect, useCallback } from "react";
import { getNotes, uploadNote, deleteNote, summarizeNote } from "../utils/api";

export function useNotes() {
  const [notes,          setNotes]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [uploading,      setUploading]      = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error,          setError]          = useState(null);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await getNotes();
      setNotes(data);
    } catch { setError("Failed to load notes."); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const upload = async (file) => {
    setUploading(true); setUploadProgress(0); setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await uploadNote(form, setUploadProgress);
      await fetchNotes();
      return data;
    } catch (e) {
      const msg = e.response?.data?.error || "Upload failed.";
      setError(msg); throw new Error(msg);
    } finally { setUploading(false); setUploadProgress(0); }
  };

  const remove = async (id) => {
    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch { setError("Failed to delete note."); }
  };

  const summarize = async (id) => {
    try {
      const { data } = await summarizeNote(id);
      setNotes((prev) => prev.map((n) => n.id === id ? { ...n, hasSummary: true } : n));
      return data.summary;
    } catch (e) { throw new Error(e.response?.data?.error || "Summarization failed."); }
  };

  return { notes, loading, uploading, uploadProgress, error, setError, upload, remove, summarize, refetch: fetchNotes };
}
