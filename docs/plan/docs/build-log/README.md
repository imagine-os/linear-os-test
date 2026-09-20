# Build log

A day-by-day record of the autopilot build loop: state of the Linear PAP board at each milestone, what was launched, and what came back. This is a log, not a spec — the specs live in `../../specs/`, the operating rules for a single builder session live in `builder-brief-v1.md` (also the brief a builder session is handed directly), and the decisions behind the operating mode live in `../decisions/`.

| Date | File | What happened |
|---|---|---|
| 2026-09-19 | [`2026-09-19.md`](2026-09-19.md) | Kickoff: Justin's autopilot go, repo mapping decided, wave 0 launched (16 issues); PAP-13 landed and wave 1 launched (01:40); wave 0 reviewed, wave 2 running (02:15); wave 1 reviewed, decision 0003 (02:40); credits out 03:19; stopping point 19:18-20:00; consolidation into `imagine-os/linear-os-test` 19:57-20:40 (decision 0005), estimate versus actual in [`estimate-vs-actual-2026-09-19.md`](estimate-vs-actual-2026-09-19.md) |
| 2026-09-20 | [`2026-09-19.md`](2026-09-19.md) (section `2026-09-20 21:10-21:35 UTC`) | Web demo placeholder screen: Justin reported `/app/` showed nothing; the placeholder route drew only a heading and a SHA; landing screen with links, not-wired shell controls in an actions registry and EN/ES toggle landed in `f523061`, Pages redeployed and verified live at 390 and 1920 px |

`builder-brief-v1.md` is the operating brief handed verbatim to every builder session in this build loop; it is versioned (`v1` in the filename and in its own title) so a later revision can be added as `builder-brief-v2.md` without losing the history of what earlier sessions were told to do.
