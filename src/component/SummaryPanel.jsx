import { useState } from "react";
import { useTranscript } from "../utils/useTranscript";

// Drop this on the watch page:  <SummaryPanel videoId={videoId} />
export default function SummaryPanel({ videoId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const getSegments = useTranscript();

  async function summarize() {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const segments = await getSegments(videoId);
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, segments }),
      });
      const json = await res.json();
      if (!res.ok || json.error) setError(json.error || "Failed to summarize this video.");
      else setData(json);
    } catch (e) {
      setError(e.message || "Couldn't reach the AI service.");
    }
    setLoading(false);
  }

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-red-600 text-white">✨</span>
          <div>
            <h3 className="font-semibold leading-tight text-gray-900">AI Video Companion</h3>
            <p className="text-xs text-gray-500">Summary · chapters · key points</p>
          </div>
        </div>
        <button
          onClick={summarize}
          disabled={loading || !videoId}
          className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Summarizing…" : data ? "↻ Regenerate" : "⚡ Summarize"}
        </button>
      </div>

      <div className="px-5 py-4">
        {/* Idle */}
        {!loading && !data && !error && (
          <p className="text-sm text-gray-500">
            Click <b>Summarize</b> to get an AI summary, chapters, and key takeaways for this video.
          </p>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-5/6 rounded bg-gray-200" />
            <div className="mt-4 flex gap-2">
              <div className="h-6 w-20 rounded-full bg-gray-200" />
              <div className="h-6 w-24 rounded-full bg-gray-200" />
              <div className="h-6 w-16 rounded-full bg-gray-200" />
            </div>
          </div>
        )}

        {/* Error / no transcript */}
        {error && !loading && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
            <p className="font-medium text-amber-800">Couldn't summarize this video</p>
            <p className="mt-1 text-amber-700">{error}</p>
            <p className="mt-1 text-xs text-amber-600">
              Tip: some videos have captions disabled — try one that has captions.
            </p>
          </div>
        )}

        {/* Results */}
        {data && !loading && (
          <div className="space-y-5">
            {/* Summary */}
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-red-600">TL;DR</span>
                <button
                  onClick={() => navigator.clipboard?.writeText(data.summary)}
                  className="text-xs text-gray-400 transition hover:text-gray-600"
                >
                  Copy
                </button>
              </div>
              <p className="text-sm leading-relaxed text-gray-800">{data.summary}</p>
            </div>

            {/* Chapters */}
            {data.chapters?.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-900">Chapters</h4>
                <div className="flex flex-wrap gap-2">
                  {data.chapters.map((c, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700"
                    >
                      <span className="font-mono font-medium text-red-600">{c.time}</span>
                      {c.title}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Key points */}
            {data.keyPoints?.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-semibold text-gray-900">Key points</h4>
                <ul className="space-y-1.5">
                  {data.keyPoints.map((k, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-800">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
