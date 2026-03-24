const DEFAULT_WINDOW_SECONDS = 12;
const MIN_NODE_DISTANCE_MS = 72;

export class EventTimeline {
  constructor(options = {}) {
    this.historySeconds = options.historySeconds ?? DEFAULT_WINDOW_SECONDS;
    this.events = [];
    this.anchorPitch = null;
  }

  setHistorySeconds(seconds) {
    this.historySeconds = Number(seconds) || DEFAULT_WINDOW_SECONDS;
    this.prune(performance.now());
  }

  clear() {
    this.events = [];
    this.anchorPitch = null;
  }

  push(event) {
    if (!event?.onset || !Number.isFinite(event.timestamp) || !Number.isFinite(event.midiNote)) {
      return null;
    }

    const last = this.events[this.events.length - 1];
    if (last && event.timestamp - last.timestamp < MIN_NODE_DISTANCE_MS) {
      return null;
    }

    if (this.anchorPitch === null) {
      this.anchorPitch = event.midiNote;
    } else {
      this.anchorPitch = this.anchorPitch * 0.92 + event.midiNote * 0.08;
    }

    const timelineEvent = {
      id: `${Math.round(event.timestamp)}-${event.midiNote}`,
      ...event
    };

    this.events.push(timelineEvent);
    this.prune(event.timestamp);
    return timelineEvent;
  }

  prune(now) {
    const oldestTimestamp = now - this.historySeconds * 1000;
    this.events = this.events.filter((event) => event.timestamp >= oldestTimestamp);
  }

  getScene(now, config = {}) {
    this.prune(now);

    const safeWidth = config.width || 1280;
    const safeHeight = config.height || 720;
    const spread = config.spread ?? 0.8;
    const glow = config.glow ?? 0.95;
    const trail = config.trail ?? 0.55;
    const anchorPitch = this.anchorPitch ?? 52;
    const lowestPitch = anchorPitch - 12;
    const highestPitch = anchorPitch + 12;

    const nodes = this.events.map((event) => {
      const age = Math.max(0, now - event.timestamp);
      const normalizedTime = 1 - age / (this.historySeconds * 1000);
      const pitchMix = clamp((event.midiNote - lowestPitch) / Math.max(1, highestPitch - lowestPitch), 0, 1);

      return {
        id: event.id,
        event,
        age,
        alpha: clamp(1 - age / (this.historySeconds * 1000), 0.15, 1),
        radius: 6 + event.velocity * 16,
        x: normalizedTime * safeWidth,
        y: mapPitchToY(pitchMix, safeHeight, spread)
      };
    });

    const ball = this.computeBall(now, nodes, safeWidth, safeHeight);

    return {
      width: safeWidth,
      height: safeHeight,
      nodes,
      ball,
      metrics: {
        glow,
        trail,
        spread,
        activeCount: nodes.length
      }
    };
  }

  computeBall(now, nodes, width, height) {
    if (nodes.length === 0) {
      return {
        x: width * 0.12,
        y: height * 0.5,
        radius: 16,
        velocity: 0,
        progress: 0
      };
    }

    if (nodes.length === 1) {
      const [single] = nodes;
      return {
        x: single.x,
        y: single.y,
        radius: 14 + single.event.velocity * 16,
        velocity: single.event.velocity,
        progress: 1
      };
    }

    const last = nodes[nodes.length - 1];
    const prev = nodes[nodes.length - 2];
    const segmentDuration = Math.max(90, last.event.timestamp - prev.event.timestamp);
    const progress = clamp((now - last.event.timestamp + segmentDuration) / segmentDuration, 0, 1);
    const eased = easeInOutCubic(progress);

    return {
      x: lerp(prev.x, last.x, eased),
      y: lerp(prev.y, last.y, eased),
      radius: lerp(14 + prev.event.velocity * 10, 16 + last.event.velocity * 18, eased),
      velocity: lerp(prev.event.velocity, last.event.velocity, eased),
      progress: eased
    };
  }
}

function mapPitchToY(normalizedPitch, height, spread) {
  const center = height * 0.5;
  const amplitude = height * 0.34 * spread;
  return center - (normalizedPitch * 2 - 1) * amplitude;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function easeInOutCubic(value) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}
