# Planner Handoff

## Objective
Build an MVP local web app for live instrument visualization with these deliverables: input device selection, real-time monophonic note detection, scrolling note trajectory, animated ball with one modular impact effect, minimal controls, and real-time video export. Visual direction: `Luminous Transit`.

## System Map
- Entry point: `index.html` bootstraps the app shell, canvas, and control panel.
- Runtime coordinator: `src/app.js` wires audio, timeline, renderer, controls, and recorder.
- Audio capture risk area: `src/audio/audio-engine.js` manages microphone/device access and low-latency analyser setup.
- Analysis risk area: `src/audio/analyzer.js` performs pitch estimation, onset detection, velocity normalization, and smoothed BPM inference from live frames.
- State risk area: `src/state/timeline.js` stores note events and converts them into nodes/ball targets in a time-windowed scene.
- Visual risk area: `src/visual/renderer.js` draws path, nodes, ball, background, HUD, and reduced-motion-safe transitions.
- FX risk area: `src/visual/fx-engine.js` emits a minimal impact pulse/trail effect driven by note velocity.
- UI/export area: `src/ui/control-panel.js` manages controls and labels; `src/export/export-recorder.js` records canvas output with `MediaRecorder`.

## Change Plan
- File: `package.json`
  - Edit:
    Define local scripts for `start` and optional syntax check helpers.
  - Why:
    Provide a reproducible local run command without package installs.
- File: `server.mjs`
  - Edit:
    Add a minimal static server for local browser testing.
  - Why:
    Browser audio APIs require an HTTP origin in practice; the project needs a dev entrypoint.
- File: `index.html`
  - Edit:
    Create the shell with hero header, canvas stage, telemetry strip, and control panel.
  - Why:
    Establish the app UI and mount points for runtime modules.
- File: `styles.css`
  - Edit:
    Implement the `Luminous Transit` token system, responsive layout, dark surfaces, glow accents, and reduced-motion rules.
  - Why:
    Deliver a coherent, high-quality visual direction rather than a generic panel.
- File: `src/app.js`
  - Edit:
    Compose modules, start/stop lifecycle, event subscriptions, and animation loop.
  - Why:
    Keep orchestration centralized and explicit.
- File: `src/audio/audio-engine.js`
  - Edit:
    Implement device enumeration, stream acquisition, analyser configuration, and frame sampling.
  - Why:
    Real-time audio capture is a core MVP requirement.
- File: `src/audio/analyzer.js`
  - Edit:
    Implement autocorrelation pitch detection, onset detection, velocity extraction, note quantization, and BPM smoothing.
  - Why:
    Produce the event payload required by the visual system.
- File: `src/state/timeline.js`
  - Edit:
    Store note events, clamp history, and expose interpolated scene data.
  - Why:
    Decouple live analysis from rendering.
- File: `src/visual/fx-engine.js`
  - Edit:
    Add modular pulse/trail state triggered on note impacts.
  - Why:
    Cover the MVP FX requirement with a reusable structure.
- File: `src/visual/renderer.js`
  - Edit:
    Render grid, trajectory curve, note nodes, impact visuals, and moving ball.
  - Why:
    Realize the main visual concept on canvas efficiently.
- File: `src/ui/control-panel.js`
  - Edit:
    Bind device selector and essential controls for gain threshold, vertical spread, glow, and export state.
  - Why:
    Provide minimal but useful customization and runtime control.
- File: `src/export/export-recorder.js`
  - Edit:
    Implement start/stop recording and downloadable WebM export from the canvas stream.
  - Why:
    Deliver MVP export without introducing offline rendering complexity.
- File: `README.md`
  - Edit:
    Document run instructions, browser permissions, feature scope, and current MVP limitations.
  - Why:
    Make the project runnable and maintainable.

## Test Plan
- Command:
  `node --check server.mjs`
  - Expected:
    Static server script parses successfully.
- Command:
  `Get-ChildItem -Recurse src -Filter *.js | ForEach-Object { node --check $_.FullName }`
  - Expected:
    All runtime modules parse successfully.
- Command:
  `node server.mjs`
  - Expected:
    Local server starts and exposes the app on a localhost URL.
- Command:
  Browser manual test on desktop and mobile-sized viewport
  - Expected:
    Audio device selection works, live visualization updates, controls affect rendering, focus states are visible, and reduced-motion users do not get forced transitions.

## Acceptance Criteria
- [ ] User can choose an audio input device and start live capture from the browser.
- [ ] The app emits note events with timestamp, frequency, MIDI note, velocity, onset state, and smoothed BPM.
- [ ] The canvas shows a continuous trajectory with note nodes and a ball interpolating between them.
- [ ] At least one impact FX reacts visibly to note hits and scales with velocity.
- [ ] The UI allows essential customization without making note-color mapping the default behavior.
- [ ] The user can record the canvas output and download a video file.
- [ ] The layout and controls remain usable on desktop and narrow mobile viewports.

## Risks & Mitigations
- Pitch detection from live instrument input will be noisy for weak harmonics.
  Mitigation: apply RMS gating, stability thresholding, and hold the last confident note only briefly.
- Browser audio permissions and device labels may be unavailable before permission grant.
  Mitigation: refresh device list after stream acquisition and surface clear status text.
- Export support differs by browser codec support.
  Mitigation: prefer WebM for MVP and expose recorder capability state in the UI.
- Empty workspace means no automated E2E harness yet.
  Mitigation: keep the project dependency-free and validate core flows with local browser checks.

## Execution Order
1.
   Create project scaffold and local server.
2.
   Build audio capture and live analysis modules.
3.
   Build timeline, renderer, and FX modules.
4.
   Build control panel and recorder integration.
5.
   Run syntax checks and local browser validation.
6.
   Record coder notes and verifier report.

## Done Definition
The repository contains a runnable local MVP that starts from `node server.mjs`, exposes live audio input and note-reactive visuals in the browser, supports basic customization and WebM recording, and includes documentation plus orchestration handoff artifacts.
