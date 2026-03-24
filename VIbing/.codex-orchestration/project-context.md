# Project Context

## Purpose
- What this product does:
  A local web application that captures live monophonic audio input, detects notes and dynamics in real time, and renders a minimalist music-graph visualizer with exportable video output.
- Primary user flows:
  1. Select an audio input device and start the live engine.
  2. Play an instrument through an audio interface and see notes appear as nodes in a scrolling trajectory.
  3. Watch the ball interpolate between notes and trigger reactive FX on impacts.
  4. Adjust essential visual controls and record the canvas output to a video file.

## Architecture
- Tech stack:
  Vanilla HTML, CSS, and JavaScript modules running in the browser; Node.js static server for local development; Web Audio API, Canvas 2D, MediaRecorder.
- Entry points:
  `index.html`, `src/app.js`, `server.mjs`
- Key directories:
  `src/` for runtime modules
  `src/audio/` for capture and analysis
  `src/visual/` for scene rendering and FX
  `src/ui/` for controls and formatting helpers

## Functional Map
- Feature:
  Live audio capture and device selection
  - Files:
    `src/audio/audio-engine.js`
  - Dependencies:
    `navigator.mediaDevices`, `AudioContext`
- Feature:
  Pitch, onset, velocity, and BPM estimation
  - Files:
    `src/audio/analyzer.js`
  - Dependencies:
    `AnalyserNode`, autocorrelation, onset interval smoothing
- Feature:
  Event timeline and note node state
  - Files:
    `src/state/timeline.js`
  - Dependencies:
    analysis events, scene configuration
- Feature:
  Trajectory, ball, and FX rendering
  - Files:
    `src/visual/renderer.js`, `src/visual/fx-engine.js`
  - Dependencies:
    Canvas 2D, timeline state
- Feature:
  Minimal control panel and export
  - Files:
    `src/ui/control-panel.js`, `src/export/export-recorder.js`
  - Dependencies:
    DOM APIs, `MediaRecorder`, canvas capture stream

## Run & Verify
- Install:
  No external dependencies for MVP. Requires Node.js only.
- Dev run:
  `node server.mjs`
- Build:
  Not required for MVP.
- Tests:
  Manual browser validation plus lightweight syntax checks where possible.

## Constraints
- Security/performance constraints:
  Keep latency low, assume monophonic input, avoid external services, and keep render/update loops allocation-light.
- Coding conventions:
  ES modules, ASCII source, cohesive files, no external dependencies unless required later.
- Environments and secrets policy:
  Local-only MVP, no secrets, no remote APIs.
