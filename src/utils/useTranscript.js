import { useDispatch, useStore } from "react-redux";
import { cacheTranscript } from "./transcriptSlice";

const LS_KEY = (videoId) => `transcript:${videoId}`;

// Returns getSegments(videoId): resolves transcript segments from the Redux cache (fast,
// in-session), then localStorage (survives page refreshes / browser restarts), and only
// fetches from /api/transcript as a last resort — caching the result in both layers.
export function useTranscript() {
    const dispatch = useDispatch();
    const store = useStore();

    return async function getSegments(videoId) {
        // 1) Redux (in-memory, current session)
        const cached = store.getState().transcript[videoId];
        if (cached) return cached;

        // 2) localStorage (survives refreshes)
        try {
            const saved = localStorage.getItem(LS_KEY(videoId));
            if (saved) {
                const segments = JSON.parse(saved);
                dispatch(cacheTranscript({ videoId, segments }));
                return segments;
            }
        } catch (_) {
            // ignore corrupt/unavailable storage
        }

        // 3) fetch once, then cache in both layers
        const res = await fetch("/api/transcript", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ videoId }),
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || "Couldn't load the transcript for this video.");

        const segments = data.segments || [];
        dispatch(cacheTranscript({ videoId, segments }));
        try {
            localStorage.setItem(LS_KEY(videoId), JSON.stringify(segments));
        } catch (_) {
            // storage full / unavailable — Redux cache still works for this session
        }
        return segments;
    };
}
