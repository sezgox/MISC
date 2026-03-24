import { createAudioEngine } from "./audio/audio-engine.js";
import { createExportRecorder } from "./export/export-recorder.js";
import { EventTimeline } from "./state/timeline.js";
import { parseTabText } from "./tabs/tab-parser.js";
import { createTabPlayer } from "./tabs/tab-player.js";
import { createControlPanel } from "./ui/control-panel.js";
import { createFxEngine } from "./visual/fx-engine.js";
import { createRenderer } from "./visual/renderer.js";

const canvas = document.getElementById("visualizer");
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const config = {
  sensitivity: 0.38,
  onsetImpulse: 0.08,
  historySeconds: 12,
  spread: 0.8,
  glow: 0.95,
  trail: 0.55,
  reducedMotion: motionQuery.matches
};

const state = {
  selectedDeviceId: "",
  isRunning: false,
  isTabPlaying: false,
  status: "Idle",
  latestEvent: null,
  tabBpm: 110,
  inputLevel: 0,
  inputLabel: "--"
};

const timeline = new EventTimeline({ historySeconds: config.historySeconds });
const fxEngine = createFxEngine();
const tabPlayer = createTabPlayer({
  onEvent(event) {
    processMusicEvent(event);
  },
  onStateChange(nextState) {
    state.isTabPlaying = nextState.isPlaying;
    if (!nextState.isPlaying && !state.isRunning && state.status === "Playing tabs") {
      state.status = "Idle";
    }
    syncTransportState();
    panel?.setTabState(nextState);
    refreshTelemetry();
  }
});

let panel = null;

const recorder = createExportRecorder(canvas, {
  onStateChange(nextState) {
    panel?.setRecorderState(nextState);
  }
});

const renderer = createRenderer({
  canvas,
  fxEngine,
  getScene() {
    return timeline.getScene(performance.now(), {
      width: canvas.width,
      height: canvas.height,
      ...config
    });
  },
  getTelemetry() {
    return {
      latestEvent: state.latestEvent,
      status: state.status,
      bpm: state.latestEvent?.bpm || 0,
      reducedMotion: config.reducedMotion
    };
  },
  getConfig() {
    return {
      glowIntensity: config.glow,
      motionScale: config.reducedMotion ? 0.3 : 1,
      palette: {
        accentSoft: `rgba(109, 234, 219, ${0.18 + config.glow * 0.18})`,
        ballGlow: `rgba(109, 234, 219, ${0.32 + config.glow * 0.24})`,
        curveSoft: `rgba(109, 234, 219, ${0.12 + config.glow * 0.12})`
      },
      reducedMotion: config.reducedMotion,
      trailLength: Math.round(16 + config.trail * 34),
      verticalSpread: config.spread
    };
  }
});

const audioEngine = createAudioEngine({
  onStatus(nextStatus) {
    state.status = nextStatus.running ? "Listening" : "Idle";
    if (nextStatus.running) {
      state.inputLabel = state.inputLabel === "Tab mode" ? "No signal" : state.inputLabel;
    } else if (!state.isTabPlaying) {
      state.inputLevel = 0;
      state.inputLabel = "--";
    }
    syncTransportState();
    refreshTelemetry();
  },
  onFrame(frame) {
    state.inputLevel = clamp(frame?.velocity || 0, 0, 1);
    state.inputLabel = state.inputLevel >= 0.04 ? `Live ${Math.round(state.inputLevel * 100)}%` : "No signal";
    refreshTelemetry({
      input: state.inputLabel,
      velocity: `${Math.round(state.inputLevel * 100)}%`
    });
  },
  onEvent(type, event) {
    if (type === "error") {
      state.status = event?.message || "Audio error";
      refreshTelemetry();
      return;
    }

    if (type !== "onset") {
      return;
    }

    processMusicEvent(event);
  }
});

panel = createControlPanel({
  onToggleStart: async (deviceId) => {
    if (state.isRunning) {
      if (recorder.getState().isRecording) {
        panel.setRecorderState(recorder.toggle());
      }
      audioEngine.stop();
      state.isRunning = false;
      state.status = "Idle";
      state.inputLevel = 0;
      state.inputLabel = "--";
      syncTransportState();
      refreshTelemetry();
      return;
    }

    try {
      if (state.isTabPlaying) {
        tabPlayer.stop();
      }
      state.status = "Authorizing audio";
      refreshTelemetry();
      await audioEngine.start(deviceId || state.selectedDeviceId || "", getAudioConfig());
      state.isRunning = true;
      state.selectedDeviceId = audioEngine.getState().deviceId || deviceId || "";
      state.inputLabel = "No signal";
      syncTransportState();
      await refreshDevices();
      refreshTelemetry();
    } catch (error) {
      state.status = error?.message || "Failed to start audio";
      state.isRunning = false;
      state.inputLevel = 0;
      state.inputLabel = "--";
      syncTransportState();
      refreshTelemetry();
    }
  },

  onRefreshDevices: async () => {
    await refreshDevices();
  },

  onSelectDevice: async (deviceId) => {
    state.selectedDeviceId = deviceId;
    if (state.isRunning) {
      await audioEngine.setDevice(deviceId);
    }
  },

  onConfigChange: (partial) => {
    Object.assign(config, partial);

    if (partial.historySeconds) {
      timeline.setHistorySeconds(partial.historySeconds);
    }

    audioEngine.updateConfig(getAudioConfig());
    renderer.fx.setOptions?.({
      reducedMotion: config.reducedMotion,
      trailLength: Math.round(16 + config.trail * 34)
    });
  },

  onToggleRecord: () => {
    panel.setRecorderState(recorder.toggle());
  },

  onTabBpmChange: (value) => {
    state.tabBpm = value;
    panel.setTabState({
      ...tabPlayer.getState(),
      bpm: value
    });
  },

  onTabFileSelected: async (file) => {
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsedTab = parseTabText(text, { title: file.name.replace(/\.[^.]+$/, "") });
      timeline.clear();
      state.latestEvent = null;
      state.inputLevel = 0;
      state.inputLabel = "Tab mode";
      tabPlayer.load(parsedTab, file.name);
      panel.setTabState({
        ...tabPlayer.getState(),
        bpm: state.tabBpm
      });
      state.status = "Tab loaded";
      refreshTelemetry({ status: state.status });
    } catch (error) {
      state.status = error?.message || "Tab parse error";
      panel.setTabState(tabPlayer.getState());
      refreshTelemetry({ status: state.status });
    }
  },

  onPlayTab: async () => {
    try {
      if (state.isRunning) {
        await audioEngine.stop();
        state.isRunning = false;
      }

      timeline.clear();
      state.latestEvent = null;
      state.inputLevel = 0;
      state.inputLabel = "Tab mode";
      tabPlayer.play({ bpm: state.tabBpm });
      state.status = "Playing tabs";
      syncTransportState();
      refreshTelemetry({ pitch: "--", velocity: "0%", bpm: `${Math.round(state.tabBpm)}`, status: state.status });
    } catch (error) {
      state.status = error?.message || "No se pudo reproducir la tab";
      refreshTelemetry({ status: state.status });
    }
  },

  onStopTab: () => {
    tabPlayer.stop();
    state.status = state.isRunning ? "Listening" : "Idle";
    state.inputLevel = state.isRunning ? state.inputLevel : 0;
    state.inputLabel = state.isRunning ? state.inputLabel : "--";
    syncTransportState();
    refreshTelemetry({ status: state.status });
  }
});

syncTransportState();
panel.setRecorderState(recorder.getState());
panel.setTabState({ ...tabPlayer.getState(), bpm: state.tabBpm });
refreshTelemetry();

window.addEventListener("resize", () => renderer.resize());
motionQuery.addEventListener("change", (event) => {
  config.reducedMotion = event.matches;
});
renderer.resize();
requestAnimationFrame(tick);
refreshDevices();

async function refreshDevices() {
  const devices = await audioEngine.listInputDevices();
  const preferredId = state.selectedDeviceId || devices[0]?.deviceId || "";
  state.selectedDeviceId = preferredId;
  panel.setDevices(devices, preferredId);
}

function refreshTelemetry(partial = {}) {
  const event = state.latestEvent;
  panel?.setTelemetry({
    input: partial.input || state.inputLabel,
    pitch: partial.pitch || (event ? midiToNoteName(event.midiNote) : "--"),
    velocity: partial.velocity || (event ? `${Math.round(event.velocity * 100)}%` : "0%"),
    bpm: partial.bpm || (event && Number.isFinite(event.bpm) ? `${Math.round(event.bpm)}` : "--"),
    status: partial.status || state.status
  });
}

function getAudioConfig() {
  const sensitivity = config.sensitivity;
  const onsetImpulse = config.onsetImpulse;

  return {
    pitchConfidenceThreshold: clamp(0.22 + (1 - sensitivity) * 0.4, 0.18, 0.82),
    velocityNoiseFloor: clamp(0.006 + (1 - sensitivity) * 0.03, 0.004, 0.04),
    onsetLevelThreshold: clamp(0.038 + onsetImpulse * 0.5, 0.03, 0.18),
    onsetDeltaThreshold: clamp(onsetImpulse, 0.01, 0.3)
  };
}

function tick(now) {
  tabPlayer.update(now);
  renderer.render(now);
  requestAnimationFrame(tick);
}

function processMusicEvent(event) {
  state.latestEvent = event;
  const inserted = timeline.push(event);

  if (inserted) {
    const latestScene = timeline.getScene(event.timestamp, {
      width: canvas.width,
      height: canvas.height,
      ...config
    });
    renderer.triggerImpact(event, latestScene.nodes[latestScene.nodes.length - 1] || null);
  }

  refreshTelemetry({
    input: event.source === "tab" ? "Tab mode" : state.inputLabel,
    pitch: midiToNoteName(event.midiNote),
    velocity: `${Math.round(event.velocity * 100)}%`,
    bpm: Number.isFinite(event.bpm) ? `${Math.round(event.bpm)}` : "--"
  });
}

function syncTransportState() {
  panel?.setTransportState({
    isLiveRunning: state.isRunning,
    isVisualActive: state.isRunning || state.isTabPlaying
  });
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function midiToNoteName(midiNote) {
  if (!Number.isFinite(midiNote)) {
    return "--";
  }

  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const rounded = Math.round(midiNote);
  const octave = Math.floor(rounded / 12) - 1;
  return `${noteNames[((rounded % 12) + 12) % 12]}${octave}`;
}
