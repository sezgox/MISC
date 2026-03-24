const STANDARD_TUNINGS = {
  4: [
    { name: "G", midi: 43 },
    { name: "D", midi: 38 },
    { name: "A", midi: 33 },
    { name: "E", midi: 28 }
  ],
  6: [
    { name: "e", midi: 64 },
    { name: "B", midi: 59 },
    { name: "G", midi: 55 },
    { name: "D", midi: 50 },
    { name: "A", midi: 45 },
    { name: "E", midi: 40 }
  ]
};

export function parseTabText(sourceText, options = {}) {
  const text = `${sourceText || ""}`.replace(/\r/g, "");
  const groups = collectGroups(text);

  if (groups.length === 0) {
    throw new Error("No se encontro un bloque de tab valido.");
  }

  const parsedGroups = groups
    .map((group) => parseGroup(group, options))
    .filter((group) => group.events.length > 0);

  if (parsedGroups.length === 0) {
    throw new Error("La tab no contiene notas legibles.");
  }

  const merged = mergeGroups(parsedGroups);
  return {
    format: "ascii-tab",
    groupCount: parsedGroups.length,
    title: options.title || extractTitle(text) || "Uploaded Tab",
    strings: parsedGroups[0].strings,
    totalSteps: merged.totalSteps,
    events: merged.events
  };
}

function collectGroups(text) {
  const lines = text.split("\n");
  const groups = [];
  let current = [];

  for (const rawLine of lines) {
    if (isTabLine(rawLine)) {
      current.push(rawLine);
      continue;
    }

    if (current.length >= 4) {
      groups.push(current);
    }
    current = [];
  }

  if (current.length >= 4) {
    groups.push(current);
  }

  return groups;
}

function isTabLine(line) {
  return /^\s*[A-Ga-g][#b]?\s*\|[-0-9hpbrx/\\~|()\s]+$/.test(line);
}

function parseGroup(lines, options) {
  const normalized = lines.map((line) => {
    const match = line.match(/^\s*([A-Ga-g][#b]?)\s*\|(.+)$/);
    return {
      raw: line,
      label: match[1],
      content: sanitizeContent(match[2])
    };
  });

  const tuning = resolveTuning(normalized.length, options.tuning);
  const width = Math.max(...normalized.map((line) => line.content.length));
  const padded = normalized.map((line) => ({
    ...line,
    content: line.content.padEnd(width, "-")
  }));

  const events = [];
  let column = 0;

  while (column < width) {
    const notes = [];
    let span = 1;

    for (let stringIndex = 0; stringIndex < padded.length; stringIndex += 1) {
      const line = padded[stringIndex];
      const char = line.content[column];
      if (!isDigit(char)) {
        continue;
      }

      if (column > 0 && isDigit(line.content[column - 1])) {
        continue;
      }

      let end = column + 1;
      while (end < width && isDigit(line.content[end])) {
        end += 1;
      }

      const fret = Number.parseInt(line.content.slice(column, end), 10);
      span = Math.max(span, end - column);
      const openMidi = tuning[stringIndex].midi;
      const midiNote = openMidi + fret;
      notes.push({
        stringIndex,
        stringName: tuning[stringIndex].name,
        fret,
        midiNote,
        frequency: midiToFrequency(midiNote)
      });
    }

    if (notes.length > 0) {
      const velocity = clamp(0.58 + (notes.length - 1) * 0.1, 0.58, 0.92);
      for (const note of notes) {
        events.push({
          ...note,
          velocity,
          stepIndex: column,
          onset: true
        });
      }
    }

    column += span;
  }

  return {
    strings: tuning,
    totalSteps: width,
    events
  };
}

function mergeGroups(groups) {
  const events = [];
  let stepOffset = 0;

  for (const group of groups) {
    for (const event of group.events) {
      events.push({
        ...event,
        stepIndex: event.stepIndex + stepOffset
      });
    }
    stepOffset += group.totalSteps + 4;
  }

  return {
    totalSteps: stepOffset,
    events: events.sort((left, right) => left.stepIndex - right.stepIndex || left.stringIndex - right.stringIndex)
  };
}

function resolveTuning(stringCount, customTuning) {
  if (Array.isArray(customTuning) && customTuning.length === stringCount) {
    return customTuning;
  }

  const tuning = STANDARD_TUNINGS[stringCount];
  if (!tuning) {
    throw new Error(`No hay afinacion estandar soportada para ${stringCount} cuerdas.`);
  }

  return tuning;
}

function sanitizeContent(content) {
  return content.replace(/\|/g, "-").replace(/\s/g, "-");
}

function extractTitle(text) {
  const line = text.split("\n").find((entry) => entry.trim() && !isTabLine(entry));
  return line?.trim() || "";
}

function isDigit(char) {
  return char >= "0" && char <= "9";
}

function midiToFrequency(midiNote) {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
