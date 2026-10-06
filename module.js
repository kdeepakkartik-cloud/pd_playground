const moduleOrder = [
  "placement",
  "power",
  "cts",
  "routing",
  "timing",
  "signoff",
  "hierarchy",
  "budget",
  "sta",
  "blockages",
  "def",
];
const requestedModule = new URLSearchParams(window.location.search).get("module");
const moduleKey = moduleOrder.includes(requestedModule) ? requestedModule : "placement";

const commonLessons = {
  placement: [
    ["WHY PLACEMENT MATTERS", "Cells turn logic into geometry", "Millions of standard cells must enter legal rows without overlap.", "Placement controls wirelength, congestion, timing, and power.", "CELLS"],
    ["DENSITY", "Whitespace is a resource", "A tightly packed region leaves little room for routing and optimization.", "Spread cells enough to avoid local density hotspots.", "DENSITY"],
    ["CONNECTIVITY", "Place communicating cells nearby", "Shorter half-perimeter wirelength usually reduces delay and routing demand.", "Balance HPWL with legal row density.", "HPWL"],
  ],
  power: [
    ["POWER DELIVERY", "Every cell needs stable voltage", "Current travels from pads through rings, straps, vias, and rails.", "Weak coverage produces voltage drop at active regions.", "VDD / VSS"],
    ["IR DROP", "Resistance consumes voltage", "High-current hotspots far from straps experience the greatest drop.", "Place straps near hotspots and connect both directions.", "IR DROP"],
    ["TRADEOFF", "Metal is limited", "More straps improve delivery but consume routing resources.", "Meet coverage with the smallest practical network.", "METAL"],
  ],
  cts: [
    ["CLOCK DELIVERY", "The clock coordinates sequential logic", "Every register must receive a clean clock edge at nearly the same time.", "Clock quality directly affects setup and hold timing.", "CLOCK"],
    ["SKEW", "Arrival mismatch steals timing margin", "Skew is the difference between the earliest and latest clock arrivals.", "Balance branches rather than minimizing only one delay.", "SKEW"],
    ["BUFFERS", "Buffers reshape the tree", "Strategic clock buffers control transition, fanout, and branch delay.", "Use enough buffers to balance the tree without wasting power.", "BUFFER"],
  ],
  routing: [
    ["ROUTING", "Logical nets need physical paths", "Routers assign metal tracks and vias while obeying design rules.", "A connected net is not valid until its path is legal.", "ROUTE"],
    ["OBSTACLES", "Some tracks are unavailable", "Macros, blockages, and existing wires force detours.", "Plan around obstacles before entering a dead end.", "DRC"],
    ["QUALITY", "Short legal paths are preferred", "Long detours increase resistance, capacitance, and congestion.", "Reach the target with a compact path.", "LENGTH"],
  ],
  timing: [
    ["TIMING", "Data must arrive inside its window", "Setup checks late data; hold checks data that changes too early.", "Both checks must pass before signoff.", "SLACK"],
    ["SETUP FIXES", "Speed up the data path", "Upsizing, buffering, and route shortening can improve setup slack.", "Every fix has power, area, and hold consequences.", "SETUP"],
    ["HOLD FIXES", "Delay an overly fast path", "Dedicated delay cells or route detours can repair hold.", "Never fix one check without rechecking the other.", "HOLD"],
  ],
  signoff: [
    ["SIGNOFF", "Verification protects tape-out", "The final database must satisfy physical, electrical, and timing rules.", "A clean summary can still hide local violations.", "VERIFY"],
    ["DIAGNOSIS", "Different failures need different fixes", "A DRC error, antenna violation, timing path, and IR hotspot have different root causes.", "Match the repair to the violated rule.", "DEBUG"],
    ["TAPE-OUT", "Zero unresolved critical violations", "Signoff reviews confirm manufacturability and operating reliability.", "Resolve every reported issue before release.", "GDS"],
  ],
  hierarchy: [
    ["DIVIDE AND CONQUER", "Large chips become smaller blocks", "Physical hierarchy lets teams implement blocks independently and in parallel.", "Smaller databases reduce memory use and tool runtime.", "BLOCKS"],
    ["PHYSICAL PARTITION", "Boundaries create interfaces", "Block size, shape, location, and pin positions affect top-level routing and timing.", "Logical and physical hierarchy should remain correlated.", "PINS"],
    ["TOP-LEVEL INTEGRATION", "Finished blocks become black boxes", "Abstract views preserve interface information while hiding internal implementation.", "Minimize cross-block traffic and verify the integrated chip.", "ASSEMBLE"],
  ],
  budget: [
    ["CHIP REQUIREMENT", "One path crosses several blocks", "The top-level cycle time must be divided among block delays and interconnect.", "Every block owner needs a realistic boundary constraint.", "1000 ps"],
    ["UNDER-BUDGET", "Too little time makes closure impossible", "A block budget below its intrinsic delay creates negative slack before routing margin.", "Use physical estimates before assigning budgets.", "TOO LOW"],
    ["OVER-BUDGET", "Too much time wastes shared slack", "Excess budget in one block can starve another block or global wiring.", "Iterate top-down and bottom-up with explicit margin.", "BALANCE"],
  ],
  sta: [
    ["ANALYSIS INPUTS", "STA begins with trusted data", "Netlist, timing libraries, constraints, and delay information describe the design and environment.", "Missing or estimated data reduces analysis accuracy.", "INPUTS"],
    ["ANALYSIS SETUP", "Select modes, corners, and checks", "Setup, hold, recovery, removal, transition, capacitance, and fanout checks serve different purposes.", "Analysis conditions must match the intended scenario.", "CHECKS"],
    ["REPORT AND DEBUG", "Coverage matters as much as slack", "Reports expose clocks, constraints, unconstrained paths, bottlenecks, and timing paths.", "A timing run is useful only when its setup is complete and checked.", "REPORTS"],
  ],
  blockages: [
    ["PLACEMENT CONTROL", "Reserve space for implementation", "Placement restrictions protect channels, optimization space, and sensitive regions.", "Choose the least restrictive blockage that solves the problem.", "PLACE"],
    ["ROUTING CONTROL", "Protect layers and net classes", "Routing blockages can target selected metal layers or signal classes while allowing other resources.", "Apply restrictions only where they are physically justified.", "ROUTE"],
    ["INSTANCE KEEPOUT", "Constraints can move with macros", "A macro halo travels with its instance and preserves local access wherever the macro is placed.", "Area-based and instance-based constraints solve different problems.", "HALO"],
  ],
  def: [
    ["PHYSICAL EXCHANGE", "DEF describes an implemented design", "It records chip-level geometry, placement, pins, blockages, and routed connectivity in text form.", "DEF complements library geometry supplied through LEF.", "DEF"],
    ["STRUCTURE", "Each section has one responsibility", "DIEAREA, ROWS, TRACKS, COMPONENTS, PINS, BLOCKAGES, NETS, and SPECIALNETS organize layout data.", "Read the section name before interpreting a record.", "SECTIONS"],
    ["HANDOFF", "Physical data moves between tools", "Place-and-route output can feed extraction, power analysis, verification, and other downstream steps.", "A consistent physical database enables reliable handoff.", "EXPORT"],
  ],
};

const modules = {
  placement: {
    number: "MODULE 02",
    title: "Standard-Cell Placement",
    missionTitle: "Legalize and optimize the cells",
    missionText: "Select a cell, then select another slot to move or swap it. Reduce HPWL without putting more than five cells in one row.",
    tip: "Connected cells want proximity, but uniformly spreading every cell can make important nets longer.",
    objectives: ["All cells in legal rows", "HPWL at or below 300", "No row above five cells"],
  },
  power: {
    number: "MODULE 03",
    title: "Power Planning",
    missionTitle: "Deliver power to every hotspot",
    missionText: "Choose horizontal or vertical mode, then click tiles to add and remove power straps. Cover all hotspots using no more than five straps.",
    tip: "A hotspot is covered when a horizontal or vertical strap crosses its tile.",
    objectives: ["Cover all four hotspots", "Use five straps or fewer", "Reduce estimated IR drop below 25 mV"],
  },
  cts: {
    number: "MODULE 04",
    title: "Clock-Tree Synthesis",
    missionTitle: "Balance four clock sinks",
    missionText: "Toggle candidate clock buffers to bring all sink arrival times within 15 ps while using no more than four buffers.",
    tip: "The fastest branch may need delay while the slowest branch may need assistance.",
    objectives: ["Clock skew at or below 15 ps", "Use four buffers or fewer", "All sink arrivals below 270 ps"],
  },
  routing: {
    number: "MODULE 05",
    title: "Signal Routing",
    missionTitle: "Connect source to target",
    missionText: "Build a continuous route one neighboring grid cell at a time. Avoid blocked tracks and keep the path to 12 steps or fewer.",
    tip: "Select the previous path cell to backtrack when you enter a dead end.",
    objectives: ["Reach the target", "Avoid every blockage", "Use 12 steps or fewer"],
  },
  timing: {
    number: "MODULE 06",
    title: "Timing Closure",
    missionTitle: "Close setup and hold together",
    missionText: "Apply engineering changes to make both slacks non-negative while keeping added power at or below 25 units.",
    tip: "Some setup fixes worsen hold. Recalculate both checks after every ECO.",
    objectives: ["Setup slack at or above 0 ps", "Hold slack at or above 0 ps", "Added power at or below 25"],
  },
  signoff: {
    number: "MODULE 07",
    title: "Signoff Challenge",
    missionTitle: "Clear the tape-out report",
    missionText: "Inspect each violation and choose the technically appropriate correction.",
    tip: "Treat the reported symptom, but choose a fix that addresses its physical root cause.",
    objectives: ["Resolve all five violations", "Make no incorrect fixes", "Reach tape-out ready state"],
  },
  hierarchy: {
    number: "MODULE 08",
    title: "Hierarchical Design Flow",
    missionTitle: "Partition the chip into blocks",
    missionText: "Click each function to assign it to Block A, B, or C. Balance block size and keep strongly connected functions together.",
    tip: "Parallel block implementation helps runtime, but excessive cross-block nets make top-level integration harder.",
    objectives: ["Use all three blocks", "Keep each block load at or below 5", "Limit cross-block connections to two"],
  },
  budget: {
    number: "MODULE 09",
    title: "Block Timing Budgeting",
    missionTitle: "Allocate a 1,000 ps path budget",
    missionText: "Adjust each block in 50 ps steps. Meet its minimum delay requirement while preserving at least 150 ps for global interconnect and uncertainty.",
    tip: "An under-budgeted block cannot close; an over-budgeted block consumes time another block or wire may need.",
    objectives: ["Meet every block minimum", "Keep total allocation at 1,000 ps", "Reserve at least 150 ps margin"],
  },
  sta: {
    number: "MODULE 10",
    title: "STA with EDA Tools",
    missionTitle: "Configure a post-layout timing run",
    missionText: "Select the required inputs, checks, and reports for a complete post-layout static timing analysis.",
    tip: "A report_timing result is not trustworthy when clocks, constraints, libraries, or parasitics are missing.",
    objectives: ["Select all required input data", "Enable the required timing checks", "Request setup-quality reports"],
  },
  blockages: {
    number: "MODULE 11",
    title: "Blockage Engineering",
    missionTitle: "Choose the correct physical constraint",
    missionText: "Read each implementation scenario and select the most appropriate placement, routing, keepout, or fill restriction.",
    tip: "Placement restrictions control objects and density; routing restrictions control layers or net classes.",
    objectives: ["Solve all eight scenarios", "Make no incorrect selections", "Use placement, routing, and fill constraints"],
  },
  def: {
    number: "MODULE 12",
    title: "DEF Explorer",
    missionTitle: "Map layout data to DEF sections",
    missionText: "For each physical-design record, choose the DEF section that stores that information.",
    tip: "Think of DEF as the chip-level assembly description and LEF as reusable library geometry.",
    objectives: ["Match all seven records", "Make no incorrect selections", "Identify placement and routing data"],
  },
};

const config = modules[moduleKey];
let lessonIndex = 0;
let labState;

function setText(id, value) {
  document.querySelector(`#${id}`).textContent = value;
}

function renderLesson() {
  const lessons = commonLessons[moduleKey];
  const [kicker, title, text, speech, word] = lessons[lessonIndex];
  setText("lessonKicker", kicker);
  setText("lessonTitle", title);
  setText("lessonText", text);
  setText("moduleSpeech", speech);
  setText("demoWord", word);
  document.querySelector("#demoScreen").className = `demo-screen ${moduleKey}`;
  document.querySelector("#moduleLessonBack").disabled = lessonIndex === 0;
  setText(
    "moduleLessonNext",
    lessonIndex === lessons.length - 1 ? "Enter lab" : "Next",
  );

  const dots = document.querySelector("#moduleLessonDots");
  dots.replaceChildren();
  lessons.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = index === lessonIndex ? "active" : "";
    dot.setAttribute("aria-label", `Lesson ${index + 1}`);
    dot.addEventListener("click", () => {
      lessonIndex = index;
      renderLesson();
    });
    dots.append(dot);
  });
}

function closeLesson() {
  document.querySelector("#moduleLesson").classList.add("hidden");
  document.body.classList.remove("lesson-open");
}

function openLesson() {
  lessonIndex = 0;
  renderLesson();
  document.querySelector("#moduleLesson").classList.remove("hidden");
  document.body.classList.add("lesson-open");
}

function renderObjectives(completed = []) {
  const container = document.querySelector("#moduleObjectives");
  container.replaceChildren();
  config.objectives.forEach((objective, index) => {
    const item = document.createElement("div");
    item.className = `objective${completed[index] ? " complete" : ""}`;
    item.innerHTML = `<span class="objective-icon">✓</span><span>${objective}</span>`;
    container.append(item);
  });
}

function updateResults({ score, metrics, objectives, complete, commentary }) {
  setText("moduleScore", Math.min(1000, Math.max(0, Math.round(score))));
  setText("labStatus", complete ? "Objectives met" : "In progress");
  setText("moduleCommentary", commentary);
  renderObjectives(objectives);
  const panel = document.querySelector("#moduleMetrics");
  panel.replaceChildren();
  metrics.forEach(([label, value]) => {
    const row = document.createElement("div");
    row.className = "module-metric";
    row.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    panel.append(row);
  });
}

const placementCells = ["A", "B", "C", "D", "E", "F", "G", "H"];
const placementNets = [["A", "B"], ["A", "C"], ["B", "D"], ["C", "D"], ["D", "E"], ["E", "F"], ["G", "H"]];

function placementMetrics() {
  const positions = labState.positions;
  const hpwl = placementNets.reduce((sum, [a, b]) => {
    const ar = Math.floor(positions[a] / 8);
    const ac = positions[a] % 8;
    const br = Math.floor(positions[b] / 8);
    const bc = positions[b] % 8;
    return sum + (Math.abs(ar - br) * 50 + Math.abs(ac - bc) * 25);
  }, 0);
  const rowCounts = [0, 0];
  Object.values(positions).forEach((slot) => rowCounts[Math.floor(slot / 8)]++);
  const maxDensity = Math.max(...rowCounts);
  const objectives = [Object.keys(positions).length === 8, hpwl <= 300, maxDensity <= 5];
  return {
    score: 1000 - Math.max(0, hpwl - 200) * 1.7 - Math.max(0, maxDensity - 5) * 180,
    metrics: [["HPWL", `${hpwl} μm`], ["Row density", `${rowCounts.join(" / ")} cells`], ["Placed cells", "8 / 8"]],
    objectives,
    complete: objectives.every(Boolean),
    commentary: hpwl <= 300
      ? "Tommy: Nice clustering. The important nets are short without overfilling a row."
      : "Tommy: Follow the connected letter pairs and reduce their row and column distance.",
  };
}

function renderPlacement() {
  const canvas = document.querySelector("#labCanvas");
  canvas.innerHTML = `<div class="placement-grid">${Array.from({ length: 16 }, (_, slot) => {
    const cell = placementCells.find((id) => labState.positions[id] === slot);
    return `<button class="placement-slot" data-slot="${slot}">${
      cell ? `<span class="placement-cell${labState.selected === cell ? " selected" : ""}" data-cell="${cell}">${cell}</span>` : ""
    }</button>`;
  }).join("")}</div>`;
  canvas.querySelectorAll(".placement-slot").forEach((slot) => {
    slot.addEventListener("click", () => {
      const index = Number(slot.dataset.slot);
      const occupant = placementCells.find((id) => labState.positions[id] === index);
      if (!labState.selected) {
        labState.selected = occupant ?? null;
      } else if (occupant === labState.selected) {
        labState.selected = null;
      } else {
        const oldSlot = labState.positions[labState.selected];
        labState.positions[labState.selected] = index;
        if (occupant) labState.positions[occupant] = oldSlot;
        labState.selected = null;
      }
      renderPlacement();
    });
  });
  updateResults(placementMetrics());
}

function powerMetrics() {
  const hotspots = [[1, 1], [2, 4], [4, 2], [5, 5]];
  const covered = hotspots.filter(([row, col]) => labState.rows.has(row) || labState.cols.has(col)).length;
  const straps = labState.rows.size + labState.cols.size;
  const irDrop = Math.max(12, 115 - covered * 24 + Math.max(0, straps - 5) * 4);
  const objectives = [covered === 4, straps <= 5, irDrop < 25];
  return {
    score: 250 + covered * 190 - Math.max(0, straps - 5) * 90,
    metrics: [["Hotspots covered", `${covered} / 4`], ["Power straps", `${straps} / 5`], ["Worst IR drop", `${irDrop} mV`]],
    objectives,
    complete: objectives.every(Boolean),
    commentary: covered === 4
      ? "Tommy: Every hotspot has a nearby power path. Now avoid unnecessary straps."
      : "Tommy: Red hotspots need either a horizontal or vertical strap crossing their tile.",
  };
}

function renderPower() {
  const canvas = document.querySelector("#labCanvas");
  const hotspots = new Set(["1-1", "2-4", "4-2", "5-5"]);
  canvas.innerHTML = `<div class="power-controls">
    <button class="button ${labState.mode === "row" ? "button-primary" : "button-secondary"}" data-mode="row">Horizontal strap</button>
    <button class="button ${labState.mode === "col" ? "button-primary" : "button-secondary"}" data-mode="col">Vertical strap</button>
  </div><div class="power-grid">${Array.from({ length: 36 }, (_, index) => {
    const row = Math.floor(index / 6), col = index % 6;
    return `<button class="power-tile${hotspots.has(`${row}-${col}`) ? " hot" : ""}${labState.rows.has(row) ? " strap-row" : ""}${labState.cols.has(col) ? " strap-col" : ""}" data-row="${row}" data-col="${col}" aria-label="Power tile row ${row + 1}, column ${col + 1}"></button>`;
  }).join("")}</div>`;
  canvas.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => {
    labState.mode = button.dataset.mode;
    renderPower();
  }));
  canvas.querySelectorAll(".power-tile").forEach((tile) => tile.addEventListener("click", () => {
    const set = labState.mode === "row" ? labState.rows : labState.cols;
    const value = Number(tile.dataset[labState.mode]);
    set.has(value) ? set.delete(value) : set.add(value);
    renderPower();
  }));
  updateResults(powerMetrics());
}

const clockBuffers = [
  { name: "Delay A", effect: [60, 0, 0, 0] },
  { name: "Tune B", effect: [0, 10, 0, 0] },
  { name: "Boost C", effect: [0, 0, -10, 0] },
  { name: "Boost D", effect: [0, 0, 0, -60] },
  { name: "Common trunk", effect: [15, 15, 15, 15] },
  { name: "Extra delay", effect: [0, 35, 0, 0] },
];

function ctsMetrics() {
  const arrivals = [180, 230, 250, 300];
  labState.buffers.forEach((index) => clockBuffers[index].effect.forEach((value, sink) => arrivals[sink] += value));
  const skew = Math.max(...arrivals) - Math.min(...arrivals);
  const objectives = [skew <= 15, labState.buffers.size <= 4, Math.max(...arrivals) < 270];
  return {
    score: 1000 - skew * 4 - Math.max(0, labState.buffers.size - 4) * 100,
    metrics: [["Clock skew", `${skew} ps`], ["Sink arrivals", arrivals.join(" / ") + " ps"], ["Buffers used", `${labState.buffers.size} / 4`]],
    objectives,
    complete: objectives.every(Boolean),
    commentary: skew <= 15
      ? "Tommy: The clock leaves are balanced. Check that latency and buffer count are still acceptable."
      : `Tommy: The earliest and latest sinks differ by ${skew} ps. Tune the outlying branches.`,
  };
}

function renderCts() {
  const canvas = document.querySelector("#labCanvas");
  const sinkPositions = [[500, 25], [560, 145], [560, 285], [500, 405]];
  const bufferPositions = [[210, 55], [320, 125], [405, 205], [320, 315], [205, 385], [440, 105]];
  canvas.innerHTML = `<div class="cts-tree">
    <div class="clock-source">CLK</div>
    ${sinkPositions.map(([x,y], i) => `<div class="clock-sink" style="left:${x}px;top:${y}px">FF${i + 1}</div>`).join("")}
    ${bufferPositions.map(([x,y], i) => `<button class="buffer-node${labState.buffers.has(i) ? " active" : ""}" style="left:${x}px;top:${y}px" data-buffer="${i}" title="${clockBuffers[i].name}">B${i + 1}</button>`).join("")}
    <span class="tree-line" style="left:82px;top:236px;width:425px"></span>
  </div>`;
  canvas.querySelectorAll(".buffer-node").forEach((button) => button.addEventListener("click", () => {
    const index = Number(button.dataset.buffer);
    labState.buffers.has(index) ? labState.buffers.delete(index) : labState.buffers.add(index);
    renderCts();
  }));
  updateResults(ctsMetrics());
}

const routeRows = 7;
const routeCols = 10;
const routeSource = 30;
const routeTarget = 39;
const routeBlocked = new Set([33, 34, 35, 25, 15, 47, 57]);

function routingMetrics() {
  const reached = labState.path.at(-1) === routeTarget;
  const steps = labState.path.length - 1;
  const objectives = [reached, true, reached && steps <= 12];
  return {
    score: reached ? 1000 - Math.max(0, steps - 9) * 45 : Math.min(700, steps * 45),
    metrics: [["Connected", reached ? "Yes" : "No"], ["Route length", `${steps} steps`], ["Blocked cells used", "0"]],
    objectives,
    complete: objectives.every(Boolean),
    commentary: reached
      ? `Tommy: Connection complete in ${steps} steps. Shorter paths consume fewer routing resources.`
      : "Tommy: Extend the blue path through an adjacent legal track toward the yellow target.",
  };
}

function renderRouting() {
  const canvas = document.querySelector("#labCanvas");
  canvas.innerHTML = `<div class="route-grid">${Array.from({ length: routeRows * routeCols }, (_, index) => {
    const classes = ["route-cell"];
    if (routeBlocked.has(index)) classes.push("blocked");
    if (labState.path.includes(index)) classes.push("path");
    if (index === routeSource) classes.push("source");
    if (index === routeTarget) classes.push("target");
    return `<button class="${classes.join(" ")}" data-index="${index}">${index === routeSource ? "SRC" : index === routeTarget ? "DST" : ""}</button>`;
  }).join("")}</div>`;
  canvas.querySelectorAll(".route-cell").forEach((cell) => cell.addEventListener("click", () => {
    const index = Number(cell.dataset.index);
    if (routeBlocked.has(index) || index === routeSource) return;
    const last = labState.path.at(-1);
    const previous = labState.path.at(-2);
    if (index === previous) labState.path.pop();
    else {
      const lr = Math.floor(last / routeCols), lc = last % routeCols;
      const ir = Math.floor(index / routeCols), ic = index % routeCols;
      if (Math.abs(lr - ir) + Math.abs(lc - ic) === 1 && !labState.path.includes(index)) labState.path.push(index);
    }
    renderRouting();
  }));
  updateResults(routingMetrics());
}

const timingActions = [
  { id: "upsize", name: "Upsize critical cell", setup: 90, hold: -20, power: 12 },
  { id: "route", name: "Shorten critical route", setup: 75, hold: -10, power: 0 },
  { id: "setupBuffer", name: "Add data buffer", setup: 55, hold: 10, power: 7 },
  { id: "holdBuffer", name: "Insert hold buffer", setup: -20, hold: 70, power: 4 },
  { id: "skew", name: "Useful clock skew", setup: 25, hold: 15, power: 3 },
];

function timingMetrics() {
  let setup = -160, hold = -50, power = 0;
  labState.actions.forEach((id) => {
    const action = timingActions.find((item) => item.id === id);
    setup += action.setup; hold += action.hold; power += action.power;
  });
  const objectives = [setup >= 0, hold >= 0, power <= 25];
  return {
    score: 500 + Math.min(250, Math.max(0, setup + 160)) + Math.min(250, Math.max(0, hold + 50)) - Math.max(0, power - 25) * 25,
    metrics: [["Setup slack", `${setup} ps`], ["Hold slack", `${hold} ps`], ["Added power", `${power} / 25`]],
    objectives,
    complete: objectives.every(Boolean),
    commentary: objectives.every(Boolean)
      ? "Tommy: Both timing checks pass within the power budget. That is timing closure."
      : "Tommy: Recheck setup, hold, and power together before choosing the next ECO.",
  };
}

function renderTiming() {
  const canvas = document.querySelector("#labCanvas");
  canvas.innerHTML = `<div class="timing-path"><span class="timing-stage">FF START</span><span class="timing-arrow">→</span><span class="timing-stage">COMB LOGIC</span><span class="timing-arrow">→</span><span class="timing-stage">LONG NET</span><span class="timing-arrow">→</span><span class="timing-stage">FF END</span></div>
    <div class="action-grid">${timingActions.map((action) => `<button class="action-card${labState.actions.has(action.id) ? " used" : ""}" data-action="${action.id}"><strong>${action.name}</strong><span>Setup ${action.setup >= 0 ? "+" : ""}${action.setup} ps · Hold ${action.hold >= 0 ? "+" : ""}${action.hold} ps · Power +${action.power}</span></button>`).join("")}</div>`;
  canvas.querySelectorAll(".action-card").forEach((button) => button.addEventListener("click", () => {
    const id = button.dataset.action;
    labState.actions.has(id) ? labState.actions.delete(id) : labState.actions.add(id);
    renderTiming();
  }));
  updateResults(timingMetrics());
}

const signoffIssues = [
  { id: "spacing", title: "M4 spacing DRC", correct: "spread", options: [["spread", "Move wires apart"], ["resize", "Upsize driver"], ["strap", "Add power strap"]] },
  { id: "antenna", title: "Gate antenna violation", correct: "diode", options: [["shield", "Add shield"], ["diode", "Insert antenna diode"], ["density", "Add filler cells"]] },
  { id: "setup", title: "Setup timing violation", correct: "speed", options: [["speed", "Optimize data path"], ["delay", "Insert hold delay"], ["block", "Add blockage"]] },
  { id: "hold", title: "Hold timing violation", correct: "delay", options: [["route", "Shorten route"], ["delay", "Add data-path delay"], ["widen", "Widen power ring"]] },
  { id: "irdrop", title: "Dynamic IR-drop hotspot", correct: "power", options: [["power", "Strengthen local power grid"], ["diode", "Insert antenna diode"], ["halo", "Remove macro halo"]] },
];

function signoffMetrics() {
  const solved = signoffIssues.filter((issue) => labState.answers[issue.id] === issue.correct).length;
  const wrong = Object.entries(labState.answers).filter(([id, answer]) => signoffIssues.find((issue) => issue.id === id).correct !== answer).length;
  const objectives = [solved === 5, wrong === 0, solved === 5 && wrong === 0];
  return {
    score: solved * 200 - wrong * 75,
    metrics: [["Violations resolved", `${solved} / 5`], ["Incorrect fixes", wrong], ["Tape-out status", solved === 5 && wrong === 0 ? "READY" : "BLOCKED"]],
    objectives,
    complete: objectives.every(Boolean),
    commentary: solved === 5 && wrong === 0
      ? "Tommy: Signoff is clean. The design is ready for tape-out review."
      : "Tommy: Match each symptom to its root cause. Incorrect fixes can create new violations.",
  };
}

function renderSignoff() {
  const canvas = document.querySelector("#labCanvas");
  canvas.innerHTML = `<div class="signoff-list">${signoffIssues.map((issue) => {
    const solved = labState.answers[issue.id] === issue.correct;
    return `<article class="signoff-issue${solved ? " solved" : ""}"><header><strong>${issue.title}</strong><span>${solved ? "RESOLVED" : "OPEN"}</span></header><div class="fix-options">${issue.options.map(([id,label]) => `<button data-issue="${issue.id}" data-fix="${id}">${label}</button>`).join("")}</div></article>`;
  }).join("")}</div>`;
  canvas.querySelectorAll("[data-fix]").forEach((button) => button.addEventListener("click", () => {
    labState.answers[button.dataset.issue] = button.dataset.fix;
    renderSignoff();
  }));
  updateResults(signoffMetrics());
}

const hierarchyUnits = [
  { id: "cpu", name: "CPU", load: 3 },
  { id: "l2", name: "L2 Cache", load: 2 },
  { id: "ddr", name: "DDR", load: 2 },
  { id: "gpu", name: "GPU", load: 3 },
  { id: "display", name: "Display", load: 1 },
  { id: "pcie", name: "PCIe", load: 1 },
];
const hierarchyNets = [
  ["cpu", "l2"],
  ["cpu", "ddr"],
  ["cpu", "gpu"],
  ["ddr", "pcie"],
  ["gpu", "display"],
];

function hierarchyMetrics() {
  const loads = ["A", "B", "C"].map((block) =>
    hierarchyUnits
      .filter((unit) => labState.assignments[unit.id] === block)
      .reduce((sum, unit) => sum + unit.load, 0),
  );
  const crossings = hierarchyNets.filter(
    ([from, to]) => labState.assignments[from] !== labState.assignments[to],
  ).length;
  const usedBlocks = new Set(Object.values(labState.assignments)).size;
  const objectives = [usedBlocks === 3, Math.max(...loads) <= 5, crossings <= 2];
  return {
    score:
      1000 -
      Math.max(0, Math.max(...loads) - 5) * 180 -
      Math.max(0, crossings - 2) * 130 -
      (3 - usedBlocks) * 150,
    metrics: [
      ["Block loads", loads.join(" / ")],
      ["Cross-block nets", crossings],
      ["Parallel blocks", `${usedBlocks} / 3`],
    ],
    objectives,
    complete: objectives.every(Boolean),
    commentary:
      crossings <= 2 && Math.max(...loads) <= 5
        ? "Tommy: Strong partition. Related functions stay together and every block remains manageable."
        : "Tommy: Keep communicating functions together, but do not overload one implementation block.",
  };
}

function renderHierarchy() {
  const canvas = document.querySelector("#labCanvas");
  canvas.innerHTML = `<div class="hierarchy-board">${["A", "B", "C"]
    .map(
      (block) => `<section class="hierarchy-column">
        <header>BLOCK ${block}</header>
        <div>${hierarchyUnits
          .filter((unit) => labState.assignments[unit.id] === block)
          .map(
            (unit) =>
              `<button class="hier-unit" data-unit="${unit.id}"><strong>${unit.name}</strong><span>Load ${unit.load} · click to move</span></button>`,
          )
          .join("")}</div>
      </section>`,
    )
    .join("")}</div>
    <div class="net-hint">Important links: CPU—L2, CPU—DDR, CPU—GPU, DDR—PCIe, GPU—Display</div>`;
  canvas.querySelectorAll(".hier-unit").forEach((button) =>
    button.addEventListener("click", () => {
      const id = button.dataset.unit;
      const order = ["A", "B", "C"];
      labState.assignments[id] =
        order[(order.indexOf(labState.assignments[id]) + 1) % order.length];
      renderHierarchy();
    }),
  );
  updateResults(hierarchyMetrics());
}

const blockNeeds = [350, 200, 250];

function budgetMetrics() {
  const totalBlocks = labState.budgets.reduce((sum, value) => sum + value, 0);
  const margin = 1000 - totalBlocks;
  const deficits = labState.budgets.map((value, index) =>
    Math.max(0, blockNeeds[index] - value),
  );
  const objectives = [
    deficits.every((value) => value === 0),
    totalBlocks + margin === 1000 && margin >= 0,
    margin >= 150,
  ];
  return {
    score:
      1000 -
      deficits.reduce((sum, value) => sum + value, 0) * 2 -
      Math.max(0, 150 - margin) * 2,
    metrics: [
      ["Allocated to blocks", `${totalBlocks} ps`],
      ["Interconnect margin", `${margin} ps`],
      ["Unmet block delay", `${deficits.reduce((a, b) => a + b, 0)} ps`],
    ],
    objectives,
    complete: objectives.every(Boolean),
    commentary: objectives.every(Boolean)
      ? "Tommy: Every block has enough time and the top level keeps a realistic interconnect margin."
      : "Tommy: Move budget away from over-allocated blocks and protect enough time for global wiring.",
  };
}

function renderBudget() {
  const canvas = document.querySelector("#labCanvas");
  const margin = 1000 - labState.budgets.reduce((sum, value) => sum + value, 0);
  canvas.innerHTML = `<div class="budget-total"><span>CHIP PATH</span><strong>1000 ps</strong></div>
    <div class="budget-grid">${labState.budgets
      .map(
        (value, index) => `<article class="budget-card${value < blockNeeds[index] ? " under" : ""}">
          <span>BLOCK ${index + 1}</span>
          <strong>${value} ps</strong>
          <small>Minimum ${blockNeeds[index]} ps</small>
          <div><button data-budget="${index}" data-delta="-50">− 50</button><button data-budget="${index}" data-delta="50">+ 50</button></div>
        </article>`,
      )
      .join("")}
      <article class="budget-card margin"><span>GLOBAL WIRES + MARGIN</span><strong>${margin} ps</strong><small>Target ≥ 150 ps</small></article>
    </div>`;
  canvas.querySelectorAll("[data-budget]").forEach((button) =>
    button.addEventListener("click", () => {
      const index = Number(button.dataset.budget);
      const next = labState.budgets[index] + Number(button.dataset.delta);
      const nextTotal =
        labState.budgets.reduce((sum, value) => sum + value, 0) -
        labState.budgets[index] +
        next;
      if (next >= 100 && next <= 600 && nextTotal <= 1000) {
        labState.budgets[index] = next;
        renderBudget();
      }
    }),
  );
  updateResults(budgetMetrics());
}

const staGroups = [
  {
    id: "inputs",
    title: "Input data",
    required: ["netlist", "liberty", "sdc", "spef", "corner"],
    options: [
      ["netlist", "Gate netlist"],
      ["liberty", "Timing libraries"],
      ["sdc", "SDC constraints"],
      ["spef", "SPEF parasitics"],
      ["corner", "PVT/OCV conditions"],
      ["wlm", "Wire-load model"],
    ],
  },
  {
    id: "checks",
    title: "Checks",
    required: ["setup", "hold", "transition", "capacitance", "fanout"],
    options: [
      ["setup", "Setup"],
      ["hold", "Hold"],
      ["transition", "Transition"],
      ["capacitance", "Capacitance"],
      ["fanout", "Fanout"],
      ["formal", "Formal equivalence"],
    ],
  },
  {
    id: "reports",
    title: "Reports",
    required: ["clock", "constraint", "coverage", "timing"],
    options: [
      ["clock", "Clock"],
      ["constraint", "Constraints"],
      ["coverage", "Analysis coverage"],
      ["timing", "Timing paths"],
      ["drc", "Physical DRC"],
    ],
  },
];

function staMetrics() {
  let requiredSelected = 0;
  let requiredTotal = 0;
  let extras = 0;
  const objectives = staGroups.map((group) => {
    requiredTotal += group.required.length;
    requiredSelected += group.required.filter((id) =>
      labState.selected[group.id].has(id),
    ).length;
    extras += [...labState.selected[group.id]].filter(
      (id) => !group.required.includes(id),
    ).length;
    return (
      group.required.every((id) => labState.selected[group.id].has(id)) &&
      [...labState.selected[group.id]].every((id) => group.required.includes(id))
    );
  });
  return {
    score: (requiredSelected / requiredTotal) * 1000 - extras * 80,
    metrics: [
      ["Required items", `${requiredSelected} / ${requiredTotal}`],
      ["Unnecessary items", extras],
      ["Analysis stage", "Post-layout"],
    ],
    objectives,
    complete: objectives.every(Boolean),
    commentary: objectives.every(Boolean)
      ? "Tommy: The post-layout STA run has complete data, checks, and coverage reports."
      : "Tommy: Build the analysis in order—load design data, constrain it, set conditions, validate, then report.",
  };
}

function renderSta() {
  const canvas = document.querySelector("#labCanvas");
  canvas.innerHTML = `<div class="choice-sections">${staGroups
    .map(
      (group) => `<section class="choice-section"><h3>${group.title}</h3><div>${group.options
        .map(
          ([id, label]) =>
            `<button class="choice-chip${labState.selected[group.id].has(id) ? " selected" : ""}" data-group="${group.id}" data-choice="${id}">${label}</button>`,
        )
        .join("")}</div></section>`,
    )
    .join("")}</div>`;
  canvas.querySelectorAll(".choice-chip").forEach((button) =>
    button.addEventListener("click", () => {
      const set = labState.selected[button.dataset.group];
      set.has(button.dataset.choice)
        ? set.delete(button.dataset.choice)
        : set.add(button.dataset.choice);
      renderSta();
    }),
  );
  updateResults(staMetrics());
}

const blockageScenarios = [
  { id: "channel", title: "Keep ordinary cells out of a narrow macro channel, but permit buffers and inverters.", correct: "nonbuffer" },
  { id: "density", title: "Limit a congested region to 50% standard-cell occupancy.", correct: "partial" },
  { id: "analog", title: "Prevent all routing on M3 and M4 above a noise-sensitive analog macro.", correct: "routingLayer" },
  { id: "macro", title: "Keep every movable object away from the edge of a hard macro.", correct: "halo" },
  { id: "reserve", title: "Reserve an area completely for future implementation.", correct: "hard" },
  { id: "optimize", title: "Discourage normal placement but allow the optimizer to use the region when necessary.", correct: "soft" },
  { id: "signal", title: "Block signal nets in a region while still allowing power and ground routes.", correct: "routingNet" },
  { id: "fill", title: "Prevent dummy metal fill over a sensitive circuit region.", correct: "fill" },
];
const blockageOptions = [
  ["hard", "Hard placement"],
  ["soft", "Soft placement"],
  ["nonbuffer", "Non-buffer placement"],
  ["partial", "Partial density"],
  ["routingLayer", "Layer routing"],
  ["routingNet", "Net-class routing"],
  ["halo", "Macro halo"],
  ["fill", "Metal-fill blockage"],
];

function matchingMetrics(items) {
  const solved = items.filter(
    (item) => labState.answers[item.id] === item.correct,
  ).length;
  const answered = Object.keys(labState.answers).length;
  const wrong = answered - solved;
  const used = new Set(Object.values(labState.answers));
  return { solved, wrong, used };
}

function blockageMetrics() {
  const { solved, wrong, used } = matchingMetrics(blockageScenarios);
  const objectives = [
    solved === blockageScenarios.length,
    wrong === 0,
    [...used].some((type) =>
      ["hard", "soft", "nonbuffer", "partial", "halo"].includes(type),
    ) &&
      [...used].some((type) => ["routingLayer", "routingNet"].includes(type)) &&
      used.has("fill"),
  ];
  return {
    score: solved * 125 - wrong * 50,
    metrics: [
      ["Scenarios solved", `${solved} / ${blockageScenarios.length}`],
      ["Incorrect choices", wrong],
      ["Constraint types used", used.size],
    ],
    objectives,
    complete: objectives.every(Boolean),
    commentary: objectives.every(Boolean)
      ? "Tommy: Excellent. Each region gets only the restriction needed for its physical purpose."
      : "Tommy: Ask whether the problem concerns cell placement, density, macro proximity, metal layers, or net classes.",
  };
}

function renderMatchingLab(items, options, metricFunction) {
  const canvas = document.querySelector("#labCanvas");
  canvas.innerHTML = `<div class="matching-list">${items
    .map((item) => {
      const solved = labState.answers[item.id] === item.correct;
      return `<article class="matching-card${solved ? " solved" : ""}"><p>${item.title}</p><div>${options
        .map(
          ([id, label]) =>
            `<button class="${labState.answers[item.id] === id ? "selected" : ""}" data-item="${item.id}" data-answer="${id}">${label}</button>`,
        )
        .join("")}</div></article>`;
    })
    .join("")}</div>`;
  canvas.querySelectorAll("[data-answer]").forEach((button) =>
    button.addEventListener("click", () => {
      labState.answers[button.dataset.item] = button.dataset.answer;
      renderMatchingLab(items, options, metricFunction);
    }),
  );
  updateResults(metricFunction());
}

function renderBlockages() {
  renderMatchingLab(blockageScenarios, blockageOptions, blockageMetrics);
}

const defRecords = [
  { id: "boundary", title: "Chip boundary coordinates", correct: "diearea" },
  { id: "instances", title: "Placed macros and standard-cell instances", correct: "components" },
  { id: "ports", title: "Top-level I/O locations and directions", correct: "pins" },
  { id: "keepouts", title: "Placement and routing keepout regions", correct: "blockages" },
  { id: "power", title: "Power and ground routing", correct: "specialnets" },
  { id: "signals", title: "Signal-net connectivity and routes", correct: "nets" },
  { id: "grid", title: "Placement rows and routing tracks", correct: "rows" },
];
const defOptions = [
  ["diearea", "DIEAREA"],
  ["components", "COMPONENTS"],
  ["pins", "PINS"],
  ["blockages", "BLOCKAGES"],
  ["specialnets", "SPECIALNETS"],
  ["nets", "NETS"],
  ["rows", "ROWS / TRACKS"],
];

function defMetrics() {
  const { solved, wrong } = matchingMetrics(defRecords);
  const selected = new Set(Object.values(labState.answers));
  const objectives = [
    solved === defRecords.length,
    wrong === 0,
    selected.has("components") && selected.has("nets"),
  ];
  return {
    score: (solved / defRecords.length) * 1000 - wrong * 55,
    metrics: [
      ["Records matched", `${solved} / ${defRecords.length}`],
      ["Incorrect matches", wrong],
      ["DEF sections used", selected.size],
    ],
    objectives,
    complete: objectives.every(Boolean),
    commentary: objectives.every(Boolean)
      ? "Tommy: You can now navigate the main physical sections of a DEF handoff."
      : "Tommy: Separate geometry, instances, ports, restrictions, power routes, and signal routes by responsibility.",
  };
}

function renderDef() {
  renderMatchingLab(defRecords, defOptions, defMetrics);
}

const labRenderers = {
  placement: renderPlacement,
  power: renderPower,
  cts: renderCts,
  routing: renderRouting,
  timing: renderTiming,
  signoff: renderSignoff,
  hierarchy: renderHierarchy,
  budget: renderBudget,
  sta: renderSta,
  blockages: renderBlockages,
  def: renderDef,
};

function resetState() {
  const states = {
    placement: { selected: null, positions: { A: 0, B: 7, C: 8, D: 15, E: 3, F: 12, G: 5, H: 10 } },
    power: { mode: "row", rows: new Set(), cols: new Set() },
    cts: { buffers: new Set() },
    routing: { path: [routeSource] },
    timing: { actions: new Set() },
    signoff: { answers: {} },
    hierarchy: {
      assignments: {
        cpu: "A",
        l2: "B",
        ddr: "C",
        gpu: "A",
        display: "B",
        pcie: "C",
      },
    },
    budget: { budgets: [300, 300, 300] },
    sta: {
      selected: {
        inputs: new Set(),
        checks: new Set(),
        reports: new Set(),
      },
    },
    blockages: { answers: {} },
    def: { answers: {} },
  };
  labState = states[moduleKey];
  labRenderers[moduleKey]();
}

function initialize() {
  document.title = `${config.title} · Physical Design Quest`;
  setText("moduleNumber", config.number);
  setText("moduleTitle", config.title);
  setText("missionTitle", config.missionTitle);
  setText("missionText", config.missionText);
  setText("moduleTip", config.tip);
  const visualConcept = {
    hierarchy: "floorplan", budget: "timing", sta: "timing",
    blockages: "floorplan", def: "floorplan",
  }[moduleKey] ?? moduleKey;
  document.querySelector("#moduleVisualGuide").href = `visual-guide.html#${visualConcept}`;
  renderObjectives([]);

  const index = moduleOrder.indexOf(moduleKey);
  const previous = document.querySelector("#previousModule");
  const next = document.querySelector("#nextModule");
  previous.href = index === 0 ? "index.html" : `module.html?module=${moduleOrder[index - 1]}`;
  previous.textContent = index === 0 ? "← Floorplanning" : "← Previous module";
  next.href = index === moduleOrder.length - 1 ? "course.html" : `module.html?module=${moduleOrder[index + 1]}`;
  next.textContent = index === moduleOrder.length - 1 ? "Course map →" : "Next module →";

  resetState();
  renderLesson();
}

document.querySelector("#moduleLessonBack").addEventListener("click", () => {
  lessonIndex = Math.max(0, lessonIndex - 1);
  renderLesson();
});
document.querySelector("#moduleLessonNext").addEventListener("click", () => {
  if (lessonIndex === commonLessons[moduleKey].length - 1) closeLesson();
  else {
    lessonIndex++;
    renderLesson();
  }
});
document.querySelector("#moduleLessonSkip").addEventListener("click", closeLesson);
document.querySelector("#replayModuleLesson").addEventListener("click", openLesson);
document.querySelector("#resetLab").addEventListener("click", resetState);
document.querySelector("#checkLab").addEventListener("click", () => {
  const result = ({
    placement: placementMetrics,
    power: powerMetrics,
    cts: ctsMetrics,
    routing: routingMetrics,
    timing: timingMetrics,
    signoff: signoffMetrics,
    hierarchy: hierarchyMetrics,
    budget: budgetMetrics,
    sta: staMetrics,
    blockages: blockageMetrics,
    def: defMetrics,
  })[moduleKey]();
  setText("moduleCommentary", result.complete ? "Tommy: Excellent—every objective is complete!" : "Tommy: Keep refining the design. The incomplete objectives show what to fix next.");
});

initialize();
