import { createSlice } from "@reduxjs/toolkit";

// Caches raw transcript segments per videoId: { [videoId]: [{ text, offset, duration }] }.
// So each video's transcript is fetched from Supadata only ONCE per session and reused
// across Summarize / Notes / Ask / Transcript and when you revisit the same video.
const transcriptSlice = createSlice({
    name: "transcript",
    initialState: {},
    reducers: {
        cacheTranscript: (state, action) => {
            const { videoId, segments } = action.payload;
            state[videoId] = segments;
        },
    },
});

export const { cacheTranscript } = transcriptSlice.actions;
export default transcriptSlice.reducer;
