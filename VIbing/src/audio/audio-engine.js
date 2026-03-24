import {
  AudioAnalyzer,
  DEFAULT_ANALYZER_OPTIONS,
  createAudioAnalyzer,
} from './analyzer.js';

const DEFAULT_ENGINE_CONFIG = {
  fftSize: 2048,
  analyzerOptions: {},
  audioConstraints: null,
  deviceId: null,
};

const ANALYZER_OPTION_KEYS = new Set(Object.keys(DEFAULT_ANALYZER_OPTIONS));

function createCustomEvent(type, detail) {
  return new CustomEvent(type, { detail });
}

function cloneDevice(device, index) {
  return {
    deviceId: device.deviceId,
    groupId: device.groupId,
    kind: device.kind,
    label: device.label || `Microphone ${index + 1}`,
  };
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeFftSize(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_ENGINE_CONFIG.fftSize;
  }

  const normalized = 2 ** Math.round(Math.log2(Math.max(32, parsed)));
  return Math.min(32768, Math.max(32, normalized));
}

function buildAnalyzerPatch(partial = {}) {
  const patch = {};

  for (const [key, value] of Object.entries(partial)) {
    if (ANALYZER_OPTION_KEYS.has(key)) {
      patch[key] = value;
    }
  }

  if (isPlainObject(partial.analyzerOptions)) {
    Object.assign(patch, partial.analyzerOptions);
  }

  return patch;
}

export class AudioEngine extends EventTarget {
  constructor(options = {}) {
    super();

    this.config = {
      ...DEFAULT_ENGINE_CONFIG,
      ...options,
      analyzerOptions: {
        ...DEFAULT_ENGINE_CONFIG.analyzerOptions,
        ...(options.analyzerOptions || {}),
      },
    };

    this.analyzer = options.analyzer ?? createAudioAnalyzer(this.config.analyzerOptions);
    this.callbacks = {
      onEvent: typeof options.onEvent === 'function' ? options.onEvent : null,
      onFrame: typeof options.onFrame === 'function' ? options.onFrame : null,
      onStatus: typeof options.onStatus === 'function' ? options.onStatus : null,
    };

    this.audioContext = null;
    this.mediaStream = null;
    this.mediaStreamSource = null;
    this.analyserNode = null;
    this.monitorGainNode = null;
    this._buffer = null;
    this._rafId = 0;
    this._running = false;
    this._deviceId = this.config.deviceId ?? null;
    this._sampleRate = 0;
    this._lastFrame = null;
    this._handleTrackEnded = () => {
      if (this._running) {
        this.stop().catch(() => {
          // Ignore teardown errors triggered by the browser stopping the track.
        });
      }
    };

    Object.assign(this.analyzer.options, this.config.analyzerOptions);
  }

  get isRunning() {
    return this._running;
  }

  get currentDeviceId() {
    return this._deviceId;
  }

  get sampleRate() {
    return this._sampleRate;
  }

  get lastFrame() {
    return this._lastFrame;
  }

  async listInputDevices() {
    this._assertMediaSupport();

    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter((device) => device.kind === 'audioinput')
      .map((device, index) => cloneDevice(device, index));
  }

  async start(deviceId, config = {}) {
    if (isPlainObject(deviceId) && arguments.length === 1) {
      config = deviceId;
      deviceId = config.deviceId ?? this._deviceId;
    }

    if (this._running) {
      await this.stop();
    }

    this._assertMediaSupport();
    this.updateConfig(config);

    if (deviceId !== undefined) {
      this._deviceId = deviceId ?? null;
      this.config.deviceId = this._deviceId;
    }

    let stream;
    let audioContext;

    try {
      stream = await navigator.mediaDevices.getUserMedia(this._buildAudioConstraints(this._deviceId));
      audioContext = new AudioContext({ latencyHint: 'interactive' });
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
    } catch (error) {
      this._emit('error', error);
      throw error;
    }

    try {
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      const monitorGain = audioContext.createGain();

      analyser.fftSize = this.config.fftSize;
      analyser.smoothingTimeConstant = 0;
      analyser.minDecibels = -100;
      analyser.maxDecibels = -10;
      monitorGain.gain.value = 0;

      source.connect(analyser);
      analyser.connect(monitorGain);
      monitorGain.connect(audioContext.destination);

      this.audioContext = audioContext;
      this.mediaStream = stream;
      this.mediaStreamSource = source;
      this.analyserNode = analyser;
      this.monitorGainNode = monitorGain;
      this._buffer = new Float32Array(analyser.fftSize);
      this._running = true;
      this._sampleRate = audioContext.sampleRate;
      this._lastFrame = null;
      this.analyzer.reset();
      Object.assign(this.analyzer.options, this.config.analyzerOptions);

      const track = stream.getAudioTracks()[0];
      if (track) {
        track.addEventListener('ended', this._handleTrackEnded, { once: true });
      }

      this._emit('status', this.getState());
      this._rafId = requestAnimationFrame((timestamp) => this._tick(timestamp));
      return this.getState();
    } catch (error) {
      stream?.getTracks().forEach((track) => track.stop());
      if (audioContext) {
        try {
          await audioContext.close();
        } catch {
          // Ignore teardown errors while unwinding a failed start.
        }
      }

      this._emit('error', error);
      throw error;
    }
  }

  async stop() {
    this._running = false;

    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = 0;
    }

    if (this.mediaStream) {
      for (const track of this.mediaStream.getTracks()) {
        track.stop();
      }
      this.mediaStream = null;
    }

    if (this.mediaStreamSource) {
      this.mediaStreamSource.disconnect();
      this.mediaStreamSource = null;
    }

    if (this.analyserNode) {
      this.analyserNode.disconnect();
      this.analyserNode = null;
    }

    if (this.monitorGainNode) {
      this.monitorGainNode.disconnect();
      this.monitorGainNode = null;
    }

    if (this.audioContext) {
      try {
        await this.audioContext.close();
      } catch {
        // Ignore teardown failures so stop() remains idempotent.
      }
      this.audioContext = null;
    }

    this._buffer = null;
    this._sampleRate = 0;
    this._lastFrame = null;
    this.analyzer.reset();
    this._emit('status', this.getState());
  }

  async setDevice(deviceId) {
    if (deviceId === this._deviceId && this._running) {
      return this.getState();
    }

    this.config.deviceId = deviceId ?? null;

    if (this._running) {
      await this.stop();
      return this.start(this.config.deviceId);
    }

    this._deviceId = this.config.deviceId;
    return this.getState();
  }

  async updateConfig(partial = {}) {
    this.config = {
      ...this.config,
      ...partial,
      analyzerOptions: {
        ...this.config.analyzerOptions,
        ...(isPlainObject(partial.analyzerOptions) ? partial.analyzerOptions : {}),
      },
    };

    if (typeof partial.fftSize !== 'undefined') {
      this.config.fftSize = normalizeFftSize(partial.fftSize);
    }

    const analyzerPatch = buildAnalyzerPatch(partial);
    if (Object.keys(analyzerPatch).length > 0) {
      Object.assign(this.analyzer.options, analyzerPatch);
    }

    if (typeof partial.onEvent === 'function') {
      this.callbacks.onEvent = partial.onEvent;
    }

    if (typeof partial.onFrame === 'function') {
      this.callbacks.onFrame = partial.onFrame;
    }

    if (typeof partial.onStatus === 'function') {
      this.callbacks.onStatus = partial.onStatus;
    }

    if (typeof partial.deviceId !== 'undefined') {
      this.config.deviceId = partial.deviceId ?? null;
      this._deviceId = this.config.deviceId;
    }

    if (this._running && (typeof partial.fftSize !== 'undefined' || typeof partial.deviceId !== 'undefined')) {
      const nextDeviceId = this._deviceId;
      await this.stop();
      return this.start(nextDeviceId);
    }

    return this.getState();
  }

  getState() {
    return {
      running: this._running,
      deviceId: this._deviceId,
      sampleRate: this._sampleRate,
      fftSize: this.config.fftSize,
      lastFrame: this._lastFrame,
      analyzerOptions: { ...this.analyzer.options },
    };
  }

  on(type, handler) {
    this.addEventListener(type, handler);
    return () => this.off(type, handler);
  }

  off(type, handler) {
    this.removeEventListener(type, handler);
  }

  _buildAudioConstraints(deviceId) {
    const audio = {
      channelCount: { ideal: 1 },
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
      latency: { ideal: 0.01 },
      ...(isPlainObject(this.config.audioConstraints) ? this.config.audioConstraints : {}),
    };

    if (deviceId) {
      audio.deviceId = { exact: deviceId };
    }

    return { audio };
  }

  _tick(timestamp) {
    if (!this._running || !this.analyserNode || !this._buffer) {
      return;
    }

    this.analyserNode.getFloatTimeDomainData(this._buffer);
    const frame = this.analyzer.processFrame(this._buffer, this._sampleRate, timestamp);
    this._lastFrame = frame;

    this._emit('frame', frame);
    if (frame.onset) {
      this._emit('onset', frame);
    }

    if (!this._running) {
      return;
    }

    this._rafId = requestAnimationFrame((nextTimestamp) => this._tick(nextTimestamp));
  }

  _emit(type, detail) {
    const callback = type === 'frame'
      ? this.callbacks.onFrame
      : type === 'status'
        ? this.callbacks.onStatus
        : this.callbacks.onEvent;

    if (typeof this.callbacks.onEvent === 'function') {
      this.callbacks.onEvent(type, detail);
    }

    if (typeof callback === 'function') {
      callback(detail);
    }

    this.dispatchEvent(createCustomEvent(type, detail));
  }

  _assertMediaSupport() {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
      throw new Error('Audio capture is not available in this browser.');
    }
  }
}

export function createAudioEngine(options) {
  return new AudioEngine(options);
}

export { AudioAnalyzer };

export default AudioEngine;
