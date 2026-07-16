import { useState } from "react";

// Drop below the summary:  <AskPanel videoId={videoId} />
export default function AskPanel({ videoId }) {
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState([]); // [{ q, a, err }]
  const [loading, setLoading] = useState(false);

  async function ask(e) {
    e.preventDefault();
    const q = question.trim();
    if (!q || loading) return;
    setLoading(true);
    setQuestion("");
    setChat((c) => [...c, { q, a: null }]); // add question with pending answer

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, question: q }),
      });
      const json = await res.json();
      const ok = res.ok && !json.error;
      setChat((c) =>
        c.map((m, i) =>
          i === c.length - 1 ? { ...m, a: ok ? json.answer : null, err: ok ? null : json.error || "error" } : m
        )
      );
    } catch {
      setChat((c) =>
        c.map((m, i) => (i === c.length - 1 ? { ...m, a: null, err: "network" } : m))
      );
    }
    setLoading(false);
  }

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-red-600 text-white">💬</span>
        <div>
          <h3 className="font-semibold leading-tight text-gray-900">Ask this video</h3>
          <p className="text-xs text-gray-500">Answers are grounded in the video&apos;s transcript</p>
        </div>
      </div>

      <div className="px-5 py-4">
        {/* Conversation */}
        {chat.length > 0 && (
          <div className="mb-4 space-y-4">
            {chat.map((m, i) => (
              <div key={i} className="space-y-2">
                {/* user bubble */}
                <div className="flex justify-end">
                  <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-red-600 px-3 py-2 text-sm text-white">
                    {m.q}
                  </p>
                </div>
                {/* ai bubble */}
                <div className="flex justify-start">
                  {m.a == null && !m.err ? (
                    <p className="rounded-2xl rounded-bl-sm bg-gray-100 px-3 py-2 text-sm text-gray-400">Thinking…</p>
                  ) : m.err ? (
                    <p className="rounded-2xl rounded-bl-sm bg-amber-50 px-3 py-2 text-sm text-amber-700">
                      Couldn&apos;t answer that — the video may not have a transcript.
                    </p>
                  ) : (
                    <p className="max-w-[85%] rounded-2xl rounded-bl-sm bg-gray-100 px-3 py-2 text-sm text-gray-800">
                      {m.a}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={ask} className="flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask something about this video…"
            className="min-w-0 flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-red-500"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="shrink-0 rounded-full bg-red-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "…" : "Ask"}
          </button>
        </form>
      </div>
    </div>
  );
}
