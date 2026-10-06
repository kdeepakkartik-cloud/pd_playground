const basicOrder = [
  "numbers",
  "logic",
  "sequential",
  "semiconductor",
  "cmos",
  "fabrication",
  "layout",
  "terminology",
  "hdl",
];
const requestedModule = new URLSearchParams(window.location.search).get("module");
const basicKey = basicOrder.includes(requestedModule) ? requestedModule : "numbers";

const lessons = {
  numbers: [
    ["DIGITAL LANGUAGE", "Bits represent physical states", "Binary uses two symbols because digital circuits distinguish two stable logic ranges.", "Each bit is a switch with a positional value.", "0 / 1"],
    ["POSITIONAL VALUE", "Every bit has a weight", "From right to left, binary weights are powers of two: 1, 2, 4, 8, and beyond.", "Add the weights of enabled bits.", "2ⁿ"],
    ["ARITHMETIC", "Hardware operates on encoded values", "Adders and other datapaths manipulate binary values using logic gates.", "Accurate conversion is the first digital-design skill.", "ADD"],
  ],
  logic: [
    ["BOOLEAN LOGIC", "Truth tables describe every gate", "Each row shows one input combination and the output produced by the symbol.", "Watch the highlighted row move through every possible input state.", "GATES"],
    ["AND GATE", "Both inputs must be high", "The AND output becomes 1 only for A = 1 and B = 1.", "AND is useful when multiple conditions must all be true.", "AND"],
    ["OR GATE", "Either high input can activate output", "The OR output is 1 when A, B, or both inputs are 1.", "OR combines alternative conditions.", "OR"],
    ["XOR AND NAND", "Gate families create different decisions", "XOR detects different inputs, while NAND inverts the AND result.", "NAND is a universal gate; XOR is common in arithmetic.", "XOR"],
    ["MULTIPLEXER", "Select one data input", "A select signal chooses whether D0 or D1 reaches Y.", "A multiplexer is a digitally controlled switch.", "MUX"],
  ],
  sequential: [
    ["STATE", "Sequential circuits remember", "Their output depends on current inputs and previously stored values.", "Storage elements turn logic into state machines.", "STATE"],
    ["CLOCK EDGE", "Flip-flops sample at defined moments", "A D flip-flop captures D on its active clock edge and holds Q between edges.", "Timing defines when data may safely change.", "D → Q"],
    ["SEQUENCE", "Registers build history", "Multiple captured bits form counters, pipelines, and protocol state.", "Drive D before the clock edge to create the target sequence.", "CLK"],
  ],
  semiconductor: [
    ["SILICON", "Conductivity can be engineered", "Pure semiconductor behavior changes when controlled impurities are introduced.", "Doping creates useful charge carriers.", "Si"],
    ["N-TYPE", "Donors provide electrons", "N-type regions use electrons as majority carriers.", "Device regions are formed through selective processing.", "e⁻"],
    ["P-TYPE", "Acceptors create holes", "P-type regions use holes as majority carriers.", "P-N junctions are fundamental building blocks.", "h⁺"],
  ],
  cmos: [
    ["MOS SWITCHES", "Gate voltage controls conduction", "The gate terminal controls whether a channel connects source and drain.", "MOS devices behave like voltage-controlled switches.", "MOS"],
    ["NMOS DEVICE", "NMOS turns on with a high gate", "When its gate is 1, NMOS conducts and can pull a node toward VSS.", "NMOS is strong at producing a logical low.", "NMOS"],
    ["PMOS DEVICE", "PMOS turns on with a low gate", "The gate bubble reminds us that PMOS responds to an active-low control.", "PMOS can pull a node toward VDD.", "PMOS"],
    ["CMOS INVERTER", "Complementary devices invert the input", "Only one transistor conducts strongly in each stable input state.", "Input 0 produces output 1; input 1 produces output 0.", "INV"],
    ["LOGIC LEVELS", "Noise margin protects data", "Valid low and high voltage ranges tolerate disturbance before logic becomes ambiguous.", "CMOS gates restore signals to strong digital levels.", "VIL / VIH"],
  ],
  fabrication: [
    ["PROCESS FLOW", "A chip is built layer by layer", "Oxidation, lithography, etch, implant, deposition, and contact formation create devices.", "Process order determines the final structure.", "WAFER"],
    ["ACTIVE DEVICES", "Wells, gates, and implants form transistors", "Gate oxide and polysilicon define channels before source/drain implants.", "Masks selectively modify the wafer.", "MOS"],
    ["INTERCONNECT", "Contacts connect silicon to metal", "Contacts and metal layers complete electrical connectivity above the devices.", "Front-end devices and back-end wiring form one chip.", "METAL"],
  ],
  layout: [
    ["LAYOUT", "Geometry becomes manufacturable masks", "Diffusion, poly, contacts, and metal represent device and wiring structures.", "Every drawn shape has a physical purpose.", "MASK"],
    ["DESIGN RULES", "Manufacturing needs geometric margin", "Minimum width, spacing, and enclosure rules account for process variation.", "DRC catches geometry that is difficult to manufacture.", "DRC"],
    ["AREA", "Legal does not mean compact", "Oversized features may pass rules but waste silicon and add capacitance.", "Meet every minimum without unnecessary area.", "AREA"],
  ],
  terminology: [
    ["DESIGN OBJECTS", "Cells, pins, and nets form connectivity", "Cells implement functions, pins expose terminals, and nets connect those terminals.", "Precise vocabulary makes reports easier to interpret.", "OBJECTS"],
    ["TIMING TERMS", "Delay and slew describe different behavior", "Propagation delay measures travel time; slew measures transition sharpness.", "Do not confuse arrival time with waveform quality.", "TIMING"],
    ["LIBRARIES", "Characterized cells enable analysis", "Libraries describe function, timing, power, and physical views.", "Tools rely on consistent models across the flow.", "LIB"],
  ],
  hdl: [
    ["RTL", "HDL describes intended hardware", "Verilog and VHDL express combinational logic, sequential state, hierarchy, and interfaces.", "Synthesis maps RTL intent into gates.", "RTL"],
    ["COMBINATIONAL CODE", "Outputs react without stored state", "Continuous assignments and combinational processes should define every output path.", "Incomplete assignment may infer unintended storage.", "COMB"],
    ["SEQUENTIAL CODE", "Clocked processes infer registers", "Nonblocking-style updates model simultaneous state changes at a clock edge.", "Coding style influences synthesized hardware.", "FF"],
  ],
};

const modules = {
  numbers: ["B01", "Number Systems & Arithmetic", "Build decimal 45 in binary", "Toggle the eight bit positions until their weighted sum equals 45.", "Start with the largest weight that fits, subtract it, and continue.", ["Binary value equals 45", "Use the correct 8-bit representation", "No extra bits enabled"]],
  logic: ["B02", "Logic Gates & Combinational Circuits", "Match behavior to logic", "Choose the gate or circuit that implements each Boolean behavior.", "Use the truth condition, not the symbol shape, to identify each function.", ["Solve all five behaviors", "Make no incorrect selections", "Identify the multiplexer"]],
  sequential: ["B03", "Sequential Circuits", "Capture the target register sequence", "Set D, then press the clock edge to produce Q = 1, 0, 1, 1.", "Q changes only when the active clock edge captures D.", ["Capture four values", "Match sequence 1, 0, 1, 1", "Use exactly four clock edges"]],
  semiconductor: ["B04", "Semiconductor Basics", "Classify semiconductor properties", "Match material and doping descriptions to intrinsic, N-type, or P-type behavior.", "Donor impurities contribute electrons; acceptors create holes.", ["Solve all five statements", "Make no incorrect selections", "Distinguish majority carriers"]],
  cmos: ["B05", "MOS Devices & CMOS Gates", "Verify a CMOS inverter", "For each input challenge, choose the expected output and capture the observation.", "A CMOS inverter produces the logical complement of its input.", ["Complete four observations", "Match every inverter output", "Observe both input states"]],
  fabrication: ["B06", "CMOS Fabrication", "Order the simplified process flow", "Move the process cards until wells, gates, implants, contacts, and metal appear in a valid order.", "Later layers depend on structures created earlier.", ["Place all eight steps", "Put gate oxide before polysilicon", "Match the complete process order"]],
  layout: ["B07", "CMOS Layout & Design Rules", "Create the smallest legal layout", "Increase poly width, contact spacing, and metal width until all minimum rules pass without excessive area.", "Meet the minimum values exactly for the most compact score.", ["Poly width at least 4 λ", "Contact spacing at least 3 λ", "Metal width at least 5 λ"]],
  terminology: ["B08", "VLSI Terminology", "Match the engineering vocabulary", "Connect each common VLSI term to its correct meaning.", "Ask whether the term describes function, connectivity, timing, or electrical capability.", ["Solve all seven terms", "Make no incorrect selections", "Distinguish delay from slew"]],
  hdl: ["B09", "Verilog & VHDL Foundations", "Connect HDL constructs to hardware", "Match each RTL construct to the hardware behavior it represents.", "Think about what hardware synthesis must create from each statement.", ["Solve all six constructs", "Make no incorrect selections", "Separate combinational and sequential RTL"]],
};

let lessonIndex = 0;
let state;
let voiceEnabled = false;
const config = modules[basicKey];

function prepareSpeech(message) {
  return message
    .replace(/\bCMOS\b/g, "see moss")
    .replace(/\bNMOS\b/g, "en moss")
    .replace(/\bPMOS\b/g, "pee moss")
    .replace(/\bVLSI\b/g, "V L S I")
    .replace(/\bHDL\b/g, "H D L");
}

function speak(message) {
  if (!voiceEnabled || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(prepareSpeech(message));
  utterance.rate = 0.95;
  utterance.pitch = 1.05;
  window.speechSynthesis.speak(utterance);
}

function syncVoiceButtons() {
  const lessonButton = document.querySelector("#basicVoiceButton");
  const labButton = document.querySelector("#basicLabVoice");
  lessonButton.textContent = `Voice ${voiceEnabled ? "on" : "off"}`;
  labButton.textContent = `Tommy voice ${voiceEnabled ? "on" : "off"}`;
  lessonButton.classList.toggle("active", voiceEnabled);
  labButton.classList.toggle("active", voiceEnabled);
  lessonButton.setAttribute("aria-pressed", String(voiceEnabled));
  labButton.setAttribute("aria-pressed", String(voiceEnabled));
}

function toggleVoice() {
  voiceEnabled = !voiceEnabled;
  syncVoiceButtons();
  if (!voiceEnabled) {
    window.speechSynthesis?.cancel();
    return;
  }
  const lessonVisible = !document
    .querySelector("#basicLesson")
    .classList.contains("hidden");
  if (lessonVisible) {
    const lesson = lessons[basicKey][lessonIndex];
    speak(`${lesson[1]}. ${lesson[2]} ${lesson[3]}`);
  } else {
    speak(document.querySelector("#basicCommentary").textContent);
  }
}

function gateSymbol(type, label = type.toUpperCase()) {
  const shapes = {
    and: `
      <path d="M24 18H52C76 18 88 29 88 45S76 72 52 72H24Z" />
      <path d="M5 32H24M5 58H24M88 45H108" />`,
    or: `
      <path d="M23 18Q44 45 23 72Q62 72 91 45Q62 18 23 18ZM5 32H31M5 58H31M91 45H108" />`,
    xor: `
      <path d="M18 18Q39 45 18 72M25 18Q46 45 25 72Q64 72 93 45Q64 18 25 18ZM5 32H31M5 58H31M93 45H108" />`,
    nand: `
      <path d="M24 18H52C73 18 84 29 84 45S73 72 52 72H24ZM5 32H24M5 58H24M94 45H108" />
      <circle cx="89" cy="45" r="5" />`,
    mux: `
      <path d="M25 14L86 25V65L25 76ZM5 29H27M5 61H27M86 45H108M49 88V71M64 88V69" />`,
    not: `
      <path d="M24 18L82 45L24 72ZM5 45H24M94 45H108" />
      <circle cx="88" cy="45" r="6" />`,
  };
  return `<svg class="gate-svg" viewBox="0 0 112 96" role="img" aria-label="${label} symbol">${shapes[type] ?? shapes.and}<text x="56" y="92" text-anchor="middle">${label}</text></svg>`;
}

const gateTables = {
  and: {
    headers: ["A", "B", "Y"],
    rows: [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 1]],
  },
  or: {
    headers: ["A", "B", "Y"],
    rows: [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 1]],
  },
  xor: {
    headers: ["A", "B", "Y"],
    rows: [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]],
  },
  nand: {
    headers: ["A", "B", "Y"],
    rows: [[0, 0, 1], [0, 1, 1], [1, 0, 1], [1, 1, 0]],
  },
  mux: {
    headers: ["S", "D0", "D1", "Y"],
    rows: [[0, 0, "X", 0], [0, 1, "X", 1], [1, "X", 0, 0], [1, "X", 1, 1]],
  },
  not: {
    headers: ["A", "Y"],
    rows: [[0, 1], [1, 0]],
  },
};

function truthTableMarkup(table, activeRow = null) {
  return `<table class="truth-table"><thead><tr>${table.headers
    .map((header) => `<th>${header}</th>`)
    .join("")}</tr></thead><tbody>${table.rows
    .map(
      (row, index) =>
        `<tr${activeRow === index ? ' class="current"' : ""} style="--row:${index}">${row
          .map((value) => `<td>${value}</td>`)
          .join("")}</tr>`,
    )
    .join("")}</tbody></table>`;
}

function waveformMarkup(signals) {
  const samples = Math.max(8, ...signals.map((signal) => signal.values.length));
  const labelWidth = 55;
  const step = 70;
  const width = labelWidth + (samples - 1) * step + 30;
  const height = signals.length * 58 + 16;
  const paths = signals
    .map((signal, row) => {
      const values = Array.from(
        { length: samples },
        (_, index) =>
          signal.values[Math.min(index, signal.values.length - 1)] ?? 0,
      );
      const high = row * 58 + 15;
      const low = row * 58 + 44;
      const y = (value) => (value ? high : low);
      let path = `M${labelWidth} ${y(values[0])}`;
      values.slice(1).forEach((value, index) => {
        const x = labelWidth + (index + 1) * step;
        path += ` H${x} V${y(value)}`;
      });
      return `<text x="7" y="${row * 58 + 34}">${signal.name}</text>
        <path class="wave-grid-line" d="M${labelWidth} ${low}H${width - 10}" />
        <path class="wave-signal ${signal.className ?? ""}" d="${path}" />`;
    })
    .join("");
  return `<section class="wave-panel"><div><span>LIVE WAVEFORM</span><small>time →</small></div>
    <div class="wave-scroll">
      <svg class="wave-svg" style="width:${width}px" viewBox="0 0 ${width} ${height}" role="img" aria-label="Input and output waveforms">${paths}</svg>
    </div>
  </section>`;
}

function scrollWaveformsToLatest() {
  requestAnimationFrame(() => {
    document.querySelectorAll(".wave-scroll").forEach((timeline) => {
      timeline.scrollLeft = timeline.scrollWidth;
    });
  });
}

function mosSymbol(type, conducting) {
  const isPmos = type === "pmos";
  return `<svg class="mos-svg ${conducting ? "conducting" : ""}" viewBox="0 0 100 120" role="img" aria-label="${type.toUpperCase()} transistor">
    <path d="M62 10V35M62 85V110M48 35V85M20 60H42M62 35H48M62 85H48" />
    ${isPmos ? '<circle cx="44" cy="60" r="5" />' : '<path d="M42 60H48" />'}
    <path class="mos-arrow" d="${isPmos ? "M68 76l10 5-10 5" : "M78 76l-10 5 10 5"}" />
    <text x="50" y="116" text-anchor="middle">${type.toUpperCase()}</text>
  </svg>`;
}

function theoryDiagram() {
  if (basicKey === "logic") {
    const type = ["and", "and", "or", "xor", "mux"][lessonIndex];
    return `<div class="theory-visual">${gateSymbol(type)}${truthTableMarkup(
      gateTables[type],
    )}</div>`;
  }
  if (basicKey === "sequential") {
    return `<svg class="dff-symbol" viewBox="0 0 180 120" role="img" aria-label="D flip-flop symbol">
      <path d="M55 15H135V105H55ZM15 42H55M15 82H55M135 42H165M55 72l13 10-13 10" />
      <text x="68" y="48">D</text><text x="118" y="48">Q</text><text x="80" y="88">CLK</text>
    </svg>`;
  }
  if (basicKey === "cmos") {
    const input = lessonIndex % 2;
    const table = {
      headers: ["IN", "PMOS", "NMOS", "OUT"],
      rows: [[0, "ON", "OFF", 1], [1, "OFF", "ON", 0]],
    };
    const device =
      lessonIndex === 1
        ? mosSymbol("nmos", true)
        : lessonIndex === 2
          ? mosSymbol("pmos", true)
          : `<div class="theory-cmos"><span>VDD</span>${mosSymbol("pmos", input === 0)}
            <i>OUT ${input ? 0 : 1}</i>${mosSymbol("nmos", input === 1)}<span>VSS</span></div>`;
    return `<div class="theory-visual">${device}${truthTableMarkup(
      table,
      input,
    )}</div>`;
  }
  return "";
}

function text(id, value) {
  document.querySelector(`#${id}`).textContent = value;
}

function renderLesson() {
  const [kicker, title, body, speech, word] = lessons[basicKey][lessonIndex];
  text("basicLessonKicker", kicker);
  text("basicLessonTitle", title);
  text("basicLessonText", body);
  text("basicSpeech", speech);
  text("basicDemoWord", word);
  const symbolDiagram = theoryDiagram();
  document.querySelector("#basicDemo").className =
    `demo-screen basic-${basicKey}${symbolDiagram ? " symbolic" : ""}`;
  document.querySelector("#basicSymbolDiagram").innerHTML = symbolDiagram;
  document.querySelector("#basicLessonBack").disabled = lessonIndex === 0;
  text("basicLessonNext", lessonIndex === lessons[basicKey].length - 1 ? "Enter lab" : "Next");
  const dots = document.querySelector("#basicLessonDots");
  dots.replaceChildren();
  lessons[basicKey].forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = index === lessonIndex ? "active" : "";
    dot.addEventListener("click", () => {
      lessonIndex = index;
      renderLesson();
    });
    dots.append(dot);
  });
  speak(`${title}. ${body} ${speech}`);
}

function renderObjectives(done = []) {
  const panel = document.querySelector("#basicObjectives");
  panel.replaceChildren();
  config[5].forEach((label, index) => {
    const item = document.createElement("div");
    item.className = `objective${done[index] ? " complete" : ""}`;
    item.innerHTML = `<span class="objective-icon">✓</span><span>${label}</span>`;
    panel.append(item);
  });
}

function update({ score, metrics, objectives, complete, commentary }) {
  text("basicScore", Math.min(1000, Math.max(0, Math.round(score))));
  text("basicStatus", complete ? "Objectives met" : "In progress");
  text("basicCommentary", commentary);
  renderObjectives(objectives);
  const panel = document.querySelector("#basicMetrics");
  panel.innerHTML = metrics
    .map(([label, value]) => `<div class="module-metric"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");
  speak(commentary);
}

function renderNumbers() {
  const value = state.bits.reduce((sum, enabled, index) => sum + (enabled ? 2 ** (7 - index) : 0), 0);
  const targetBits = "00101101";
  const currentBits = state.bits.map(Number).join("");
  const matches = [...currentBits].filter((bit, index) => bit === targetBits[index]).length;
  const complete = value === 45;
  document.querySelector("#basicCanvas").innerHTML = `
    <div class="binary-target"><span>TARGET DECIMAL</span><strong>45</strong></div>
    <div class="binary-bits">${state.bits.map((enabled, index) => `<button class="bit-toggle${enabled ? " on" : ""}" data-bit="${index}"><span>${2 ** (7 - index)}</span><strong>${enabled ? 1 : 0}</strong></button>`).join("")}</div>
    <div class="binary-equation">${state.bits.map((enabled, index) => enabled ? 2 ** (7 - index) : null).filter((item) => item !== null).join(" + ") || "0"} = <strong>${value}</strong></div>`;
  document.querySelectorAll("[data-bit]").forEach((button) => button.addEventListener("click", () => {
    const index = Number(button.dataset.bit);
    state.bits[index] = !state.bits[index];
    renderNumbers();
  }));
  update({
    score: matches * 125,
    metrics: [["Current decimal", value], ["Binary", currentBits], ["Correct bit positions", `${matches} / 8`]],
    objectives: [complete, currentBits === targetBits, complete && state.bits.filter(Boolean).length === 4],
    complete,
    commentary: complete ? "Tommy: Correct—45 is 00101101 in eight-bit binary." : "Tommy: Add the enabled positional weights and compare the sum with 45.",
  });
}

const matchingData = {
  logic: {
    items: [
      ["both", "Output is 1 only when both inputs are 1.", "and"],
      ["either", "Output is 1 when either input is 1.", "or"],
      ["different", "Output is 1 when the inputs differ.", "xor"],
      ["inverseBoth", "Output is 0 only when both inputs are 1.", "nand"],
      ["select", "Select bits choose which data input reaches the output.", "mux"],
    ],
    options: [["and", "AND"], ["or", "OR"], ["xor", "XOR"], ["nand", "NAND"], ["mux", "MUX"]],
  },
  semiconductor: {
    items: [
      ["pure", "Undoped silicon with equal electron and hole concentration.", "intrinsic"],
      ["donor", "Material formed using donor impurities.", "n"],
      ["electron", "Electrons are the majority carriers.", "n"],
      ["acceptor", "Material formed using acceptor impurities.", "p"],
      ["hole", "Holes are the majority carriers.", "p"],
    ],
    options: [["intrinsic", "Intrinsic"], ["n", "N-type"], ["p", "P-type"]],
  },
  terminology: {
    items: [
      ["cell", "A reusable implementation of a logic or physical function.", "cell"],
      ["library", "A characterized collection of reusable cells.", "library"],
      ["net", "Electrical connectivity joining pins.", "net"],
      ["pin", "A cell or block connection terminal.", "pin"],
      ["slew", "Time taken by a signal edge to transition.", "slew"],
      ["delay", "Time for a change to propagate from source to destination.", "delay"],
      ["drive", "Ability of a cell to charge or discharge a load.", "drive"],
    ],
    options: [["cell", "Cell"], ["library", "Library"], ["net", "Net"], ["pin", "Pin"], ["slew", "Slew"], ["delay", "Propagation delay"], ["drive", "Drive strength"]],
  },
  hdl: {
    items: [
      ["assign", "Continuous assignment to a wire-like signal.", "comb"],
      ["alwayscomb", "Process intended to describe complete combinational logic.", "comb"],
      ["alwaysff", "Clocked process intended to infer registers.", "seq"],
      ["nba", "Update style used for clocked state assignments.", "nonblocking"],
      ["module", "Named design unit with ports and internal behavior.", "designunit"],
      ["testbench", "Non-synthesized environment that drives and observes a design.", "verify"],
    ],
    options: [["comb", "Combinational hardware"], ["seq", "Sequential hardware"], ["nonblocking", "Nonblocking assignment"], ["designunit", "Module / entity"], ["verify", "Testbench"]],
  },
};

function matchingResult() {
  const data = matchingData[basicKey];
  const solved = data.items.filter(([id, , answer]) => state.answers[id] === answer).length;
  const wrong = Object.entries(state.answers).filter(([id, answer]) => data.items.find((item) => item[0] === id)[2] !== answer).length;
  const all = solved === data.items.length;
  const conceptObjective = {
    logic: state.answers.select === "mux",
    semiconductor:
      state.answers.electron === "n" && state.answers.hole === "p",
    terminology:
      state.answers.slew === "slew" && state.answers.delay === "delay",
    hdl: state.answers.assign === "comb" && state.answers.alwaysff === "seq",
  }[basicKey];
  return {
    score: (solved / data.items.length) * 1000 - wrong * 60,
    metrics: [["Correct matches", `${solved} / ${data.items.length}`], ["Incorrect matches", wrong], ["Completion", `${Math.round((solved / data.items.length) * 100)}%`]],
    objectives: [all, all && wrong === 0, conceptObjective],
    complete: all && wrong === 0,
    commentary: all && wrong === 0 ? "Tommy: Excellent. Every concept is matched correctly." : "Tommy: Focus on the behavior described, then choose the term that produces it.",
  };
}

function logicOutput(gate, a, b) {
  if (gate === "and") return a & b;
  if (gate === "or") return a | b;
  if (gate === "xor") return a ^ b;
  if (gate === "nand") return Number(!(a & b));
  return Number(!a);
}

function appendLogicSample() {
  state.history.push({
    a: state.a,
    b: state.b,
    y: logicOutput(state.simGate, state.a, state.b),
  });
}

function renderMatching() {
  const data = matchingData[basicKey];
  const logicSimulator =
    basicKey === "logic"
      ? `<section class="logic-simulator">
          <div class="sim-gates">${["and", "or", "xor", "nand", "not"]
              .map(
                (gate) =>
                  `<button class="${state.simGate === gate ? "active" : ""}" data-sim-gate="${gate}">${gateSymbol(gate)}</button>`,
              )
              .join("")}</div>
          <div class="logic-gate-stage">
            <button class="pin-switch pin-a" id="toggleLogicA"><span>INPUT A</span><strong>${state.a}</strong></button>
            <button class="pin-switch pin-b${state.simGate === "not" ? " hidden-pin" : ""}" id="toggleLogicB"${state.simGate === "not" ? " disabled" : ""}><span>INPUT B</span><strong>${state.b}</strong></button>
            <div class="active-logic-gate">${gateSymbol(state.simGate)}</div>
            <div class="pin-value pin-y"><span>OUTPUT Y</span><strong>${logicOutput(state.simGate, state.a, state.b)}</strong></div>
          </div>
          ${waveformMarkup([
            { name: "A", values: state.history.map((sample) => sample.a) },
            { name: "B", values: state.history.map((sample) => sample.b) },
            { name: "Y", values: state.history.map((sample) => sample.y), className: "output-wave" },
          ])}
        </section>`
      : "";
  const gateReference =
    basicKey === "logic"
      ? `<section class="gate-reference">
          <div class="gate-reference-tabs">${Object.keys(gateTables)
            .map(
              (gate) =>
                `<button class="${state.referenceGate === gate ? "active" : ""}" data-reference-gate="${gate}">${gate.toUpperCase()}</button>`,
            )
            .join("")}</div>
          <div class="gate-reference-body">
            ${gateSymbol(state.referenceGate)}
            ${truthTableMarkup(gateTables[state.referenceGate])}
          </div>
        </section>`
      : "";
  document.querySelector("#basicCanvas").innerHTML = `${logicSimulator}${gateReference}<div class="matching-list">${data.items.map(([id, prompt, correct]) => {
    const solved = state.answers[id] === correct;
    return `<article class="matching-card${solved ? " solved" : ""}"><p>${prompt}</p><div>${data.options.map(([value, label]) => `<button class="${state.answers[id] === value ? "selected" : ""}" data-item="${id}" data-answer="${value}">${basicKey === "logic" ? gateSymbol(value, label) : label}</button>`).join("")}</div></article>`;
  }).join("")}</div>`;
  scrollWaveformsToLatest();
  document.querySelectorAll("[data-sim-gate]").forEach((button) =>
    button.addEventListener("click", () => {
      state.simGate = button.dataset.simGate;
      appendLogicSample();
      renderMatching();
    }),
  );
  document.querySelector("#toggleLogicA")?.addEventListener("click", () => {
    state.a = state.a ? 0 : 1;
    appendLogicSample();
    renderMatching();
  });
  document.querySelector("#toggleLogicB")?.addEventListener("click", () => {
    state.b = state.b ? 0 : 1;
    appendLogicSample();
    renderMatching();
  });
  document.querySelectorAll("[data-reference-gate]").forEach((button) =>
    button.addEventListener("click", () => {
      state.referenceGate = button.dataset.referenceGate;
      renderMatching();
    }),
  );
  document.querySelectorAll("[data-answer]").forEach((button) => button.addEventListener("click", () => {
    state.answers[button.dataset.item] = button.dataset.answer;
    renderMatching();
  }));
  update(matchingResult());
}

function renderSequential() {
  const target = [1, 0, 1, 1];
  const correctPrefix = state.captured.filter((value, index) => value === target[index]).length;
  const complete = state.captured.length === 4 && correctPrefix === 4;
  document.querySelector("#basicCanvas").innerHTML = `
    <div class="dff-pin-stage">
      <button class="pin-switch dff-d-pin" id="toggleD"><span>INPUT D</span><strong>${state.d}</strong></button>
      <div class="interactive-dff">
        <svg class="dff-symbol" viewBox="0 0 180 120" role="img" aria-label="Interactive D flip-flop">
          <path d="M55 15H135V105H55ZM15 42H55M15 82H55M135 42H165M55 72l13 10-13 10" />
          <text x="68" y="48">D</text><text x="118" y="48">Q</text><text x="80" y="88">CLK</text>
        </svg>
      </div>
      <button class="pin-switch dff-clock-pin" id="clockEdge"><span>CLK PIN</span><strong>↑</strong></button>
      <div class="pin-value dff-q-pin"><span>OUTPUT Q</span><strong>${state.q}</strong></div>
    </div>
    <div class="sequence-strip"><span>Target: 1 0 1 1</span><strong>${state.captured.join(" ") || "—"}</strong></div>
    ${waveformMarkup([
      { name: "D", values: state.wave.map((sample) => sample.d) },
      { name: "CLK", values: state.wave.map((sample) => sample.clk), className: "clock-wave" },
      { name: "Q", values: state.wave.map((sample) => sample.q), className: "output-wave" },
    ])}`;
  scrollWaveformsToLatest();
  document.querySelector("#toggleD").addEventListener("click", () => {
    state.d = state.d ? 0 : 1;
    state.wave.push({ d: state.d, clk: 0, q: state.q });
    renderSequential();
  });
  document.querySelector("#clockEdge").addEventListener("click", () => {
    state.q = state.d;
    state.wave.push({ d: state.d, clk: 1, q: state.q });
    if (state.captured.length < 4) {
      state.captured.push(state.q);
    }
    state.wave.push({ d: state.d, clk: 0, q: state.q });
    renderSequential();
  });
  update({
    score: correctPrefix * 250,
    metrics: [["Captured edges", `${state.captured.length} / 4`], ["Current D", state.d], ["Current Q", state.q]],
    objectives: [state.captured.length === 4, complete, state.captured.length <= 4],
    complete,
    commentary: complete ? "Tommy: Perfect. Q captured D only on each active clock edge." : "Tommy: Set D to the next target value before pressing the clock.",
  });
}

function renderCmos() {
  const sequence = [0, 1, 0, 1];
  const input = sequence[state.round] ?? sequence.at(-1);
  const expected = input ? 0 : 1;
  const complete = state.round === sequence.length && state.correct === sequence.length;
  document.querySelector("#basicCanvas").innerHTML = `
    <div class="cmos-lab">
      <div class="transistor pmos${input === 0 ? " conducting" : ""}">${mosSymbol("pmos", input === 0)}<span>${input === 0 ? "ON · pulls up" : "OFF"}</span></div>
      <div class="inverter-node"><span>IN = ${input}</span>${gateSymbol("not", "INVERTER")}<span>OUT = ?</span></div>
      <div class="transistor nmos${input === 1 ? " conducting" : ""}">${mosSymbol("nmos", input === 1)}<span>${input === 1 ? "ON · pulls down" : "OFF"}</span></div>
    </div>
    <div class="cmos-truth-table">${truthTableMarkup(
      {
        headers: ["IN", "PMOS", "NMOS", "OUT"],
        rows: [[0, "ON", "OFF", 1], [1, "OFF", "ON", 0]],
      },
      input,
    )}</div>
    <div class="output-choice"><span>Choose output:</span><button data-output="0">0</button><button data-output="1">1</button></div>`;
  document.querySelectorAll("[data-output]").forEach((button) => button.addEventListener("click", () => {
    if (state.round >= sequence.length) return;
    if (Number(button.dataset.output) === expected) state.correct++;
    else state.wrong++;
    state.seen.add(input);
    state.round++;
    renderCmos();
  }));
  update({
    score: state.correct * 250 - state.wrong * 80,
    metrics: [["Observations", `${state.round} / 4`], ["Correct", state.correct], ["Input states seen", state.seen.size]],
    objectives: [state.round === 4, state.correct === 4, state.seen.size === 2],
    complete,
    commentary: complete ? "Tommy: Verified. The PMOS and NMOS act complementarily to invert the input." : `Tommy: With input ${input}, identify which transistor conducts and where it pulls the output.`,
  });
}

const processOrder = ["N-well", "Field isolation", "Gate oxide", "Polysilicon gate", "N+ implant", "P+ implant", "Contacts", "Metal"];

function renderFabrication() {
  const exact = state.steps.filter((step, index) => step === processOrder[index]).length;
  const gateBeforePoly = state.steps.indexOf("Gate oxide") < state.steps.indexOf("Polysilicon gate");
  const complete = exact === processOrder.length;
  document.querySelector("#basicCanvas").innerHTML = `<div class="process-flow">${state.steps.map((step, index) => `<article class="${step === processOrder[index] ? "correct" : ""}"><span>${index + 1}</span><strong>${step}</strong><div><button data-step="${index}" data-move="-1">↑</button><button data-step="${index}" data-move="1">↓</button></div></article>`).join("")}</div>`;
  document.querySelectorAll("[data-step]").forEach((button) => button.addEventListener("click", () => {
    const index = Number(button.dataset.step), next = index + Number(button.dataset.move);
    if (next >= 0 && next < state.steps.length) {
      [state.steps[index], state.steps[next]] = [state.steps[next], state.steps[index]];
      renderFabrication();
    }
  }));
  update({
    score: exact * 125,
    metrics: [["Correct positions", `${exact} / 8`], ["Gate oxide before poly", gateBeforePoly ? "Yes" : "No"], ["Final layer", state.steps.at(-1)]],
    objectives: [state.steps.length === 8, gateBeforePoly, complete],
    complete,
    commentary: complete ? "Tommy: Correct sequence. Device structures are formed before contacts and metal wiring." : "Tommy: Build from the substrate upward—wells and isolation first, interconnect last.",
  });
}

const layoutRules = [
  { key: "poly", label: "Poly width", minimum: 4 },
  { key: "contact", label: "Contact spacing", minimum: 3 },
  { key: "metal", label: "Metal width", minimum: 5 },
];

function renderLayout() {
  const passed = layoutRules.map((rule) => state.values[rule.key] >= rule.minimum);
  const excess = layoutRules.reduce((sum, rule) => sum + Math.max(0, state.values[rule.key] - rule.minimum), 0);
  const complete = passed.every(Boolean);
  document.querySelector("#basicCanvas").innerHTML = `
    <div class="layout-preview"><span class="diffusion"></span><span class="poly" style="width:${state.values.poly * 8}px"></span><span class="contact" style="gap:${state.values.contact * 4}px"><i></i><i></i></span><span class="metal" style="height:${state.values.metal * 5}px"></span></div>
    <div class="rule-controls">${layoutRules.map((rule) => `<article class="${state.values[rule.key] >= rule.minimum ? "pass" : "fail"}"><span>${rule.label}</span><strong>${state.values[rule.key]} λ</strong><small>Minimum ${rule.minimum} λ</small><div><button data-rule="${rule.key}" data-delta="-1">−</button><button data-rule="${rule.key}" data-delta="1">+</button></div></article>`).join("")}</div>`;
  document.querySelectorAll("[data-rule]").forEach((button) => button.addEventListener("click", () => {
    const key = button.dataset.rule;
    state.values[key] = Math.max(1, Math.min(8, state.values[key] + Number(button.dataset.delta)));
    renderLayout();
  }));
  update({
    score: passed.filter(Boolean).length * 300 + (complete ? 100 - excess * 25 : 0),
    metrics: [["Rules passing", `${passed.filter(Boolean).length} / 3`], ["Excess geometry", `${excess} λ`], ["DRC status", complete ? "CLEAN" : "VIOLATIONS"]],
    objectives: passed,
    complete,
    commentary: complete ? (excess === 0 ? "Tommy: Minimum legal geometry achieved with maximum compactness." : "Tommy: DRC passes, but reducing excess dimensions will improve area.") : "Tommy: Red controls are below the manufacturing minimum. Increase them until DRC passes.",
  });
}

const renderers = {
  numbers: renderNumbers,
  logic: renderMatching,
  sequential: renderSequential,
  semiconductor: renderMatching,
  cmos: renderCmos,
  fabrication: renderFabrication,
  layout: renderLayout,
  terminology: renderMatching,
  hdl: renderMatching,
};

function resetLab() {
  const states = {
    numbers: { bits: Array(8).fill(false) },
    logic: {
      answers: {},
      referenceGate: "and",
      simGate: "and",
      a: 0,
      b: 0,
      history: [{ a: 0, b: 0, y: 0 }],
    },
    sequential: {
      d: 0,
      q: 0,
      captured: [],
      wave: [{ d: 0, clk: 0, q: 0 }],
    },
    semiconductor: { answers: {} },
    cmos: { round: 0, correct: 0, wrong: 0, seen: new Set() },
    fabrication: { steps: ["Metal", "N-well", "Contacts", "Gate oxide", "P+ implant", "Field isolation", "Polysilicon gate", "N+ implant"] },
    layout: { values: { poly: 2, contact: 1, metal: 3 } },
    terminology: { answers: {} },
    hdl: { answers: {} },
  };
  state = states[basicKey];
  renderers[basicKey]();
}

function initialize() {
  document.title = `${config[1]} · VLSI Basics Quest`;
  text("basicNumber", config[0]);
  text("basicTitle", config[1]);
  text("basicMissionTitle", config[2]);
  text("basicMissionText", config[3]);
  text("basicTip", config[4]);
  renderObjectives([]);
  const index = basicOrder.indexOf(basicKey);
  const previous = document.querySelector("#previousBasic");
  const next = document.querySelector("#nextBasic");
  previous.href = index === 0 ? "basics.html" : `basics-module.html?module=${basicOrder[index - 1]}`;
  previous.textContent = index === 0 ? "← Basics map" : "← Previous module";
  next.href = index === basicOrder.length - 1 ? "course.html" : `basics-module.html?module=${basicOrder[index + 1]}`;
  next.textContent = index === basicOrder.length - 1 ? "Physical Design track →" : "Next module →";
  resetLab();
  renderLesson();
}

document.querySelector("#basicLessonBack").addEventListener("click", () => {
  lessonIndex = Math.max(0, lessonIndex - 1);
  renderLesson();
});
document.querySelector("#basicLessonNext").addEventListener("click", () => {
  if (lessonIndex === lessons[basicKey].length - 1) {
    window.speechSynthesis?.cancel();
    document.querySelector("#basicLesson").classList.add("hidden");
    document.body.classList.remove("lesson-open");
    speak(document.querySelector("#basicCommentary").textContent);
  } else {
    lessonIndex++;
    renderLesson();
  }
});
document.querySelector("#basicLessonSkip").addEventListener("click", () => {
  window.speechSynthesis?.cancel();
  document.querySelector("#basicLesson").classList.add("hidden");
  document.body.classList.remove("lesson-open");
});
document.querySelector("#replayBasicLesson").addEventListener("click", () => {
  lessonIndex = 0;
  renderLesson();
  document.querySelector("#basicLesson").classList.remove("hidden");
  document.body.classList.add("lesson-open");
});
document.querySelector("#resetBasicLab").addEventListener("click", resetLab);
document.querySelector("#basicVoiceButton").addEventListener("click", toggleVoice);
document.querySelector("#basicLabVoice").addEventListener("click", toggleVoice);
document.querySelector("#checkBasicLab").addEventListener("click", () => {
  text("basicCommentary", document.querySelector("#basicStatus").textContent === "Objectives met"
    ? "Tommy: Excellent—this foundation skill is complete!"
    : "Tommy: Keep experimenting. The unchecked objectives show what remains.");
});

initialize();
