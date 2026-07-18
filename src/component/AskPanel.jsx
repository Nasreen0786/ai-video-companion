import { useState, useRef, useEffect } from "react";

const SUGGESTIONS = [
  {
    label: "Step-by-step tutorial",
    prompt:
      "Give me a complete step-by-step tutorial of this video based on the transcript. Use numbered steps and include timestamps where possible.",
  },
  {
    label: "Key takeaways",
    prompt: "What are the key takeaways from this video? Answer as a concise bulleted list, based on the transcript.",
  },
  {
    label: "Explain simply",
    prompt: "Explain what this video covers in simple, easy-to-understand terms, based on the transcript.",
  },
];

// Right sidebar under Live Chat: <AskPanel videoId={videoId} />
export default function AskPanel({ videoId }) {
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState([]); // [{ q, a, err }]
  const [loading, setLoading] = useState(false);

  const [transcript, setTranscript] = useState(null); // [{ start, end, text }]
  const [tLoading, setTLoading] = useState(false);
  const [tErr, setTErr] = useState("");

  // auto-scroll the chat to the newest message
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  async function send(text) {
    const q = (text || "").trim();
    if (!q || loading) return;
    setLoading(true);
    setQuestion("");
    setChat((c) => [...c, { q, a: null }]);
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
      setChat((c) => c.map((m, i) => (i === c.length - 1 ? { ...m, a: null, err: "network" } : m)));
    }
    setLoading(false);
  }

  async function showTranscript() {
    if (tLoading) return;
    setTLoading(true);
    setTErr("");
    try {
      const res = await fetch("/api/transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });
      const json = await res.json();
      if (!res.ok || json.error) setTErr(json.error || "Couldn't load transcript.");
      else setTranscript(json.lines || []);
    } catch {
      setTErr("Couldn't load the transcript for this video.");
    }
    setTLoading(false);
  }

  function onSubmit(e) {
    e.preventDefault();
    send(question);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-red-600 text-white">💬</span>
        <div>
          <h3 className="font-semibold leading-tight text-gray-900">Ask this video</h3>
          <p className="text-xs text-gray-500">Answers are grounded in the video&apos;s transcript</p>
        </div>
      </div>

      <div className="px-5 py-4">
        {/* Transcript view */}
        {transcript && (
          <div className="mb-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
              <span className="text-sm font-semibold text-gray-900">Transcript</span>
              <button onClick={() => setTranscript(null)} className="text-xs text-gray-400 transition hover:text-gray-600">
                ✕ Close
              </button>
            </div>
            <div className="max-h-80 space-y-1.5 overflow-auto px-3 py-2">
              {transcript.length === 0 ? (
                <p className="text-sm text-gray-500">No transcript lines found for this video.</p>
              ) : (
                transcript.map((l, i) => (
                  <p key={i} className="text-sm leading-relaxed text-gray-800">
                    <span className="mr-2 font-mono text-xs text-red-600">
                      {l.start}–{l.end}
                    </span>
                    {l.text}
                  </p>
                ))
              )}
            </div>
          </div>
        )}
        {tErr && <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">{tErr}</p>}

        {/* Conversation (fixed height, scrolls) */}
        {chat.length > 0 && (
          <div className="mb-4 max-h-96 space-y-4 overflow-y-auto pr-1">
            {chat.map((m, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-end">
                  <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-red-600 px-3 py-2 text-sm text-white">{m.q}</p>
                </div>
                <div className="flex justify-start">
                  {m.a == null && !m.err ? (
                    <p className="rounded-2xl rounded-bl-sm bg-gray-100 px-3 py-2 text-sm text-gray-400">Thinking…</p>
                  ) : m.err ? (
                    <p className="rounded-2xl rounded-bl-sm bg-amber-50 px-3 py-2 text-sm text-amber-700">
                      Couldn&apos;t answer that — the video may not have a transcript.
                    </p>
                  ) : (
                    <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-gray-100 px-3 py-2 text-sm text-gray-800">
                      {m.a}
                    </p>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Suggestion chips — before AND after answers (hidden while transcript panel is open) */}
        {!transcript && (
          <div className="mb-4">
            <p className="mb-2 text-xs text-gray-500">
              {chat.length === 0 ? "Not sure what to ask? Try:" : "Ask a follow-up:"}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={showTranscript}
                disabled={tLoading}
                className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700 transition hover:border-red-300 hover:text-red-600 disabled:opacity-50"
              >
                {tLoading ? "Loading…" : "📄 Transcript"}
              </button>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => send(s.prompt)}
                  disabled={loading}
                  className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-700 transition hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={onSubmit} className="flex gap-2">
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
