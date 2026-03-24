function bindRange(id, callback, formatValue) {
  const element = document.getElementById(id);
  element.addEventListener("input", () => {
    callback(Number(element.value));
    if (typeof formatValue === "function") {
      element.setAttribute("aria-valuetext", formatValue(Number(element.value)));
    }
  });
  return element;
}

export function createControlPanel(options) {
  const state = {
    isLiveRunning: false,
    isVisualActive: false,
    isRecorderSupported: false
  };

  const elements = {
    deviceSelect: document.getElementById("deviceSelect"),
    startButton: document.getElementById("startButton"),
    refreshButton: document.getElementById("refreshButton"),
    recordButton: document.getElementById("recordButton"),
    downloadLink: document.getElementById("downloadLink"),
    exportLabel: document.getElementById("exportLabel"),
    inputLabel: document.getElementById("inputLabel"),
    pitchLabel: document.getElementById("pitchLabel"),
    velocityLabel: document.getElementById("velocityLabel"),
    bpmLabel: document.getElementById("bpmLabel"),
    statusLabel: document.getElementById("statusLabel"),
    tabFileInput: document.getElementById("tabFileInput"),
    tabBpmInput: document.getElementById("tabBpmInput"),
    playTabButton: document.getElementById("playTabButton"),
    stopTabButton: document.getElementById("stopTabButton"),
    tabSummary: document.getElementById("tabSummary")
  };

  bindRange("sensitivityInput", (value) => options.onConfigChange({ sensitivity: value }));
  bindRange("onsetInput", (value) => options.onConfigChange({ onsetImpulse: value }));
  bindRange("historyInput", (value) => options.onConfigChange({ historySeconds: value }));
  bindRange("spreadInput", (value) => options.onConfigChange({ spread: value }));
  bindRange("glowInput", (value) => options.onConfigChange({ glow: value }));
  bindRange("trailInput", (value) => options.onConfigChange({ trail: value }));
  bindRange("tabBpmInput", (value) => options.onTabBpmChange?.(value));

  elements.startButton.addEventListener("click", () => options.onToggleStart(elements.deviceSelect.value));
  elements.refreshButton.addEventListener("click", () => options.onRefreshDevices());
  elements.recordButton.addEventListener("click", () => options.onToggleRecord());
  elements.deviceSelect.addEventListener("change", () => options.onSelectDevice(elements.deviceSelect.value));
  elements.tabFileInput.addEventListener("change", () => options.onTabFileSelected?.(elements.tabFileInput.files?.[0] || null));
  elements.playTabButton.addEventListener("click", () => options.onPlayTab?.());
  elements.stopTabButton.addEventListener("click", () => options.onStopTab?.());

  return {
    setDevices(devices, selectedId) {
      elements.deviceSelect.innerHTML = "";

      if (devices.length === 0) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "No input devices";
        elements.deviceSelect.append(option);
        return;
      }

      devices.forEach((device, index) => {
        const option = document.createElement("option");
        option.value = device.deviceId;
        option.textContent = device.label || `Input ${index + 1}`;
        option.selected = device.deviceId === selectedId;
        elements.deviceSelect.append(option);
      });
    },

    setTransportState({ isLiveRunning = false, isVisualActive = false }) {
      state.isLiveRunning = isLiveRunning;
      state.isVisualActive = isVisualActive;
      elements.startButton.textContent = isLiveRunning ? "Stop Live Input" : "Start Live Input";
      elements.recordButton.disabled = !state.isVisualActive || !state.isRecorderSupported;
    },

    setRecorderState({ isRecording, isSupported, label, downloadUrl, filename }) {
      state.isRecorderSupported = isSupported;
      elements.recordButton.disabled = !state.isVisualActive || !isSupported;
      elements.recordButton.textContent = isRecording ? "Stop Recording" : "Record WebM";
      elements.exportLabel.textContent = label;

      if (downloadUrl) {
        elements.downloadLink.href = downloadUrl;
        elements.downloadLink.hidden = false;
        elements.downloadLink.download = filename || `vibing-${Date.now()}.webm`;
        elements.downloadLink.textContent = "Download video again";
      } else {
        elements.downloadLink.hidden = true;
        elements.downloadLink.removeAttribute("href");
      }
    },

    setTabState({ isLoaded, isPlaying, sourceName, noteCount, bpm, title }) {
      elements.playTabButton.disabled = !isLoaded || isPlaying;
      elements.stopTabButton.disabled = !isPlaying;
      elements.tabSummary.textContent = isLoaded
        ? `${title || sourceName || "Tab loaded"} | ${noteCount} notes | ${Math.round(bpm || 0)} BPM`
        : "Sube una tab ASCII de guitarra o bajo para animarla directamente.";
    },

    setTelemetry({ input, pitch, velocity, bpm, status }) {
      elements.inputLabel.textContent = input || "--";
      elements.pitchLabel.textContent = pitch || "--";
      elements.velocityLabel.textContent = velocity || "0%";
      elements.bpmLabel.textContent = bpm || "--";
      elements.statusLabel.textContent = status || "Idle";
    }
  };
}
