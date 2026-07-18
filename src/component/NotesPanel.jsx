import { useState } from "react";
import { useTranscript } from "../utils/useTranscript";

// Left column, under the Summary: <NotesPanel videoId={videoId} />
export default function NotesPanel({ videoId }) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const getSegments = useTranscript();

  async function generate() {
    setLoading(true);
    setError("");
    setNotes("");
    try {
      const segments = await getSegments(videoId);
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, segments }),
      });
      const json = await res.json();
      if (!res.ok || json.error) setError(json.error || "Couldn't generate notes for this video.");
      else setNotes(json.notes || "");
    } catch (e) {
      setError(e.message || "Couldn't reach the AI service.");
    }
    setLoading(false);
  }

  function download() {
    const blob = new Blob([notes], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "video-notes.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-red-600 text-white">📝</span>
          <div>
            <h3 className="font-semibold leading-tight text-gray-900">Study Notes</h3>
            <p className="text-xs text-gray-500">AI notes you can copy or download</p>
          </div>
        </div>
        <button
          onClick={generate}
          disabled={loading || !videoId}
          className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Generating…" : notes ? "↻ Regenerate" : "📝 Generate Notes"}
        </button>
      </div>

      <div className="px-5 py-4">
        {!loading && !notes && !error && (
          <p className="text-sm text-gray-500">
            Click <b>Generate Notes</b> to get structured, downloadable notes for this video.
          </p>
        )}

        {loading && (
          <div className="animate-pulse space-y-2">
            <div className="h-4 w-1/3 rounded bg-gray-200" />
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-5/6 rounded bg-gray-200" />
            <div className="h-4 w-2/3 rounded bg-gray-200" />
          </div>
        )}

        {error && !loading && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{error}</div>
        )}

        {notes && !loading && (
          <div>
            <div className="mb-2 flex gap-4">
              <button onClick={() => navigator.clipboard?.writeText(notes)} className="text-xs text-gray-500 transition hover:text-gray-700">
                Copy
              </button>
              <button onClick={download} className="text-xs font-medium text-red-600 transition hover:text-red-700">
                ⬇️ Download .md
              </button>
            </div>
            <div className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm leading-relaxed text-gray-800">
              {notes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
