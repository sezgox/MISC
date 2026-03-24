const DEFAULT_OPTIONS = {
  minFrequency: 50,
  maxFrequency: 1200,
  pitchConfidenceThreshold: 0.35,
  pitchSmoothing: 0.25,
  pitchHoldMs: 140,
  velocityNoiseFloor: 0.012,
  velocityCeiling: 0.22,
  onsetLevelThreshold: 0.08,
  onsetDeltaThreshold: 0.018,
  onsetCooldownMs: 75,
  bpmSmoothing: 0.2,
  bpmMin: 30,
  bpmMax: 240,
  bpmHistorySize: 6,
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(from, to, amount) {
  return from + (to - from) * amount;
}

function meanOf(samples) {
  let total = 0;
  for (let index = 0; index < samples.length; index += 1) {
    total += samples[index];
  }
  return total / samples.length;
}

function rmsOf(samples) {
  let total = 0;
  for (let index = 0; index < samples.length; index += 1) {
    const value = samples[index];
    total += value * value;
  }
  return Math.sqrt(total / samples.length);
}

function frequencyToMidiNote(frequency) {
  if (!Number.isFinite(frequency) || frequency <= 0) {
    return null;
  }

  return Math.round(69 + 12 * Math.log2(frequency / 440));
}

function midiNoteToName(midiNote) {
  if (!Number.isFinite(midiNote)) {
    return null;
  }

  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const normalized = Math.round(midiNote);
  const name = names[((normalized % 12) + 12) % 12];
  const octave = Math.floor(normalized / 12) - 1;
  return `${name}${octave}`;
}

function normalizeVelocity(rms, floor, ceiling) {
  if (!Number.isFinite(rms)) {
    return 0;
  }

  if (ceiling <= floor) {
    return 0;
  }

  return clamp((rms - floor) / (ceiling - floor), 0, 1);
}

export class AudioAnalyzer {
  constructor(options = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.reset();
  }

  reset() {
    this._lastRms = 0;
    this._lastOnsetAt = -Infinity;
    this._lastPitchAt = -Infinity;
    this._lastPitchFrequency = 0;
    this._smoothedFrequency = 0;
    this._smoothedBpm = 0;
    this._onsetIntervals = [];
  }

  processFrame(samples, sampleRate, timestamp = performance.now()) {
    if (!(samples instanceof Float32Array) || samples.length === 0 || !Number.isFinite(sampleRate) || sampleRate <= 0) {
      return this._createSilentFrame(timestamp);
    }

    const centered = this._centerBuffer(samples);
    const rms = rmsOf(centered);
    const velocity = normalizeVelocity(rms, this.options.velocityNoiseFloor, this.options.velocityCeiling);
    const pitch = this._detectPitch(centered, sampleRate, rms);

    const now = timestamp;
    let frequency = 0;
    let midiNote = null;

    if (pitch && pitch.confidence >= this.options.pitchConfidenceThreshold) {
      this._lastPitchAt = now;
      this._lastPitchFrequency = pitch.frequency;
      this._smoothedFrequency = this._smoothedFrequency > 0
        ? lerp(this._smoothedFrequency, pitch.frequency, this.options.pitchSmoothing)
        : pitch.frequency;
      frequency = this._smoothedFrequency;
      midiNote = frequencyToMidiNote(frequency);
    } else if (now - this._lastPitchAt <= this.options.pitchHoldMs && this._smoothedFrequency > 0) {
      frequency = this._smoothedFrequency;
      midiNote = frequencyToMidiNote(frequency);
    } else {
      this._smoothedFrequency = 0;
      this._lastPitchFrequency = 0;
    }

    const amplitudeDelta = rms - this._lastRms;
    const hasSignal = rms >= this.options.onsetLevelThreshold;
    const isOnsetCandidate = hasSignal && amplitudeDelta >= this.options.onsetDeltaThreshold;
    const canTriggerOnset = now - this._lastOnsetAt >= this.options.onsetCooldownMs;
    const onset = Boolean(isOnsetCandidate && canTriggerOnset);

    if (onset) {
      if (Number.isFinite(this._lastOnsetAt) && this._lastOnsetAt > -Infinity) {
        const interval = now - this._lastOnsetAt;
        if (interval >= 1000 / this.options.bpmMax && interval <= 1000 / this.options.bpmMin) {
          this._onsetIntervals.push(interval);
          if (this._onsetIntervals.length > this.options.bpmHistorySize) {
            this._onsetIntervals.shift();
          }

          const averageInterval = this._onsetIntervals.reduce((total, value) => total + value, 0) / this._onsetIntervals.length;
          const instantBpm = averageInterval > 0 ? 60000 / averageInterval : 0;
          this._smoothedBpm = this._smoothedBpm > 0
            ? lerp(this._smoothedBpm, instantBpm, this.options.bpmSmoothing)
            : instantBpm;
        }
      }

      this._lastOnsetAt = now;
    }

    this._lastRms = rms;

    return {
      timestamp: now,
      frequency,
      midiNote,
      velocity,
      onset,
      bpm: this._smoothedBpm,
    };
  }

  _createSilentFrame(timestamp) {
    return {
      timestamp,
      frequency: 0,
      midiNote: null,
      velocity: 0,
      onset: false,
      bpm: this._smoothedBpm,
    };
  }

  _centerBuffer(samples) {
    const centered = new Float32Array(samples.length);
    const offset = meanOf(samples);

    for (let index = 0; index < samples.length; index += 1) {
      centered[index] = samples[index] - offset;
    }

    return centered;
  }

  _detectPitch(samples, sampleRate, rms) {
    if (rms < this.options.velocityNoiseFloor * 1.5) {
      return null;
    }

    const minLag = Math.floor(sampleRate / this.options.maxFrequency);
    const maxLag = Math.min(Math.floor(sampleRate / this.options.minFrequency), samples.length - 1);

    if (minLag < 1 || maxLag <= minLag) {
      return null;
    }

    let bestLag = -1;
    let bestCorrelation = 0;
    const energy = Math.max(rms * rms * samples.length, 1e-8);

    for (let lag = minLag; lag <= maxLag; lag += 1) {
      let correlation = 0;
      const limit = samples.length - lag;

      for (let index = 0; index < limit; index += 1) {
        correlation += samples[index] * samples[index + lag];
      }

      const normalized = correlation / energy;
      if (normalized > bestCorrelation) {
        bestCorrelation = normalized;
        bestLag = lag;
      }
    }

    if (bestLag <= 0 || !Number.isFinite(bestCorrelation) || bestCorrelation <= 0) {
      return null;
    }

    const refinedLag = this._refineLag(samples, bestLag);
    const frequency = refinedLag > 0 ? sampleRate / refinedLag : 0;

    if (!Number.isFinite(frequency) || frequency <= 0) {
      return null;
    }

    return {
      frequency,
      confidence: clamp(bestCorrelation, 0, 1),
    };
  }

  _refineLag(samples, lag) {
    if (lag <= 0 || lag >= samples.length - 1) {
      return lag;
    }

    const left = this._autocorrelationAtLag(samples, lag - 1);
    const center = this._autocorrelationAtLag(samples, lag);
    const right = this._autocorrelationAtLag(samples, lag + 1);
    const denominator = 2 * (2 * center - right - left);

    if (!Number.isFinite(denominator) || Math.abs(denominator) < 1e-8) {
      return lag;
    }

    const offset = (right - left) / denominator;
    return lag + offset;
  }

  _autocorrelationAtLag(samples, lag) {
    if (lag <= 0 || lag >= samples.length) {
      return 0;
    }

    let correlation = 0;
    const limit = samples.length - lag;

    for (let index = 0; index < limit; index += 1) {
      correlation += samples[index] * samples[index + lag];
    }

    return correlation;
  }
}

export function createAudioAnalyzer(options) {
  return new AudioAnalyzer(options);
}

export {
  DEFAULT_OPTIONS as DEFAULT_ANALYZER_OPTIONS,
  frequencyToMidiNote,
  midiNoteToName,
};

export default AudioAnalyzer;
