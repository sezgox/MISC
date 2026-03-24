# VIbing

VIbing is a local MVP music visualizer for monophonic live input. It captures audio from a browser-selected device, detects notes in real time, maps them into a scrolling trajectory, and records the canvas output to WebM.

## Run

1. Start the local server:

```bash
node server.mjs
```

2. Open the reported localhost URL in a modern Chromium-based browser.
3. Allow microphone access when prompted.
4. Choose the input tied to your audio interface and start the live engine.

## MVP scope

- Live audio input selection
- ASCII tab upload for guitar or bass animation
- Monophonic pitch detection
- Onset, velocity, and smoothed BPM estimation
- Canvas trajectory with nodes, moving ball, and impact FX
- Minimal control panel
- Real-time WebM recording

## Supported tab format

The upload flow expects classic ASCII tablature blocks with 4 or 6 strings, for example:

```text
e|----------------|
B|----------------|
G|------2-----4---|
D|--2-4---4-2-----|
A|----------------|
E|----------------|
```

or bass:

```text
G|----------------|
D|--------2-4-----|
A|--2-2-5-----5---|
E|----------------|
```

Each column is interpreted as a rhythmic subdivision and the `Tab BPM` control sets playback speed.

## Current limitations

- Optimized for a clean monophonic signal
- Export is real-time WebM only in the MVP
- Browser support depends on `MediaRecorder` and live audio permissions
