const TAU = Math.PI * 2;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smoothstep(edge0, edge1, x) {
  if (edge0 === edge1) return x >= edge1 ? 1 : 0;
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function makeParticle(seed, x, y, angle, speed, life, color, size) {
  return {
    id: seed,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life,
    age: 0,
    color,
    size
  };
}

export function createFxEngine(options = {}) {
  const trail = [];
  const impacts = [];
  const particles = [];
  const config = {
    trailLength: options.trailLength ?? 28,
    maxImpacts: options.maxImpacts ?? 10,
    maxParticles: options.maxParticles ?? 42,
    reducedMotion: Boolean(options.reducedMotion),
    palette: options.palette ?? null
  };

  let seed = 0;

  function reset() {
    trail.length = 0;
    impacts.length = 0;
    particles.length = 0;
  }

  function setOptions(next = {}) {
    if (typeof next.trailLength === "number") {
      config.trailLength = clamp(next.trailLength, 6, 96);
    }
    if (typeof next.maxImpacts === "number") {
      config.maxImpacts = clamp(next.maxImpacts, 1, 24);
    }
    if (typeof next.maxParticles === "number") {
      config.maxParticles = clamp(next.maxParticles, 0, 160);
    }
    if (typeof next.reducedMotion === "boolean") {
      config.reducedMotion = next.reducedMotion;
    }
    if (next.palette) {
      config.palette = next.palette;
    }
  }

  function pushTrailPoint(point) {
    if (!point) return;
    const last = trail[trail.length - 1];
    const entry = {
      x: point.x ?? 0,
      y: point.y ?? 0,
      energy: clamp(point.energy ?? 0.5, 0, 1),
      velocity: clamp(point.velocity ?? point.energy ?? 0.5, 0, 1),
      age: 0
    };

    if (last && last.x === entry.x && last.y === entry.y) {
      last.energy = lerp(last.energy, entry.energy, 0.4);
      last.velocity = lerp(last.velocity, entry.velocity, 0.4);
      return;
    }

    trail.push(entry);
    while (trail.length > config.trailLength) {
      trail.shift();
    }
  }

  function triggerImpact(event = {}) {
    const energy = clamp(event.velocity ?? event.energy ?? 0.5, 0, 1);
    const x = event.x ?? 0;
    const y = event.y ?? 0;
    const frequency = event.frequency ?? 0;
    const midiNote = event.midiNote ?? 0;

    impacts.push({
      x,
      y,
      energy,
      frequency,
      midiNote,
      radius: 0,
      life: 0.72 + energy * 0.45,
      age: 0
    });

    const palette = config.palette || {};
    const sparkCount = config.reducedMotion ? 5 : Math.round(6 + energy * 18);
    const sparkColor = "104, 255, 219";
    for (let i = 0; i < sparkCount; i += 1) {
      const angle = (i / sparkCount) * TAU + (seed * 0.137) % TAU;
      const angleJitter = (Math.random() - 0.5) * 0.9;
      const speed = lerp(42, 220, energy) * (config.reducedMotion ? 0.45 : 1);
      const size = lerp(1.2, 3.6, energy);
    particles.push(
        makeParticle(
          seed += 1,
          x,
          y,
          angle + angleJitter,
          speed * (0.75 + Math.random() * 0.7),
          lerp(0.28, 0.86, energy) * (config.reducedMotion ? 0.7 : 1),
          sparkColor,
          size
        )
      );
    }

    while (impacts.length > config.maxImpacts) {
      impacts.shift();
    }
    while (particles.length > config.maxParticles) {
      particles.shift();
    }
  }

  function update(dt = 0, motionScale = 1) {
    const safeDt = Math.max(0, dt);
    const scaledDt = safeDt * motionScale;
    for (let i = impacts.length - 1; i >= 0; i -= 1) {
      const impact = impacts[i];
      impact.age += scaledDt;
      impact.radius = lerp(18, 170 + impact.energy * 170, smoothstep(0, impact.life, impact.age));
      if (impact.age >= impact.life) {
        impacts.splice(i, 1);
      }
    }

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const particle = particles[i];
      particle.age += scaledDt;
      particle.x += particle.vx * scaledDt;
      particle.y += particle.vy * scaledDt;
      particle.vx *= 0.985;
      particle.vy *= 0.985;
      particle.vy += (particle.age < particle.life * 0.58 ? -4 : 10) * scaledDt;
      if (particle.age >= particle.life) {
        particles.splice(i, 1);
      }
    }

    for (let i = trail.length - 1; i >= 0; i -= 1) {
      trail[i].age += scaledDt;
    }
  }

  function draw(ctx, frame = {}, palette = {}) {
    const width = frame.width ?? frame.size?.width ?? ctx.canvas?.width ?? 0;
    const height = frame.height ?? frame.size?.height ?? ctx.canvas?.height ?? 0;
    const motionScale = frame.motionScale ?? (config.reducedMotion ? 0.24 : 1);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    const mergedPalette = {
      accent: palette.accent ?? "rgba(104, 255, 219, 1)",
      accentSoft: palette.accentSoft ?? "rgba(104, 255, 219, 0.28)",
      warm: palette.warm ?? "rgba(255, 198, 92, 1)",
      trail: palette.trail ?? "rgba(104, 255, 219, 0.78)"
    };

    if (trail.length > 1) {
      for (let i = 1; i < trail.length; i += 1) {
        const prev = trail[i - 1];
      const current = trail[i];
      const t = i / trail.length;
      const widthScale = lerp(0.5, 2.5, current.energy) * (config.reducedMotion ? 0.72 : 1);
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(current.x, current.y);
      ctx.globalAlpha = 0.06 + t * 0.22;
      ctx.strokeStyle = mergedPalette.trail;
      ctx.lineWidth = widthScale;
      ctx.lineCap = "round";
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    }

    for (const impact of impacts) {
      const t = clamp(impact.age / impact.life, 0, 1);
      const alpha = (1 - t) * (config.reducedMotion ? 0.52 : 0.88);
      const outer = impact.radius;
      const inner = outer * lerp(0.2, 0.54, impact.energy);
      const gradient = ctx.createRadialGradient(impact.x, impact.y, inner * 0.15, impact.x, impact.y, outer);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.95})`);
      gradient.addColorStop(0.22, `rgba(104, 255, 219, ${alpha * 0.72})`);
      gradient.addColorStop(0.52, `rgba(84, 180, 255, ${alpha * 0.34})`);
      gradient.addColorStop(1, "rgba(84, 180, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(impact.x, impact.y, outer, 0, TAU);
      ctx.fill();
    }

    for (const particle of particles) {
      const t = clamp(particle.age / particle.life, 0, 1);
      const alpha = (1 - t) * (config.reducedMotion ? 0.45 : 0.9);
      ctx.fillStyle = `rgba(${particle.color}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * (1 - t * 0.4), 0, TAU);
      ctx.fill();
    }

    if (motionScale < 0.4 && impacts.length > 0) {
      const latest = impacts[impacts.length - 1];
      const glow = ctx.createRadialGradient(latest.x, latest.y, 0, latest.x, latest.y, latest.radius * 1.35);
      glow.addColorStop(0, "rgba(255,255,255,0.26)");
      glow.addColorStop(0.32, mergedPalette.accentSoft);
      glow.addColorStop(1, "rgba(104,255,219,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(latest.x, latest.y, latest.radius * 1.35, 0, TAU);
      ctx.fill();
    }

    ctx.restore();
  }

  function getState() {
    return {
      config: { ...config },
      trail: trail.map((entry) => ({ ...entry })),
      impacts: impacts.map((entry) => ({ ...entry })),
      particles: particles.length
    };
  }

  return {
    config,
    reset,
    setOptions,
    pushTrailPoint,
    triggerImpact,
    update,
    draw,
    getState
  };
}
