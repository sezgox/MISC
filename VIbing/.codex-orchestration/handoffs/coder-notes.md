# Coder Notes

## Implemented Changes
- Built a dependency-free local web MVP with `server.mjs`, `index.html`, `styles.css`, and modular `src/` runtime files.
- Implemented live audio capture, device enumeration, monophonic analysis, and event emission in `src/audio/audio-engine.js` and `src/audio/analyzer.js`.
- Implemented note timeline state in `src/state/timeline.js`.
- Implemented canvas renderer, impact FX, ball trail, and `Luminous Transit` visual treatment in `src/visual/renderer.js` and `src/visual/fx-engine.js`.
- Added minimal controls, telemetry cards, and real-time WebM recording with `src/ui/control-panel.js` and `src/export/export-recorder.js`.
- Added project documentation and favicon to eliminate startup console noise.

## Out-of-Scope Decisions
- Offline export and MP4 export were not attempted in the MVP.
- Note-color mapping was intentionally kept out of the default render behavior.
- No external DSP or rendering libraries were introduced; the MVP stays browser-native.

## Deviations From Planner
- Export is WebM-only in the implemented MVP instead of MP4/WebM because `MediaRecorder` support is the practical zero-dependency path.
- Verification used browser shell checks and syntax validation, but not a real instrument input playback harness.

## Open Risks
- Real-world pitch stability still depends on clean monophonic input and interface gain staging.
- Browser permission flows and codec support will vary across environments.
