const DEFAULT_OPTIONS = {
  bpm: 110,
  stepsPerBeat: 4
};

export function createTabPlayer(options = {}) {
  const callbacks = {
    onEvent: typeof options.onEvent === "function" ? options.onEvent : null,
    onStateChange: typeof options.onStateChange === "function" ? options.onStateChange : null
  };

  const state = {
    parsedTab: null,
    isPlaying: false,
    bpm: DEFAULT_OPTIONS.bpm,
    stepsPerBeat: DEFAULT_OPTIONS.stepsPerBeat,
    startedAt: 0,
    nextIndex: 0,
    sourceName: ""
  };

  function notify() {
    callbacks.onStateChange?.(getState());
  }

  function load(parsedTab, sourceName = "") {
    state.parsedTab = parsedTab;
    state.sourceName = sourceName || parsedTab?.title || "";
    state.nextIndex = 0;
    state.isPlaying = false;
    state.startedAt = 0;
    notify();
    return getState();
  }

  function play(settings = {}) {
    if (!state.parsedTab?.events?.length) {
      throw new Error("No hay una tab cargada para reproducir.");
    }

    state.bpm = Number(settings.bpm) || state.bpm || DEFAULT_OPTIONS.bpm;
    state.stepsPerBeat = Number(settings.stepsPerBeat) || DEFAULT_OPTIONS.stepsPerBeat;
    state.startedAt = performance.now();
    state.nextIndex = 0;
    state.isPlaying = true;
    notify();
    return getState();
  }

  function stop() {
    state.isPlaying = false;
    state.startedAt = 0;
    state.nextIndex = 0;
    notify();
    return getState();
  }

  function update(now = performance.now()) {
    if (!state.isPlaying || !state.parsedTab) {
      return;
    }

    const dueTime = now - state.startedAt;
    const msPerStep = 60000 / (state.bpm * state.stepsPerBeat);
    const events = state.parsedTab.events;

    while (state.nextIndex < events.length) {
      const nextEvent = events[state.nextIndex];
      const eventTime = nextEvent.stepIndex * msPerStep;
      if (eventTime > dueTime) {
        break;
      }

      callbacks.onEvent?.({
        ...nextEvent,
        bpm: state.bpm,
        source: "tab",
        timestamp: state.startedAt + eventTime
      });
      state.nextIndex += 1;
    }

    if (state.nextIndex >= events.length) {
      stop();
    }
  }

  function getState() {
    return {
      bpm: state.bpm,
      isLoaded: Boolean(state.parsedTab),
      isPlaying: state.isPlaying,
      noteCount: state.parsedTab?.events?.length || 0,
      sourceName: state.sourceName,
      title: state.parsedTab?.title || "",
      totalSteps: state.parsedTab?.totalSteps || 0
    };
  }

  return {
    load,
    play,
    stop,
    update,
    getState
  };
}
