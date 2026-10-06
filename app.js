const SVG_NS = "http://www.w3.org/2000/svg";
const CORE = { x: 0, y: 0, width: 1000, height: 700 };
const BLOCKAGE = { x: 425, y: 265, width: 150, height: 170 };
const WIRELENGTH_TARGET = 1050;
const IDEAL_WIRELENGTH = 750;
const BASE_MACRO_SPACING = 20;
const BLOCKAGE_SPACING = 10;
const SNAP_SIZE = 10;

const initialMacros = [
  { id: "cpu", name: "CPU", x: 120, y: 270, width: 180, height: 150 },
  { id: "gpu", name: "GPU", x: 690, y: 90, width: 190, height: 170 },
  { id: "sram", name: "SRAM", x: 650, y: 470, width: 210, height: 130 },
  { id: "ddr", name: "DDR CTRL", x: 60, y: 60, width: 160, height: 110 },
  { id: "pcie", name: "PCIe", x: 790, y: 310, width: 150, height: 100 },
];

const bestPositions = {
  gpu: { x: 600, y: 530 },
  sram: { x: 590, y: 360 },
  cpu: { x: 610, y: 150 },
  ddr: { x: 830, y: 170 },
  pcie: { x: 630, y: 20 },
};

const bestMacros = initialMacros.map((macro) => ({
  ...macro,
  ...bestPositions[macro.id],
}));

const externalPorts = {
  ddrInput: { x: 14, y: 120 },
  pcieOutput: { x: 986, y: 560 },
};

const connections = [
  {
    from: "ddrInput",
    to: "ddr",
    weight: 2,
    signals: 256,
    name: "DDR_DATA_IN",
    scored: false,
    labelOffsetY: -18,
  },
  {
    from: "ddr",
    to: "cpu",
    weight: 2,
    signals: 256,
    name: "MEMORY_BUS",
    labelOffsetY: 18,
  },
  {
    from: "cpu",
    to: "gpu",
    weight: 3,
    signals: 512,
    name: "GRAPHICS_DATA",
    labelOffsetY: -18,
  },
  {
    from: "cpu",
    to: "sram",
    weight: 4,
    signals: 1024,
    name: "CACHE_BUS",
    labelOffsetY: 18,
  },
  {
    from: "cpu",
    to: "pcie",
    weight: 1,
    signals: 64,
    name: "PCIE_TX_DATA",
    labelOffsetY: -18,
  },
  {
    from: "gpu",
    to: "sram",
    weight: 2,
    signals: 256,
    name: "FRAME_BUFFER",
    labelOffsetY: 18,
  },
  {
    from: "pcie",
    to: "pcieOutput",
    weight: 2,
    signals: 32,
    name: "PCIE_TX_OUT",
    scored: false,
    labelOffsetY: -18,
  },
];

const lessonStages = [
  {
    eyebrow: "WELCOME, DESIGNER",
    title: "Why floorplanning matters",
    text: "Watch how one early layout decision changes the whole chip.",
    takeaway:
      "A good floorplan gives placement, power, timing, and routing a strong starting point.",
    bubble: "This board is our chip. Let’s build it from the outside in!",
    demo: "intro",
    boardLabel: "FLOORPLAN VIEW",
    metricLabel: "DESIGN FLOW",
    metricValue: "START",
  },
  {
    eyebrow: "STAGE 1 · DEFINE THE CANVAS",
    title: "Die, core, and utilization",
    text: "The die is the chip boundary. The core is the usable placement region.",
    takeaway:
      "Leave enough empty core area for standard cells and routing.",
    bubble: "See the inner box? Packing it too tightly creates congestion!",
    demo: "core",
    boardLabel: "DIE + CORE",
    metricLabel: "UTILIZATION",
    metricValue: "72%",
  },
  {
    eyebrow: "STAGE 2 · PLACE THE BIG BLOCKS",
    title: "Macros shape the entire design",
    text: "Large macros move in first and create the structure for everything else.",
    takeaway:
      "Place large and constrained macros first, without overlap.",
    bubble: "CPU, GPU, SRAM—big blocks first! Watch them snap into legal positions.",
    demo: "macro",
    boardLabel: "MACRO PLACEMENT",
    metricLabel: "OVERLAPS",
    metricValue: "0",
  },
  {
    eyebrow: "STAGE 3 · FOLLOW THE DATA",
    title: "Connectivity becomes wirelength",
    text: "Connected macros move closer, shrinking delay, power, and routing demand.",
    takeaway:
      "Follow the strongest fly-lines instead of chasing visual symmetry.",
    bubble: "Long wires cost us. I’ll pull these connected blocks closer together!",
    demo: "connect",
    boardLabel: "CONNECTIVITY",
    metricLabel: "WIRELENGTH",
    metricValue: "↓ 38%",
  },
  {
    eyebrow: "STAGE 4 · PRESERVE ROUTING SPACE",
    title: "Halos protect macro access",
    text: "The animated outlines reserve space around each hard macro.",
    takeaway:
      "A halo, also called a macro keepout, protects pins, power straps, and local routing access.",
    bubble: "These orange outlines are not wasted space—they keep macro edges reachable!",
    demo: "halo",
    boardLabel: "HALO / KEEPOUT",
    metricLabel: "HALO",
    metricValue: "20 μm",
  },
  {
    eyebrow: "STAGE 5 · CONTROL PLACEMENT",
    title: "Blockages serve different purposes",
    text: "Watch the board compare hard, soft, partial, and routing blockages.",
    takeaway:
      "Placement blockages control cell density; routing blockages protect selected routing resources.",
    bubble: "Not every blockage means the same thing. Let’s compare the four common controls!",
    demo: "blockage",
    boardLabel: "BLOCKAGE TYPES",
    metricLabel: "TYPES",
    metricValue: "4",
  },
  {
    eyebrow: "STAGE 6 · PREVENT CONGESTION",
    title: "Channels carry signals and power",
    text: "High-bandwidth connections need wider space between macro edges.",
    takeaway:
      "Placing every hard macro together shortens wires but can create an unroutable hotspot.",
    bubble: "Short wires are good, but this cluster is too tight. Open channels for the large buses!",
    demo: "congestion",
    boardLabel: "CHANNEL ANALYSIS",
    metricLabel: "RISK",
    metricValue: "HIGH",
  },
  {
    eyebrow: "YOUR FLOORPLANNING MISSION",
    title: "Balance legality and quality",
    text: "Your turn: create a legal floorplan with short, efficient connections.",
    takeaway:
      "Balance boundaries, overlap, blockages, channels, and wirelength.",
    bubble: "Ready? Balance short wires with halos, legal blockages, and clear channels!",
    demo: "mission",
    boardLabel: "YOUR MISSION",
    metricLabel: "TARGET",
    metricValue: "A",
  },
];

let macros = structuredClone(initialMacros);
let activeDrag = null;
let toastTimer = null;
let commentaryTimer = null;
let lessonStageIndex = 0;
let voiceEnabled = false;
let viewMode = "player";

const svg = document.querySelector("#floorplan");
const macrosLayer = document.querySelector("#macrosLayer");
const connectionsLayer = document.querySelector("#connectionsLayer");
const channelsLayer = document.querySelector("#channelsLayer");
const helpDialog = document.querySelector("#helpDialog");
const conceptLesson = document.querySelector("#conceptLesson");

function createSvgElement(tag, attributes = {}) {
  const element = document.createElementNS(SVG_NS, tag);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function macroCenter(macro) {
  return {
    x: macro.x + macro.width / 2,
    y: macro.y + macro.height / 2,
  };
}

function visibleMacros() {
  return viewMode === "best" ? bestMacros : macros;
}

function connectionEndpoint(id, direction, layout = visibleMacros()) {
  if (externalPorts[id]) return externalPorts[id];

  const macro = layout.find((item) => item.id === id);
  return {
    x: direction === "output" ? macro.x + macro.width : macro.x,
    y: macro.y + macro.height / 2,
  };
}

function endpointLabel(id, layout = visibleMacros()) {
  if (id === "ddrInput") return "DDR input";
  if (id === "pcieOutput") return "Chip output";
  return layout.find((macro) => macro.id === id)?.name ?? id;
}

function rectanglesOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function rectangleClearance(a, b) {
  const horizontalGap = Math.max(
    b.x - (a.x + a.width),
    a.x - (b.x + b.width),
    0,
  );
  const verticalGap = Math.max(
    b.y - (a.y + a.height),
    a.y - (b.y + b.height),
    0,
  );
  return Math.max(horizontalGap, verticalGap);
}

function requiredChannelForSignals(signals) {
  if (signals >= 1024) return 60;
  if (signals >= 512) return 50;
  if (signals >= 256) return 40;
  return 30;
}

function connectionBetween(firstId, secondId) {
  return connections.find(
    (connection) =>
      connection.scored !== false &&
      ((connection.from === firstId && connection.to === secondId) ||
        (connection.from === secondId && connection.to === firstId)),
  );
}

function requiredMacroSpacing(firstId, secondId) {
  const connection = connectionBetween(firstId, secondId);
  return connection
    ? requiredChannelForSignals(connection.signals)
    : BASE_MACRO_SPACING;
}

function channelViolationsFor(layout = visibleMacros()) {
  const issues = [];

  layout.forEach((macro, index) => {
    layout.slice(index + 1).forEach((other) => {
      if (rectanglesOverlap(macro, other)) return;

      const required = requiredMacroSpacing(macro.id, other.id);
      const actual = rectangleClearance(macro, other);
      if (actual < required) {
        issues.push({
          firstId: macro.id,
          secondId: other.id,
          required,
          actual,
        });
      }
    });

    if (!rectanglesOverlap(macro, BLOCKAGE)) {
      const actual = rectangleClearance(macro, BLOCKAGE);
      if (actual < BLOCKAGE_SPACING) {
        issues.push({
          firstId: macro.id,
          secondId: "blockage",
          required: BLOCKAGE_SPACING,
          actual,
        });
      }
    }
  });

  return issues;
}

function isInsideCore(macro) {
  return (
    macro.x >= CORE.x &&
    macro.y >= CORE.y &&
    macro.x + macro.width <= CORE.width &&
    macro.y + macro.height <= CORE.height
  );
}

function violationsFor(macro, layout = visibleMacros()) {
  const violations = [];

  if (!isInsideCore(macro)) {
    violations.push("outside");
  }

  if (rectanglesOverlap(macro, BLOCKAGE)) {
    violations.push("blockage");
  }

  layout.forEach((other) => {
    if (other.id !== macro.id && rectanglesOverlap(macro, other)) {
      violations.push("overlap");
    }
  });

  if (
    channelViolationsFor(layout).some(
      (issue) => issue.firstId === macro.id || issue.secondId === macro.id,
    )
  ) {
    violations.push("channel");
  }

  return [...new Set(violations)];
}

function calculateMetrics(layout = visibleMacros()) {
  const violationSets = layout.map((macro) =>
    violationsFor(macro, layout).filter((violation) => violation !== "channel"),
  );
  const invalidMacros = violationSets.filter((items) => items.length > 0).length;
  const overlapPairs = layout.reduce((count, macro, index) => {
    return (
      count +
      layout
        .slice(index + 1)
        .filter((other) => rectanglesOverlap(macro, other)).length
    );
  }, 0);
  const channelIssues = channelViolationsFor(layout);
  const congestionRisk = overlapPairs
    ? 100
    : Math.round(
        Math.max(
          0,
          ...channelIssues.map(
            (issue) =>
              ((issue.required - issue.actual) / issue.required) * 100,
          ),
        ),
      );

  const wirelength = Math.round(
    connections.reduce((total, connection) => {
      if (connection.scored === false) return total;
      const from = macroCenter(layout.find((macro) => macro.id === connection.from));
      const to = macroCenter(layout.find((macro) => macro.id === connection.to));
      return total + (Math.abs(from.x - to.x) + Math.abs(from.y - to.y)) * connection.weight;
    }, 0) / 4,
  );

  const macroArea = layout.reduce(
    (total, macro) => total + macro.width * macro.height,
    0,
  );
  const utilization = Math.round(
    (macroArea / (CORE.width * CORE.height)) * 100,
  );
  const score = Math.max(
    0,
    Math.round(
      1000 -
        Math.max(0, wirelength - IDEAL_WIRELENGTH) * 0.55 -
        invalidMacros * 170 -
        overlapPairs * 80 -
        channelIssues.length * 65,
    ),
  );

  return {
    invalidMacros,
    overlapPairs,
    channelIssues,
    congestionRisk,
    wirelength,
    utilization,
    score,
    allInside: layout.every(isInsideCore),
    noOverlaps:
      overlapPairs === 0 &&
      layout.every((macro) => !rectanglesOverlap(macro, BLOCKAGE)),
    channelsClear: channelIssues.length === 0,
    wirelengthMet: wirelength <= WIRELENGTH_TARGET,
  };
}

function renderConnections() {
  connectionsLayer.replaceChildren();
  const layout = visibleMacros();

  connections.forEach((connection) => {
    const from = connectionEndpoint(connection.from, "output", layout);
    const to = connectionEndpoint(connection.to, "input", layout);
    const line = createSvgElement("line", {
      x1: from.x,
      y1: from.y,
      x2: to.x,
      y2: to.y,
      "stroke-width": 1 + connection.weight,
      class: `connection${connection.weight >= 3 ? " hot" : ""}`,
      "marker-end":
        connection.weight >= 3
          ? "url(#criticalSignalArrow)"
          : "url(#signalArrow)",
    });
    const title = createSvgElement("title");
    title.textContent =
      `${connection.name}: ${endpointLabel(connection.from, layout)} output to ` +
      `${endpointLabel(connection.to, layout)} input, ${connection.signals.toLocaleString()} signals`;
    line.append(title);
    connectionsLayer.append(line);

    const requiredChannel =
      connection.scored === false
        ? null
        : requiredChannelForSignals(connection.signals);
    const labelWidth = requiredChannel ? 126 : 84;
    const labelX = (from.x + to.x) / 2;
    const labelY =
      (from.y + to.y) / 2 + (connection.labelOffsetY ?? 0);
    const label = createSvgElement("g", {
      class: "connection-label",
      transform: `translate(${labelX} ${labelY})`,
    });
    label.append(
      createSvgElement("rect", {
        x: -labelWidth / 2,
        y: -11,
        width: labelWidth,
        height: 22,
        rx: 11,
      }),
    );
    const labelText = createSvgElement("text", {
      x: 0,
      y: 4,
      "text-anchor": "middle",
    });
    labelText.textContent = requiredChannel
      ? `${connection.signals.toLocaleString()} sig · ${requiredChannel} μm`
      : `${connection.signals.toLocaleString()} signals`;
    label.append(labelText);
    connectionsLayer.append(label);
  });
}

function renderChannels() {
  channelsLayer.replaceChildren();
  const layout = visibleMacros();

  channelViolationsFor(layout).forEach((issue) => {
    const first = layout.find((macro) => macro.id === issue.firstId);
    const second =
      issue.secondId === "blockage"
        ? {
            ...BLOCKAGE,
            id: "blockage",
            name: "blockage",
          }
        : layout.find((macro) => macro.id === issue.secondId);
    const from = macroCenter(first);
    const to = macroCenter(second);
    const line = createSvgElement("line", {
      class: "channel-warning",
      x1: from.x,
      y1: from.y,
      x2: to.x,
      y2: to.y,
    });
    channelsLayer.append(line);

    const label = createSvgElement("g", {
      class: "channel-gap-label",
      transform: `translate(${(from.x + to.x) / 2} ${(from.y + to.y) / 2})`,
    });
    label.append(
      createSvgElement("rect", {
        x: -72,
        y: -12,
        width: 144,
        height: 24,
        rx: 5,
      }),
    );
    const text = createSvgElement("text", {
      x: 0,
      y: 4,
      "text-anchor": "middle",
    });
    text.textContent = `${issue.actual} μm gap · need ${issue.required} μm`;
    label.append(text);
    channelsLayer.append(label);
  });
}

function renderMacros() {
  macrosLayer.replaceChildren();
  const layout = visibleMacros();

  layout.forEach((macro) => {
    const violations = violationsFor(macro, layout);
    const hasHardViolation = violations.some(
      (violation) => violation !== "channel",
    );
    const placementClass = hasHardViolation
      ? "warning"
      : violations.includes("channel")
        ? "congested"
        : "valid";
    const group = createSvgElement("g", {
      class: `macro ${placementClass}${
        viewMode === "best" ? " reference" : ""
      }`,
      transform: `translate(${macro.x} ${macro.y})`,
      tabindex: viewMode === "best" ? "-1" : "0",
      role: viewMode === "best" ? "img" : "button",
      "aria-label": `${macro.name} macro, ${macro.width} by ${macro.height} micrometers`,
      "data-id": macro.id,
    });

    const body = createSvgElement("rect", {
      class: "macro-body",
      width: macro.width,
      height: macro.height,
      rx: 7,
    });
    group.append(body);

    group.append(
      createSvgElement("rect", {
        class: "macro-halo",
        x: -BASE_MACRO_SPACING / 2,
        y: -BASE_MACRO_SPACING / 2,
        width: macro.width + BASE_MACRO_SPACING,
        height: macro.height + BASE_MACRO_SPACING,
        rx: 11,
      }),
    );

    for (let x = 25; x < macro.width; x += 25) {
      group.append(
        createSvgElement("line", {
          class: "macro-grid",
          x1: x,
          y1: 9,
          x2: x,
          y2: macro.height - 9,
        }),
      );
    }

    const label = createSvgElement("text", {
      class: "macro-label",
      x: macro.width / 2,
      y: macro.height / 2 - 4,
    });
    label.textContent = macro.name;
    group.append(label);

    const size = createSvgElement("text", {
      class: "macro-size",
      x: macro.width / 2,
      y: macro.height / 2 + 19,
    });
    size.textContent = `${macro.width} × ${macro.height} μm`;
    group.append(size);

    const inputPin = createSvgElement("g", { class: "macro-port input-port" });
    inputPin.append(
      createSvgElement("circle", {
        cx: 0,
        cy: macro.height / 2,
        r: 7,
      }),
    );
    const inputLabel = createSvgElement("text", {
      x: 12,
      y: macro.height / 2 + 4,
    });
    inputLabel.textContent = "IN";
    inputPin.append(inputLabel);
    group.append(inputPin);

    const outputPin = createSvgElement("g", { class: "macro-port output-port" });
    outputPin.append(
      createSvgElement("circle", {
        cx: macro.width,
        cy: macro.height / 2,
        r: 7,
      }),
    );
    const outputLabel = createSvgElement("text", {
      x: macro.width - 12,
      y: macro.height / 2 + 4,
      "text-anchor": "end",
    });
    outputLabel.textContent = "OUT";
    outputPin.append(outputLabel);
    group.append(outputPin);

    if (viewMode === "player") {
      group.addEventListener("pointerdown", startDrag);
      group.addEventListener("keydown", moveWithKeyboard);
    }
    macrosLayer.append(group);
  });
}

function renderInventory() {
  const inventory = document.querySelector("#macroInventory");
  inventory.replaceChildren();
  const layout = visibleMacros();

  layout.forEach((macro) => {
    const violations = violationsFor(macro, layout);
    const item = document.createElement("div");
    item.className = "inventory-item";
    item.innerHTML = `
      <span class="inventory-name">
        <span class="inventory-dot"></span>${macro.name}
      </span>
      <span class="inventory-status ${violations.length ? "warning" : ""}">
        ${violations.length ? violations.join(" · ") : "channels clear"}
      </span>
    `;
    inventory.append(item);
  });

  const signalInventory = document.querySelector("#signalInventory");
  signalInventory.replaceChildren();
  connections.forEach((connection) => {
    const item = document.createElement("div");
    item.className = "signal-item";
    item.innerHTML = `
      <span>
        ${endpointLabel(connection.from, layout)}
        <b aria-hidden="true">→</b>
        ${endpointLabel(connection.to, layout)}
      </span>
      <strong>${
        connection.scored === false
          ? connection.signals.toLocaleString()
          : `${connection.signals.toLocaleString()} · ${requiredChannelForSignals(connection.signals)} μm`
      }</strong>
    `;
    item.title = connection.name;
    signalInventory.append(item);
  });
}

function gradeFor(score, violations) {
  if (violations > 0) return "D";
  if (score >= 850) return "A";
  if (score >= 700) return "B";
  if (score >= 550) return "C";
  return "D";
}

function setObjective(name, complete) {
  document
    .querySelector(`[data-objective="${name}"]`)
    .classList.toggle("complete", complete);
}

function updateInsight(metrics) {
  const title = document.querySelector("#insightTitle");
  const text = document.querySelector("#insightText");

  if (!metrics.allInside) {
    title.textContent = "Respect the core boundary";
    text.textContent =
      "A macro extending beyond the core cannot be placed legally. Move every block fully inside the outline.";
  } else if (!metrics.noOverlaps) {
    title.textContent = "Protect placement channels";
    text.textContent =
      "Overlapping macros and blocked areas leave no legal room for cells or routing. Separate the red blocks.";
  } else if (!metrics.channelsClear) {
    title.textContent = "Open the routing channels";
    text.textContent =
      "Orange macros are legally placed but too close together. Follow the gap labels and leave more space for their signal buses.";
  } else if (!metrics.wirelengthMet) {
    title.textContent = "Follow the critical connections";
    text.textContent =
      "The orange fly-lines have greater weight. Shortening them gives the largest wirelength improvement.";
  } else {
    title.textContent = "Floorplan objectives achieved";
    text.textContent =
      "This plan is legal and connected blocks are reasonably close. You are ready to check the result.";
  }
}

function updateMetrics() {
  const metrics = calculateMetrics();
  const totalViolations =
    metrics.invalidMacros +
    metrics.overlapPairs +
    metrics.channelIssues.length;

  document.querySelector("#scoreValue").textContent = metrics.score;
  document.querySelector("#gradeValue").textContent = gradeFor(
    metrics.score,
    totalViolations,
  );
  document.querySelector("#wirelengthValue").textContent =
    `${metrics.wirelength.toLocaleString()} μm`;
  document.querySelector("#utilizationValue").textContent =
    `${metrics.utilization}%`;
  document.querySelector("#violationsValue").textContent = totalViolations;
  document.querySelector("#congestionValue").textContent =
    `${metrics.congestionRisk}%`;

  document.querySelector("#wirelengthMeter").style.width =
    `${Math.min(100, (metrics.wirelength / 1800) * 100)}%`;
  document.querySelector("#utilizationMeter").style.width =
    `${Math.min(100, metrics.utilization * 2.5)}%`;
  document.querySelector("#violationsMeter").style.width =
    `${Math.min(100, totalViolations * 24)}%`;
  document.querySelector("#congestionMeter").style.width =
    `${metrics.congestionRisk}%`;

  setObjective("inside", metrics.allInside);
  setObjective("overlap", metrics.noOverlaps);
  setObjective("channels", metrics.channelsClear);
  setObjective("wirelength", metrics.wirelengthMet);
  updateInsight(metrics);

  const complete =
    metrics.allInside &&
    metrics.noOverlaps &&
    metrics.channelsClear &&
    metrics.wirelengthMet;
  const status = document.querySelector("#statusPill");
  status.textContent =
    viewMode === "best" ? "Best result" : complete ? "Objectives met" : "Planning";
  status.classList.toggle("ready", complete || viewMode === "best");

  renderInventory();
  return metrics;
}

function render() {
  renderConnections();
  renderChannels();
  renderMacros();
  updateMetrics();
}

function svgPoint(event) {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  return point.matrixTransform(svg.getScreenCTM().inverse());
}

function startDrag(event) {
  const macro = macros.find((item) => item.id === event.currentTarget.dataset.id);
  const point = svgPoint(event);

  activeDrag = {
    macro,
    startMetrics: calculateMetrics(),
    lastCommentaryAt: 0,
    offsetX: point.x - macro.x,
    offsetY: point.y - macro.y,
    element: event.currentTarget,
  };
  activeDrag.element.classList.add("dragging");
  activeDrag.element.setPointerCapture(event.pointerId);
  document.querySelector("#dragHint").classList.add("hidden");
  setCoachCommentary(
    `Moving ${macro.name}. Watch its fly-lines and keep the entire block inside the core.`,
  );
}

function updateDraggedMacro() {
  if (!activeDrag) return;

  activeDrag.element.setAttribute(
    "transform",
    `translate(${activeDrag.macro.x} ${activeDrag.macro.y})`,
  );
  const violations = violationsFor(activeDrag.macro);
  const hasHardViolation = violations.some(
    (violation) => violation !== "channel",
  );
  const hasChannelViolation = violations.includes("channel");
  activeDrag.element.classList.toggle("warning", hasHardViolation);
  activeDrag.element.classList.toggle(
    "congested",
    !hasHardViolation && hasChannelViolation,
  );
  activeDrag.element.classList.toggle(
    "valid",
    !hasHardViolation && !hasChannelViolation,
  );
  renderConnections();
  renderChannels();
  updateMetrics();
}

function drag(event) {
  if (!activeDrag) return;

  const point = svgPoint(event);
  activeDrag.macro.x =
    Math.round((point.x - activeDrag.offsetX) / SNAP_SIZE) * SNAP_SIZE;
  activeDrag.macro.y =
    Math.round((point.y - activeDrag.offsetY) / SNAP_SIZE) * SNAP_SIZE;
  updateDraggedMacro();

  const now = performance.now();
  if (now - activeDrag.lastCommentaryAt > 220) {
    activeDrag.lastCommentaryAt = now;
    commentOnMove(activeDrag.macro, activeDrag.startMetrics, false);
  }
}

function endDrag() {
  if (!activeDrag) return;
  const { macro, startMetrics } = activeDrag;
  activeDrag.element.classList.remove("dragging");
  activeDrag = null;
  render();
  commentOnMove(macro, startMetrics, true);
}

function moveWithKeyboard(event) {
  const allowedKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  if (!allowedKeys.includes(event.key)) return;

  event.preventDefault();
  const macro = macros.find((item) => item.id === event.currentTarget.dataset.id);
  const step = event.shiftKey ? SNAP_SIZE * 5 : SNAP_SIZE;

  if (event.key === "ArrowUp") macro.y -= step;
  if (event.key === "ArrowDown") macro.y += step;
  if (event.key === "ArrowLeft") macro.x -= step;
  if (event.key === "ArrowRight") macro.x += step;
  render();
  macrosLayer.querySelector(`[data-id="${macro.id}"]`)?.focus();
}

function showToast(message, failure = false) {
  const toast = document.querySelector("#resultToast");
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.toggle("failure", failure);
  toast.classList.add("show");
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 4200);
}

function prepareSpeechText(message) {
  return message.replace(/\bSRAM\b/g, "sram");
}

function speak(message) {
  if (!voiceEnabled || !("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();
  const narration = new SpeechSynthesisUtterance(prepareSpeechText(message));
  narration.rate = 0.98;
  narration.pitch = 1.08;
  window.speechSynthesis.speak(narration);
}

function setCoachCommentary(message, tone = "neutral", narrate = false) {
  const coach = document.querySelector(".live-coach");
  const commentary = document.querySelector("#coachCommentary");

  window.clearTimeout(commentaryTimer);
  commentary.textContent = message;
  coach.classList.toggle("warning", tone === "warning");
  coach.classList.toggle("positive", tone === "positive");

  if (narrate) speak(message);

  if (tone === "positive") {
    commentaryTimer = window.setTimeout(
      () => coach.classList.remove("positive"),
      550,
    );
  }
}

function commentOnMove(macro, startMetrics, finalMove) {
  const violations = violationsFor(macro);
  const metrics = calculateMetrics();
  const busiestConnection = connections
    .filter(
      (connection) =>
        connection.from === macro.id || connection.to === macro.id,
    )
    .sort((a, b) => b.signals - a.signals)[0];
  const connectedEndpoint =
    busiestConnection?.from === macro.id
      ? busiestConnection.to
      : busiestConnection?.from;
  let message;
  let tone = "neutral";

  if (violations.includes("outside")) {
    message = `${macro.name} crosses the core boundary. Pull the whole macro back inside the chip outline.`;
    tone = "warning";
  } else if (violations.includes("blockage")) {
    message = `${macro.name} is inside the reserved blockage. That region must remain empty for protected structures.`;
    tone = "warning";
  } else if (violations.includes("overlap")) {
    const other = macros.find(
      (candidate) =>
        candidate.id !== macro.id && rectanglesOverlap(macro, candidate),
    );
    message = `${macro.name} overlaps ${other?.name ?? "another macro"}. Separate them to restore legal placement.`;
    tone = "warning";
  } else if (violations.includes("channel")) {
    const issue = channelViolationsFor().find(
      (candidate) =>
        candidate.firstId === macro.id || candidate.secondId === macro.id,
    );
    const otherId =
      issue.firstId === macro.id ? issue.secondId : issue.firstId;
    message =
      `${macro.name} has only ${issue.actual} micrometers of channel space near ` +
      `${endpointLabel(otherId)}. This path needs ${issue.required} micrometers to reduce congestion.`;
    tone = "warning";
  } else {
    const improvement = startMetrics.wirelength - metrics.wirelength;
    if (
      metrics.allInside &&
      metrics.noOverlaps &&
      metrics.channelsClear &&
      metrics.wirelengthMet
    ) {
      message = `Excellent placement! The floorplan is legal and wirelength is now ${metrics.wirelength} micrometers—below the target.`;
      tone = "positive";
    } else if (improvement >= 80) {
      message = `Great move. ${macro.name} shortened the weighted connections by ${improvement} micrometers.`;
      tone = "positive";
    } else if (improvement > 10) {
      message = `Good direction. ${macro.name} improved wirelength by ${improvement} micrometers without creating a violation.`;
      tone = "positive";
    } else if (improvement < -80) {
      message = `${macro.name} is legal, but this move added ${Math.abs(improvement)} micrometers of wirelength. Try following the orange fly-lines.`;
    } else if (finalMove) {
      message =
        `${macro.name} is legally placed. Its busiest link connects to ` +
        `${endpointLabel(connectedEndpoint)} and carries ` +
        `${busiestConnection.signals.toLocaleString()} signals.`;
    } else {
      message = `${macro.name} is legal here. Weighted wirelength is ${metrics.wirelength} micrometers.`;
    }
  }

  setCoachCommentary(message, tone, finalMove);
}

function checkFloorplan() {
  const metrics = calculateMetrics();
  const passed =
    metrics.allInside &&
    metrics.noOverlaps &&
    metrics.channelsClear &&
    metrics.wirelengthMet;

  if (passed) {
    showToast(
      `Tape-out ready! Score ${metrics.score}. You built a legal floorplan with ${metrics.wirelength} μm weighted wirelength.`,
    );
  } else {
    const remaining = [
      !metrics.allInside && "keep every macro inside the core",
      !metrics.noOverlaps && "remove overlaps and blockage conflicts",
      !metrics.channelsClear &&
        `fix ${metrics.channelIssues.length} undersized routing channel${
          metrics.channelIssues.length === 1 ? "" : "s"
        }`,
      !metrics.wirelengthMet &&
        `reduce wirelength by ${metrics.wirelength - WIRELENGTH_TARGET} μm`,
    ].filter(Boolean);
    showToast(`Not ready yet: ${remaining.join("; ")}.`, true);
  }
}

function resetFloorplan() {
  macros = structuredClone(initialMacros);
  setViewMode("player");
  document.querySelector("#dragHint").classList.remove("hidden");
  render();
  showToast("Floorplan reset. Start again from the initial placement.");
}

function setViewMode(mode) {
  viewMode = mode;
  const bestMode = mode === "best";
  const playerTab = document.querySelector("#playerViewTab");
  const bestTab = document.querySelector("#bestViewTab");
  const checkButton = document.querySelector("#checkButton");

  playerTab.classList.toggle("active", !bestMode);
  playerTab.setAttribute("aria-selected", String(!bestMode));
  bestTab.classList.toggle("active", bestMode);
  bestTab.setAttribute("aria-selected", String(bestMode));
  document.querySelector("#bestResultBadge").hidden = !bestMode;
  document.querySelector("#dragHint").classList.toggle("hidden", bestMode);
  checkButton.disabled = bestMode;
  checkButton.textContent = bestMode
    ? "Reference floorplan"
    : "Check my floorplan";

  render();
  setCoachCommentary(
    bestMode
      ? "This compact legal arrangement reaches the maximum score. Compare its macro adjacency and short critical connections with your floorplan."
      : "Your floorplan is restored. Try applying what you observed without copying every coordinate.",
    bestMode ? "positive" : "neutral",
    false,
  );
}

function speakLessonStage() {
  const stage = lessonStages[lessonStageIndex];
  speak(`${stage.title}. ${stage.text} Key idea: ${stage.takeaway}`);
}

function renderLessonStage() {
  const stage = lessonStages[lessonStageIndex];
  const stageNumber = lessonStageIndex + 1;
  const progressDots = document.querySelector("#lessonProgressDots");

  document.querySelector("#lessonStageLabel").textContent =
    `ORIENTATION · ${stageNumber} OF ${lessonStages.length}`;
  document.querySelector("#lessonEyebrow").textContent = stage.eyebrow;
  document.querySelector("#lessonStageTitle").textContent = stage.title;
  document.querySelector("#lessonStageText").textContent = stage.text;
  document.querySelector("#lessonTakeaway p").textContent = stage.takeaway;
  document.querySelector("#lessonProgressText").textContent =
    `${stageNumber} / ${lessonStages.length}`;
  document.querySelector("#lessonBackButton").disabled = lessonStageIndex === 0;
  document.querySelector("#lessonNextButton").textContent =
    lessonStageIndex === lessonStages.length - 1
      ? "Enter the floorplan lab"
      : "Next concept";

  const conceptBoard = document.querySelector("#conceptBoard");
  conceptBoard.className = "concept-board";
  void conceptBoard.offsetWidth;
  conceptBoard.classList.add(stage.demo);
  document.querySelector("#tommyBubble").textContent = stage.bubble;
  document.querySelector("#boardLabel").textContent = stage.boardLabel;
  document.querySelector("#boardMetricLabel").textContent = stage.metricLabel;
  document.querySelector("#boardMetricValue").textContent = stage.metricValue;

  progressDots.replaceChildren();
  lessonStages.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = `progress-dot${index < lessonStageIndex ? " complete" : ""}${
      index === lessonStageIndex ? " active" : ""
    }`;
    dot.setAttribute("aria-label", `Go to lesson stage ${index + 1}`);
    dot.addEventListener("click", () => {
      lessonStageIndex = index;
      renderLessonStage();
    });
    progressDots.append(dot);
  });

  speakLessonStage();
}

function closeConceptLesson() {
  window.speechSynthesis?.cancel();
  conceptLesson.classList.add("hidden");
  document.body.classList.remove("lesson-open");
  document.querySelector("#floorplan").focus();
}

function openConceptLesson() {
  lessonStageIndex = 0;
  conceptLesson.classList.remove("hidden");
  document.body.classList.add("lesson-open");
  renderLessonStage();
}

function toggleVoice() {
  const voiceButton = document.querySelector("#voiceButton");
  const coachVoiceButton = document.querySelector("#coachVoiceButton");
  voiceEnabled = !voiceEnabled;
  voiceButton.classList.toggle("active", voiceEnabled);
  voiceButton.setAttribute("aria-pressed", String(voiceEnabled));
  voiceButton.innerHTML = `<span aria-hidden="true">◖))</span> Voice ${
    voiceEnabled ? "on" : "off"
  }`;
  coachVoiceButton.classList.toggle("active", voiceEnabled);
  coachVoiceButton.textContent = `Voice ${voiceEnabled ? "on" : "off"}`;

  if (voiceEnabled) {
    speakLessonStage();
  } else {
    window.speechSynthesis?.cancel();
  }
}

svg.addEventListener("pointermove", drag);
svg.addEventListener("pointerup", endDrag);
svg.addEventListener("pointercancel", endDrag);
document.querySelector("#checkButton").addEventListener("click", checkFloorplan);
document.querySelector("#resetButton").addEventListener("click", resetFloorplan);
document.querySelector("#helpButton").addEventListener("click", () => {
  helpDialog.showModal();
});
document.querySelector("#closeHelpButton").addEventListener("click", () => {
  helpDialog.close();
});
document.querySelector("#startButton").addEventListener("click", () => {
  helpDialog.close();
});
document.querySelector("#lessonBackButton").addEventListener("click", () => {
  lessonStageIndex = Math.max(0, lessonStageIndex - 1);
  renderLessonStage();
});
document.querySelector("#lessonNextButton").addEventListener("click", () => {
  if (lessonStageIndex === lessonStages.length - 1) {
    closeConceptLesson();
    return;
  }
  lessonStageIndex += 1;
  renderLessonStage();
});
document
  .querySelector("#skipLessonButton")
  .addEventListener("click", closeConceptLesson);
document.querySelector("#voiceButton").addEventListener("click", toggleVoice);
document
  .querySelector("#coachVoiceButton")
  .addEventListener("click", toggleVoice);
document
  .querySelector("#replayLessonButton")
  .addEventListener("click", openConceptLesson);
document
  .querySelector("#playerViewTab")
  .addEventListener("click", () => setViewMode("player"));
document
  .querySelector("#bestViewTab")
  .addEventListener("click", () => setViewMode("best"));

render();
renderLessonStage();
