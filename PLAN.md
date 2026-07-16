# AI YouTube Companion — Hackathon Plan

**Event:** OpenAI × NamasteDev Codex Hackathon · **Deadline:** July 19, 11:59 PM IST
**Team:** Ankit + Nasreen · **Base:** namaste-youtube (CRA) + Vercel serverless

## Product
YouTube clone + an AI panel on the watch page: **Summarize** (summary + chapters + key points) and **Ask** (chat with the video), grounded in the video's transcript.

## Setup — Day 1
- [ ] `npm i openai youtube-transcript` and `npm i -g vercel`
- [ ] `.env` at root: `OPENAI_API_KEY=` (blank for now → mock; fill later → real AI). `.env` is gitignored.
- [ ] `api/summarize.mjs` — mock-first; real AI auto-on when key added
- [ ] `src/component/SummaryPanel.jsx`
- [ ] Render `<SummaryPanel videoId={videoId} />` in `Watch.jsx` (next to the player)
- [ ] Run `vercel dev` (⚠️ `npm start` does NOT run `/api`)
- [ ] Click **Summarize** → see MOCK summary = full flow works
- [ ] Push **PUBLIC** GitHub repo, add collaborator, deploy on Vercel (+ `OPENAI_API_KEY` env var)

## Tracks (own different files → no git conflicts)
- **A — Backend/AI:** `api/summarize.mjs`, `api/ask.mjs`, prompts, env, deploy
- **B — Frontend/UI:** `SummaryPanel.jsx`, styling, loading/empty states
- **Together:** wire into `Watch.jsx`, testing, README, demo video, slides

## Day-by-day
- [ ] **Day 1 (tonight):** setup + deploy skeleton + mock working end-to-end
- [ ] **Day 2:** wire into the real watch page, render nicely
- [ ] **Day 3:** add `api/ask` (chat) + polish + edge cases (no captions, English, long video). **FREEZE features.**
- [ ] **Day 4:** README + 3-min demo video + 5–7 slides + final deploy
- [ ] **Day 5 (19th):** buffer + test on live URL + **SUBMIT EARLY (afternoon)**

## Required deliverables (all links must be PUBLIC)
- [ ] Public GitHub repo
- [ ] Hosted prototype (Vercel URL)
- [ ] README (problem, how it works, tech, run steps)
- [ ] ≤3-min demo video
- [ ] (good-to-have) 5–7 slide deck

## Turning on real AI (later)
Add OpenAI $5 credit → put the key in **Vercel env vars** (deployed) and local `.env` (dev). No code change — mock swaps to real automatically. Only ONE of you needs the key.

## Git rules (2 people, 1 repo)
`git pull` before starting AND before pushing · commit small + often · push frequently · own different files.

## Risk / fallback
Transcript fetch is **proven working from a datacenter IP**. If YouTube blocks it later → hosted transcript API (Supadata / youtube-transcript.io free tier) or a "paste transcript" box. No captions on a video → show a friendly message; use captioned videos for the demo.
