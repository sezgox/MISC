import { createFxEngine } from "./fx-engine.js";

const TAU = Math.PI * 2;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothstep(edge0, edge1, x) {
  if (edge0 === edge1) return x >= edge1 ? 1 : 0;
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function normalize(value, min, max) {
  if (!Number.isFinite(value)) return 0;
  if (max === min) return 0;
  return clamp((value - min) / (max - min), 0, 1);
}

function toMidiNote(frequency) {
  if (!frequency || frequency <= 0) return null;
  return Math.round(69 + 12 * Math.log2(frequency / 440));
}

function getNodeTime(node, index) {
  return Number.isFinite(node?.time)
    ? node.time
    : Number.isFinite(node?.timestamp)
      ? node.timestamp
      : index;
}

function getNodeFrequency(node, fallback = 0) {
  if (Number.isFinite(node?.frequency)) return node.frequency;
  if (Number.isFinite(node?.hz)) return node.hz;
  return fallback;
}

function resolveMotionPreference(frameMotion, configMotion) {
  if (typeof frameMotion === "boolean") return frameMotion ? 1 : 0;
  if (typeof configMotion === "boolean") return configMotion ? 1 : 0;
  return configMotion && typeof configMotion === "number" ? configMotion : 1;
}

function createPalette(overrides = {}) {
  return {
    bg0: overrides.bg0 ?? "#06080d",
    bg1: overrides.bg1 ?? "#0b1118",
    bg2: overrides.bg2 ?? "#101a25",
    grid: overrides.grid ?? "rgba(132, 160, 184, 0.09)",
    gridStrong: overrides.gridStrong ?? "rgba(132, 160, 184, 0.16)",
    curve: overrides.curve ?? "rgba(109, 234, 219, 0.96)",
    curveSoft: overrides.curveSoft ?? "rgba(109, 234, 219, 0.18)",
    node: overrides.node ?? "rgba(232, 247, 255, 0.96)",
    nodeSoft: overrides.nodeSoft ?? "rgba(109, 234, 219, 0.24)",
    ball: overrides.ball ?? "rgba(244, 255, 255, 0.98)",
    ballGlow: overrides.ballGlow ?? "rgba(109, 234, 219, 0.52)",
    accent: overrides.accent ?? "rgba(109, 234, 219, 1)",
    accentSoft: overrides.accentSoft ?? "rgba(109, 234, 219, 0.24)",
    warm: overrides.warm ?? "rgba(255, 198, 92, 1)",
    text: overrides.text ?? "rgba(239, 246, 255, 0.92)",
    textSoft: overrides.textSoft ?? "rgba(181, 194, 210, 0.72)",
    danger: overrides.danger ?? "rgba(255, 108, 108, 1)"
  };
}

function buildSceneNodes(scene = {}, width, height, config = {}) {
  const source = Array.isArray(scene.nodes) ? scene.nodes : [];
  if (source.length === 0) {
    return [];
  }

  const padX = config.paddingX ?? Math.max(56, width * 0.07);
  const padY = config.paddingY ?? Math.max(64, height * 0.13);
  const availableWidth = Math.max(1, width - padX * 2);
  const availableHeight = Math.max(1, height - padY * 2);
  const spread = clamp(config.verticalSpread ?? 0.58, 0.12, 1.4);

  const times = source.map((node, index) => getNodeTime(node, index));
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const frequencies = source
    .map((node) => getNodeFrequency(node))
    .filter((value) => Number.isFinite(value) && value > 0);
  const minFrequency = frequencies.length > 0 ? Math.min(...frequencies) : 80;
  const maxFrequency = frequencies.length > 0 ? Math.max(...frequencies) : 1200;

  return source.map((node, index) => {
    const time = getNodeTime(node, index);
    const normalizedTime = source.length > 1 ? normalize(time, minTime, maxTime) : 0.5;
    const frequency = getNodeFrequency(node, frequencies[index] ?? 0);
    const note = Number.isFinite(node?.midiNote) ? node.midiNote : toMidiNote(frequency);
    const noteRange = normalize(Number.isFinite(note) ? note : 64, 28, 96);
    const frequencyRange = frequency > 0 ? normalize(frequency, minFrequency, maxFrequency) : noteRange;
    const curvePhase = normalizedTime * Math.PI * 1.4;
    const centerY = height * 0.5;
    const yWave = Math.sin(curvePhase) * availableHeight * 0.18 * spread;
    const yPitch = (0.5 - frequencyRange) * availableHeight * 0.5 * spread;
    const y = clamp(centerY + yWave + yPitch, padY, height - padY);
    const x = padX + normalizedTime * availableWidth;
    const velocity = clamp(node?.velocity ?? node?.intensity ?? 0.5, 0, 1);
    return {
      ...node,
      index,
      time,
      x: Number.isFinite(node?.x) ? node.x : x,
      y: Number.isFinite(node?.y) ? node.y : y,
      note,
      frequency,
      velocity,
      onset: Boolean(node?.onset),
      bpm: Number.isFinite(node?.bpm) ? node.bpm : scene.bpm ?? null,
      weight: lerp(0.95, 1.55, velocity),
      radius: lerp(4.5, 10.5, velocity),
      energy: lerp(0.32, 1, Math.max(velocity, node?.onset ? 0.65 : 0))
    };
  });
}

function computeBallPosition(nodes, scene = {}, config = {}, width = 0, height = 0) {
  if (scene.ball && Number.isFinite(scene.ball.x) && Number.isFinite(scene.ball.y)) {
    return {
      x: scene.ball.x,
      y: scene.ball.y,
      velocity: clamp(scene.ball.velocity ?? scene.ball.energy ?? 0.5, 0, 1),
      energy: clamp(scene.ball.energy ?? scene.ball.velocity ?? 0.5, 0, 1)
    };
  }

  if (nodes.length === 0) {
    return {
      x: width * 0.5,
      y: height * 0.5,
      velocity: 0.5,
      energy: 0.5
    };
  }

  const activeIndex = clamp(
    Number.isFinite(scene.activeIndex)
      ? scene.activeIndex
      : Number.isFinite(scene.currentIndex)
        ? scene.currentIndex
        : 0,
    0,
    nodes.length - 1
  );
  const current = nodes[activeIndex];
  const next = nodes[Math.min(activeIndex + 1, nodes.length - 1)];
  const progress = smoothstep(0, 1, clamp(scene.progress ?? scene.interpolation ?? 0, 0, 1));
  const eased = easeInOutCubic(progress);
  const x = lerp(current.x, next.x, eased);
  const y = lerp(current.y, next.y, eased);
  const velocity = clamp(scene.ball?.velocity ?? current.velocity ?? 0.5, 0, 1);

  return {
    x,
    y,
    velocity,
    energy: clamp(scene.ball?.energy ?? velocity, 0, 1)
  };
}

function drawBackground(ctx, width, height, palette, motionScale) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, palette.bg0);
  gradient.addColorStop(0.48, palette.bg1);
  gradient.addColorStop(1, palette.bg2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const aurora = ctx.createRadialGradient(width * 0.18, height * 0.12, 0, width * 0.18, height * 0.12, Math.max(width, height) * 0.72);
  aurora.addColorStop(0, motionScale > 0 ? "rgba(109, 234, 219, 0.17)" : "rgba(109, 234, 219, 0.11)");
  aurora.addColorStop(0.36, "rgba(84, 180, 255, 0.09)");
  aurora.addColorStop(1, "rgba(84, 180, 255, 0)");
  ctx.fillStyle = aurora;
  ctx.fillRect(0, 0, width, height);

  const haze = ctx.createRadialGradient(width * 0.76, height * 0.82, 0, width * 0.76, height * 0.82, Math.max(width, height) * 0.64);
  haze.addColorStop(0, "rgba(255, 198, 92, 0.07)");
  haze.addColorStop(0.45, "rgba(109, 234, 219, 0.06)");
  haze.addColorStop(1, "rgba(6, 8, 13, 0)");
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, width, height);
}

function drawGrid(ctx, width, height, palette) {
  ctx.save();
  ctx.strokeStyle = palette.grid;
  ctx.lineWidth = 1;
  const stepX = Math.max(72, Math.round(width / 12));
  const stepY = Math.max(72, Math.round(height / 8));

  ctx.beginPath();
  for (let x = stepX; x < width; x += stepX) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = stepY; y < height; y += stepY) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();

  ctx.strokeStyle = palette.gridStrong;
  ctx.beginPath();
  ctx.moveTo(0, height * 0.5);
  ctx.lineTo(width, height * 0.5);
  ctx.stroke();
  ctx.restore();
}

function drawPath(ctx, nodes, palette, motionScale) {
  if (nodes.length === 0) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (nodes.length === 1) {
    const node = nodes[0];
    const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 160);
    gradient.addColorStop(0, "rgba(109, 234, 219, 0.18)");
    gradient.addColorStop(1, "rgba(109, 234, 219, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(node.x, node.y, 160, 0, TAU);
    ctx.fill();
    ctx.restore();
    return;
  }

  ctx.strokeStyle = palette.curveSoft;
  ctx.lineWidth = motionScale > 0.5 ? 16 : 12;
  ctx.beginPath();
  ctx.moveTo(nodes[0].x, nodes[0].y);
  for (let i = 1; i < nodes.length - 1; i += 1) {
    const current = nodes[i];
    const next = nodes[i + 1];
    const midX = (current.x + next.x) * 0.5;
    const midY = (current.y + next.y) * 0.5;
    ctx.quadraticCurveTo(current.x, current.y, midX, midY);
  }
  const last = nodes[nodes.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();

  ctx.strokeStyle = palette.curve;
  ctx.lineWidth = motionScale > 0.5 ? 4 : 3;
  ctx.beginPath();
  ctx.moveTo(nodes[0].x, nodes[0].y);
  for (let i = 1; i < nodes.length - 1; i += 1) {
    const current = nodes[i];
    const next = nodes[i + 1];
    const midX = (current.x + next.x) * 0.5;
    const midY = (current.y + next.y) * 0.5;
    ctx.quadraticCurveTo(current.x, current.y, midX, midY);
  }
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
  ctx.restore();
}

function drawNodes(ctx, nodes, palette, motionScale, activeIndex = -1) {
  ctx.save();
  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    const active = i === activeIndex;
    const pulse = active ? 1 : 0;
    const radius = node.radius + (active ? 6 : 0);
    const glowRadius = radius * (active ? 4.2 : 2.6);
    const alpha = active ? 1 : clamp(node.energy * 0.95, 0.4, 0.92);

    const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowRadius);
    glow.addColorStop(0, `rgba(255, 255, 255, ${0.92 * alpha})`);
    glow.addColorStop(0.3, `rgba(109, 234, 219, ${0.45 * alpha})`);
    glow.addColorStop(1, "rgba(109, 234, 219, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(node.x, node.y, glowRadius, 0, TAU);
    ctx.fill();

    ctx.fillStyle = active ? palette.ball : palette.node;
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, TAU);
    ctx.fill();

    ctx.strokeStyle = active ? "rgba(255,255,255,0.9)" : palette.nodeSoft;
    ctx.lineWidth = active ? 2 : 1.25;
    ctx.stroke();

    if (node.onset || pulse > 0) {
      const ringAlpha = active ? 0.85 : 0.48;
      ctx.strokeStyle = `rgba(255, 198, 92, ${ringAlpha})`;
      ctx.lineWidth = active ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 8 + pulse * 6, 0, TAU);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawBall(ctx, ball, palette, motionScale) {
  const radius = lerp(10, 18, ball.energy) * (motionScale > 0.5 ? 1 : 0.82);
  const glowRadius = radius * lerp(4.4, 6.4, ball.energy);
  const halo = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, glowRadius);
  halo.addColorStop(0, "rgba(255,255,255,0.98)");
  halo.addColorStop(0.18, `rgba(109, 234, 219, ${0.72 + ball.energy * 0.16})`);
  halo.addColorStop(0.5, `rgba(84, 180, 255, ${0.32 + ball.energy * 0.16})`);
  halo.addColorStop(1, "rgba(84, 180, 255, 0)");
  ctx.save();
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, glowRadius, 0, TAU);
  ctx.fill();

  ctx.fillStyle = palette.ball;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, radius, 0, TAU);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 1.25;
  ctx.stroke();
  ctx.restore();
}

function drawTelemetry(ctx, width, height, scene, telemetry, palette) {
  const bpm = Number.isFinite(telemetry?.bpm)
    ? Math.round(telemetry.bpm)
    : Number.isFinite(scene?.bpm)
      ? Math.round(scene.bpm)
      : null;
  const label = bpm ? `${bpm} BPM` : "Live input";
  const status = telemetry?.status
    ?? scene?.status
    ?? ((telemetry?.reducedMotion ?? scene?.reducedMotion) ? "Reduced motion" : "Reactive flow");
  ctx.save();
  ctx.font = "600 12px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  ctx.fillStyle = palette.textSoft;
  ctx.textBaseline = "top";
  ctx.fillText(label, 24, 20);
  ctx.fillStyle = palette.text;
  ctx.font = "700 15px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  ctx.fillText(status, 24, 38);
  ctx.restore();
}

export function createRenderer(options = {}) {
  const normalized = options && typeof options.getContext === "function"
    ? { canvas: options }
    : options;
  const canvas = normalized.canvas;

  if (!canvas || typeof canvas.getContext !== "function") {
    throw new TypeError("createRenderer requires a canvas element in options.canvas.");
  }

  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
  if (!ctx) {
    throw new Error("2D canvas context is unavailable.");
  }

  const fx = normalized.fxEngine ?? createFxEngine({
    trailLength: normalized.trailLength,
    reducedMotion: Boolean(normalized.reducedMotion),
    palette: normalized.palette
  });

  const getScene = typeof normalized.getScene === "function" ? normalized.getScene : () => ({});
  const getTelemetry = typeof normalized.getTelemetry === "function" ? normalized.getTelemetry : () => ({});
  const getConfig = typeof normalized.getConfig === "function" ? normalized.getConfig : () => ({});

  let width = 0;
  let height = 0;
  let dpr = 1;
  let reducedMotion = Boolean(normalized.reducedMotion);
  let motionScale = reducedMotion ? 0.28 : 1;
  let lastTimestamp = 0;

  function resize(next = {}) {
    const config = { ...getConfig(), ...next };
    width = Math.max(1, Math.round(next.width ?? config.width ?? canvas.clientWidth ?? canvas.width ?? 0));
    height = Math.max(1, Math.round(next.height ?? config.height ?? canvas.clientHeight ?? canvas.height ?? 0));
    dpr = clamp(next.dpr ?? config.dpr ?? normalized.dpr ?? globalThis.devicePixelRatio ?? 1, 1, 3);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { width, height, dpr };
  }

  function render(now = performance.now()) {
    const scene = getScene() ?? {};
    const telemetry = getTelemetry() ?? {};
    const config = getConfig() ?? {};
    const palette = createPalette({
      ...normalized.palette,
      ...config.palette
    });

    reducedMotion = Boolean(config.reducedMotion ?? telemetry.reducedMotion ?? normalized.reducedMotion);
    motionScale = typeof config.motionScale === "number"
      ? config.motionScale
      : resolveMotionPreference(undefined, reducedMotion) * (reducedMotion ? 0.28 : 1);

    const dt = Number.isFinite(now) ? (lastTimestamp ? (now - lastTimestamp) / 1000 : 0) : 0;
    lastTimestamp = now;

    if (canvas.width === 0 || canvas.height === 0 || config.resizeCanvas) {
      resize(config);
    }

    fx.setOptions?.({
      reducedMotion,
      palette
    });

    const nodes = buildSceneNodes(scene, width, height, config);
    const ball = computeBallPosition(nodes, scene, config, width, height);
    const activeIndex = clamp(
      Number.isFinite(scene.activeIndex) ? scene.activeIndex : Number.isFinite(scene.currentIndex) ? scene.currentIndex : 0,
      0,
      Math.max(0, nodes.length - 1)
    );

    fx.update(dt, motionScale);
    fx.pushTrailPoint?.({
      x: ball.x,
      y: ball.y,
      velocity: ball.velocity,
      energy: ball.energy
    });

    ctx.save();
    ctx.clearRect(0, 0, width, height);
    drawBackground(ctx, width, height, palette, motionScale);
    drawGrid(ctx, width, height, palette);
    drawPath(ctx, nodes, palette, motionScale);
    drawNodes(ctx, nodes, palette, motionScale, activeIndex);
    fx.draw(ctx, { width, height, motionScale }, palette);
    drawBall(ctx, ball, palette, motionScale);
    drawTelemetry(ctx, width, height, scene, telemetry, palette);

    if (scene.title) {
      ctx.fillStyle = palette.text;
      ctx.font = "700 16px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
      ctx.textBaseline = "bottom";
      ctx.fillText(scene.title, 24, height - 26);
      ctx.fillStyle = palette.textSoft;
      ctx.font = "500 12px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
      if (scene.subtitle) {
        ctx.fillText(scene.subtitle, 24, height - 10);
      }
    }
    ctx.restore();

    return {
      width,
      height,
      dpr,
      reducedMotion,
      motionScale,
      nodes,
      ball,
      activeIndex,
      palette
    };
  }

  function triggerImpact(event = {}, node = null) {
    const source = node ?? {};
    fx.triggerImpact?.({
      x: event.x ?? source.x ?? width * 0.5,
      y: event.y ?? source.y ?? height * 0.5,
      velocity: event.velocity ?? source.velocity ?? source.energy ?? 0.5,
      frequency: event.frequency ?? source.frequency ?? 0,
      midiNote: event.midiNote ?? source.midiNote ?? source.note ?? 0
    });
    return api;
  }

  function destroy() {
    fx.reset();
  }

  const api = {
    fx,
    resize,
    render,
    draw: render,
    update: render,
    renderFrame: render,
    triggerImpact,
    destroy
  };

  resize(normalized);
  return api;
}
