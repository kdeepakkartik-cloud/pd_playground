(() => {
  "use strict";

  const pdReading = ["VLSI Expert: physical-design topics", "https://www.vlsi-expert.com/p/physical-design.html"];
  const timingReading = ["VLSI Expert: setup and hold", "https://www.vlsi-expert.com/2011/04/static-timing-analysis-sta-basic-part3a.html"];
  const toolReading = (name, module) => [`OpenROAD: ${name}`, `https://openroad.readthedocs.io/en/latest/main/src/${module}/README.html`];
  const concepts = {
    floorplan: {
      name: "Floorplan", title: "Give every block room to work",
      explanation: "A floorplan sets the chip's usable core and the locations of large macros, such as memories. Before filling the remaining area with standard cells, leave space for power, signal routing, and access to macro pins.",
      caption: "The outer boundary is the die; the inner boundary is the core. Dashed halos reserve space around macros. The gap between their edges is a routing channel.",
      why: "A legal macro arrangement can still be hard to route. Channels and pin access matter alongside the distance between connected blocks.",
      myth: "The closest possible macro placement is not always best. In this example, closing the gap shortens connections but violates a deliberately chosen training clearance.",
      words: [["Macro", "A large predesigned block with a physical footprint, such as SRAM."], ["Core", "The region used for implementing the design inside the die."], ["Halo", "A keepout around a macro. Its exact restrictions depend on the tool and flow."], ["Channel", "Space between macro edges that can provide routing access."]],
      prompt: "Predict what happens to routing space as you bring the macros closer. Try a 20-unit gap, then an 80-unit gap.",
      controls: [["gap", "Gap between macros", 10, 120, 10, 20, "units"]],
      question: "The wires are short, but the channel is too narrow. What should you try?",
      answers: ["Remove every routing constraint.", "Open the channel and recheck wirelength.", "Ignore the channel because the macros do not overlap."],
      correct: 1,
      feedback: ["Constraints express real requirements; removing them does not make a design routable.", "Correct. Trade a little wirelength for usable routing space, then check both.", "No overlap is only one check. Pins and routes also need access."],
      sources: [pdReading, toolReading("floorplan initialization", "ifp")],
    },
    placement: {
      name: "Placement", title: "Connect nearby cells without crowding them",
      explanation: "Standard cells implement gates and registers. Placement assigns them positions in rows. One quick connectivity estimate is half-perimeter wirelength (HPWL): the width plus height of a net's smallest enclosing rectangle.",
      caption: "A, B, and C are pins on one net. The dashed rectangle encloses all three. Its width plus height gives HPWL; it is not the actual routed path.",
      why: "Moving a connected cell can reduce the estimated wiring, but a placer must also account for timing, local density, and legal cell locations.",
      myth: "HPWL is not extracted delay or final wirelength. Obstacles, route topology, layers, and vias affect the implemented net.",
      words: [["Standard cell", "A library component implementing logic or storage, designed to fit placement rows."], ["Net", "An electrical connection between pins."], ["HPWL", "Half of a net's bounding-box perimeter: (maximum x - minimum x) + (maximum y - minimum y)."]],
      prompt: "Move pin C toward pins A and B. Observe the bounding rectangle and calculate its new HPWL.",
      controls: [["pin", "Pin C horizontal position", 180, 500, 20, 440, "units"]],
      question: "A net spans 100 units horizontally and 60 vertically. What is its HPWL?",
      answers: ["320 units", "160 units", "6,000 square units"],
      correct: 1,
      feedback: ["That is the full perimeter. HPWL uses half of it.", "Correct: width + height = 100 + 60 = 160 units.", "That is the rectangle's area, not a wirelength estimate."],
      sources: [pdReading, toolReading("global placement", "gpl")],
    },
    power: {
      name: "Power", title: "Wires must deliver voltage, not just signals",
      explanation: "Cells draw current through a power-delivery network. Resistance in that network causes voltage loss. This single-resistor model holds the load current constant so you can isolate the relationship Vdrop = I x R.",
      caption: "The source supplies 0.80 V through one equivalent resistance. A fixed 20 mA load draws current. The return path is idealized here.",
      why: "A cell sees the local supply, not just the voltage at the source. Power planning must provide connected, sufficiently strong supply and return paths.",
      myth: "Crossing a hotspot with a strap does not by itself prove power integrity. Real analysis needs connected geometry, vias, source locations, and current estimates.",
      words: [["IR drop", "Voltage lost when current I flows through resistance R."], ["Strap", "A relatively wide metal conductor used to distribute power."], ["mA / mV", "One-thousandth of an ampere / volt. With current in mA and resistance in ohms, I x R gives mV."]],
      prompt: "Halve the resistance. Predict the voltage drop before checking the result.",
      controls: [["resistance", "Equivalent path resistance", 1, 8, 1, 4, "ohms"]],
      question: "At fixed current, what does halving the resistance do to IR drop?",
      answers: ["Doubles it.", "Leaves it unchanged.", "Halves it."],
      correct: 2,
      feedback: ["Use Vdrop = I x R. A smaller R reduces the drop at the same I.", "The voltage drop depends directly on resistance in this model.", "Correct. The load voltage rises because less voltage is lost in the path."],
      sources: [toolReading("IR-drop analysis", "psm"), pdReading],
    },
    cts: {
      name: "Clock tree", title: "Compare arrivals, not just branch lengths",
      explanation: "Clock-tree synthesis builds a buffered network that distributes clock edges to registers. Clock latency is travel time to a sink. Skew compares arrival times at different sinks.",
      caption: "Both registers share a clock source. Their blue traces show the same source edge arriving at different times. The second branch's latency is adjustable.",
      why: "Different clock arrivals change the data-transfer window between registers. Tree construction balances skew, latency, transition quality, and power.",
      myth: "Zero skew does not mean zero latency. Both registers can see an edge 200 ps after the source and still have zero skew between them.",
      words: [["Sink", "A destination clock pin, typically on a register."], ["Latency", "Time from the clock source to a particular sink."], ["Skew", "An arrival-time difference. This picture reports the nonnegative spread between two sinks; timing equations may use signed capture-minus-launch skew."], ["ps", "Picosecond: one trillionth of a second."]],
      prompt: "Bring the second arrival to 200 ps. Watch the skew become zero while both clock latencies remain nonzero.",
      controls: [["arrival", "Register B clock latency", 100, 300, 10, 280, "ps"]],
      question: "Both sinks receive the same edge at 200 ps. What are their skew and latency?",
      answers: ["Skew 0 ps; each latency 200 ps.", "Skew 200 ps; each latency 0 ps.", "Both skew and latency are 0 ps."],
      correct: 0,
      feedback: ["Correct. Equal arrival times remove their difference, not their travel time.", "Latency measures travel time; skew measures the difference between arrivals.", "The edge still took 200 ps to reach each sink."],
      sources: [["VLSI Expert: sources of clock skew", "https://www.vlsi-expert.com/2016/01/skew.html"], toolReading("clock-tree synthesis", "cts")],
    },
    routing: {
      name: "Routing", title: "A connection needs a legal physical path",
      explanation: "Routing assigns wires and vias to connect pins. A straight line may be short, but routing restrictions can make it illegal. This one-layer example requires a detour around a blocked region.",
      caption: "S and T are the source and target pins. The red rectangle blocks the shown layer. Compare a short crossing with a longer path that avoids it.",
      why: "Wire geometry must obey layer-specific restrictions and manufacturing rules. Real routers also choose layers and vias while managing congestion.",
      myth: "A connected drawing is not automatically a legal route. Nor does one layer's blockage necessarily block every layer.",
      words: [["Track", "A candidate line along which routing can be placed."], ["Via", "A connection between metal layers."], ["DRC", "Design-rule checking: checking geometry against process rules."], ["Routing blockage", "A region where specified routing resources cannot be used."]],
      prompt: "Compare the direct route with the detour. Which matters first here: short length or avoiding the blocked region?",
      controls: [["detour", "Route around the blockage", 0, 1, 1, 0, ""]],
      question: "The direct route crosses a blockage on this layer. Which option is valid in this model?",
      answers: ["Keep the direct route because it is shortest.", "Take the detour that avoids the blocked region.", "Treat the crossing as a via."],
      correct: 1,
      feedback: ["A shorter illegal route still fails the constraint.", "Correct. First obtain a legal path, then optimize it. Other layers may offer alternatives in a real design.", "A via connects layers; it does not magically legalize a wire on a blocked layer."],
      sources: [pdReading, toolReading("detailed routing", "drt")],
    },
    timing: {
      name: "Timing", title: "Data can arrive too late or too early",
      explanation: "Setup checks whether the latest data reaches a register before its next capture deadline. Hold checks whether the earliest new data changes too soon after the current capture edge. Both constraints must pass.",
      caption: "Two separate checks: setup uses the next edge, while hold uses the current edge. Arrival times include launch clock-to-Q plus data-path delay. This example assumes zero clock skew and uncertainty.",
      why: "Slowing down a path can help hold while hurting setup. Changing the clock period helps this setup check but does not fix this same-edge hold check.",
      myth: "One nominal delay is not enough. Setup uses maximum arrival and hold uses minimum arrival; real STA also considers clocks, constraints, operating corners, and variation.",
      words: [["Setup time", "How long data must already be stable before the capture edge."], ["Hold time", "How long data must remain stable after the capture edge."], ["Slack", "Margin to a timing requirement. Nonnegative is passing for the check shown."], ["Arrival", "Here, clock-to-Q plus combinational and wire delay measured from a launch edge."]],
      prompt: "First increase the period to fix setup. Does hold change? Then increase the minimum arrival to repair hold too.",
      controls: [["period", "Clock period", 600, 1400, 50, 800, "ps"], ["latest", "Maximum data arrival", 500, 1100, 50, 800, "ps"], ["earliest", "Minimum data arrival", 20, 200, 10, 40, "ps"]],
      question: "With zero skew, what happens to same-edge hold slack if you increase only the clock period?",
      answers: ["It always improves.", "It becomes equal to setup slack.", "It stays the same."],
      correct: 2,
      feedback: ["The hold requirement here is relative to the current edge, not the next edge.", "Setup and hold use different arrivals and different edge relationships.", "Correct. Hold slack is minimum arrival minus hold time in this simplified model; the period is absent."],
      sources: [timingReading, ["VLSI Expert: STA topic map", "https://www.vlsi-expert.com/p/static-timing-analysis.html"]],
    },
    signoff: {
      name: "Signoff", title: "Different checks answer different questions",
      explanation: "Before release, a design needs more than a good timing score. Physical verification checks geometry and connectivity, while timing and power-integrity analyses check other aspects of operation.",
      caption: "The two wires belong to different nets on the same layer. Their gap is compared with an illustrative minimum-spacing rule. This picture checks spacing only.",
      why: "Passing one check cannot substitute for the others. DRC checks geometry; layout-versus-schematic (LVS) checks extracted connectivity against the intended circuit.",
      myth: "A green spacing result is not tape-out approval. Connectivity, timing, antenna effects, power integrity, and the flow's other required checks still need verification.",
      words: [["DRC", "Geometric checks such as minimum width, spacing, and enclosure."], ["LVS", "Layout versus schematic: compare the circuit extracted from layout with the intended circuit."], ["Signoff", "The collection of required final analyses and reviews, not a single score."]],
      prompt: "Increase the spacing until this example's rule passes. Notice which other checks remain unverified.",
      controls: [["spacing", "Wire-to-wire spacing", 10, 80, 10, 20, "units"]],
      question: "This spacing check passes. What can you conclude?",
      answers: ["The chip is ready to manufacture.", "Only the illustrated spacing rule passes; other checks remain.", "LVS must also pass."],
      correct: 1,
      feedback: ["One geometry check cannot establish readiness for manufacturing.", "Correct. Always say what was checked, and what has not yet been verified.", "Spacing does not prove that extracted connectivity matches the intended circuit."],
      sources: [pdReading, toolReading("detailed routing and DRC", "drt")],
    },
  };
  const order = Object.keys(concepts);
  const storageKey = "pd-visual-checks-v1";
  const $ = (id) => document.getElementById(id);
  let current;
  let values = {};
  let completed = new Set();

  function storageNotice(message) {
    $("storageNotice").hidden = false;
    $("storageNotice").textContent = message;
  }

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    if (!Array.isArray(saved) || saved.some((key) => !order.includes(key))) {
      storageNotice("Saved concept progress was invalid. This walkthrough starts fresh.");
    } else {
      completed = new Set(saved);
    }
  } catch (error) {
    storageNotice("Saved progress could not be read. You can still explore and complete checks in this visit.");
    console.warn("Visual guide progress could not be loaded:", error);
  }

  const text = (x, y, label, className = "") => `<text x="${x}" y="${y}" class="${className}">${label}</text>`;
  const rect = (x, y, width, height, className = "box") => `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="5" class="${className}"/>`;
  const path = (d, className = "wire") => `<path d="${d}" class="${className}"/>`;
  const pin = (x, y, label) => `<circle cx="${x}" cy="${y}" r="7" fill="#3ee7d1"/>${text(x + 12, y - 10, label)}`;

  function diagram(description, drawing) {
    $("guideDiagram").innerHTML = `<svg class="guide-svg" viewBox="0 0 640 330" role="img" aria-labelledby="pictureTitle pictureDescription">
      <title id="pictureTitle">${concepts[current].title}</title><desc id="pictureDescription">${description}</desc>${drawing}</svg>`;
  }

  function result(title, explanation) {
    $("experimentResult").replaceChildren();
    const heading = document.createElement("strong");
    heading.textContent = title;
    const detail = document.createElement("p");
    detail.textContent = explanation;
    $("experimentResult").append(heading, detail);
  }

  const renderers = {
    floorplan() {
      const { gap } = values;
      const right = 270 + gap;
      const passing = gap >= 60;
      diagram(`Macro gap ${gap} units. Training minimum 60 units: ${passing ? "passes" : "too narrow"}. Dashed keepouts surround each macro.`,
        rect(30, 25, 580, 275, "outline") + text(45, 48, "DIE") +
        rect(65, 60, 510, 220, "dim") + text(80, 85, "CORE") +
        `<g stroke-dasharray="7 5">${rect(100, 100, 200, 155, "outline")}${rect(right - 30, 100, 200, 155, "outline")}</g>` +
        rect(130, 130, 140, 95) + text(157, 180, "SRAM A") +
        rect(right, 130, 140, 95) + text(right + 27, 180, "SRAM B") +
        path(`M270 200 H${right}`, passing ? "wire" : "clock") +
        text(125, 115, "30-unit halo", "small") + text(280, 265, `Gap: ${gap} / need 60`, "small"));
      result(`${passing ? "Clearance passes" : "Channel too narrow"}: ${gap} units`,
        "This exercise uses two 30-unit halos and a 60-unit combined clearance. Real halo and channel requirements depend on pins, routing demand, and the implementation flow; 60 is not a universal rule.");
    },
    placement() {
      const width = values.pin - 120;
      const hpwl = width + 100;
      diagram(`Pins A at (120,100), B at (180,200), C at (${values.pin},150). Width ${width}, height 100, HPWL ${hpwl} units.`,
        [100, 150, 200].map((y) => path(`M70 ${y} H570`, "outline")).join("") +
        `<g stroke-dasharray="7 5">${rect(120, 100, width, 100, "outline")}</g>` +
        path(`M120 100 H180 V150 H${values.pin} M180 150 V200`) +
        pin(120, 100, "A") + pin(180, 200, "B") + pin(values.pin, 150, "C") +
        text(80, 50, "ONE NET / THREE PINS") + text(80, 257, `Width ${width} + height 100 = ${hpwl} units`) +
        text(80, 288, "Connecting lines are illustrative, not a routed solution.", "small"));
      result(`HPWL = (${values.pin} - 120) + (200 - 100) = ${hpwl} units`,
        "The three pins remain on this toy grid. Reducing the bounding box improves this estimate, but says nothing by itself about cell overlap, local density, or timing.");
    },
    power() {
      const drop = 20 * values.resistance;
      const voltage = (0.8 - drop / 1000).toFixed(2);
      diagram(`0.80 V source, 20 mA fixed current, ${values.resistance} ohms resistance. Drop ${drop} mV; load voltage ${voltage} V.`,
        rect(40, 120, 130, 80) + text(58, 155, "SOURCE") + text(73, 183, "0.80 V") +
        path("M170 160 H235 M385 160 H455") +
        path("M235 160 l12 -18 l24 36 l24 -36 l24 36 l24 -36 l24 36 l18 -18", "clock") +
        rect(455, 120, 145, 80) + text(475, 155, "CELL LOAD") + text(485, 183, `${voltage} V`) +
        text(245, 112, `${values.resistance} ohms`) + text(235, 70, "Current: 20 mA") +
        path("M525 200 V250 H100 V200", "outline") + text(165, 280, "Ideal return path (0 ohms)", "small") +
        text(230, 220, `Drop: ${drop} mV`));
      result(`IR drop = 20 mA x ${values.resistance} ohms = ${drop} mV`,
        `Load voltage = 800 - ${drop} = ${800 - drop} mV (${voltage} V). This is a fixed-current DC example, not a power-grid solver or a prediction of cell operation.`);
    },
    cts() {
      const skew = Math.abs(values.arrival - 200);
      const edgeA = 160 + 200;
      const edgeB = 160 + values.arrival;
      diagram(`Clock latency A 200 ps, latency B ${values.arrival} ps, arrival spread ${skew} ps.`,
        rect(35, 35, 120, 55) + text(50, 69, "CLK source") +
        path("M155 63 H270 V40 H400 M270 63 V115 H400", "clock") +
        rect(400, 15, 200, 50) + text(415, 47, "Register A: 200 ps") +
        rect(400, 90, 200, 50) + text(415, 122, `Register B: ${values.arrival} ps`) +
        text(40, 192, "CLK A") + path(`M160 195 H${edgeA} V170 H560`, "clock") +
        text(40, 252, "CLK B") + path(`M160 255 H${edgeB} V230 H560`, "clock") +
        path(`M${edgeA} 210 H${edgeB}`, "wire") +
        text(170, 305, `Edge-arrival spread: ${skew} ps (time increases right)`));
      result(`Skew spread = |${values.arrival} - 200| = ${skew} ps`,
        `Sink A latency stays 200 ps; sink B latency is ${values.arrival} ps. Changing latency is an educational control, not a claim that adding a particular buffer always produces this delay.`);
    },
    routing() {
      const detour = values.detour === 1;
      diagram(`${detour ? "Detour of 540" : "Direct route of 380"} grid units. ${detour ? "Avoids" : "Crosses"} the layer blockage.`,
        rect(255, 110, 130, 130, "bad") + text(269, 166, "BLOCKED") + text(270, 191, "this layer", "small") +
        path(detour ? "M120 170 V90 H500 V170" : "M120 170 H500") +
        pin(120, 170, "S") + pin(500, 170, "T") +
        text(75, 45, detour ? "DETOUR / AVOIDS BLOCKAGE" : "DIRECT / BLOCKAGE CROSSING") +
        text(75, 286, detour ? "Length: 80 + 380 + 80 = 540 grid units" : "Length: 380 grid units, but not legal"));
      result(detour ? "Detour: blockage check passes" : "Direct: blockage check fails",
        "This point-line model checks only crossing of the illustrated blockage. Real legality also depends on wire width, spacing, vias, connectivity, and process rules.");
    },
    timing() {
      const { period, latest, earliest } = values;
      const setup = period - 100 - latest;
      const hold = earliest - 80;
      const sx = (value) => 70 + value * 0.35;
      const hx = (value) => 70 + value * 2.2;
      diagram(`Setup: period ${period} minus setup time 100 minus maximum arrival ${latest} equals ${setup} ps. Hold: minimum arrival ${earliest} minus hold time 80 equals ${hold} ps.`,
        text(35, 30, "SETUP / next-edge check") +
        rect(sx(period - 100), 48, 35, 80, "warning") +
        path(`M70 120 H580`, "outline") +
        path(`M${sx(period)} 40 V125`, "clock") +
        path(`M${sx(latest)} 65 V120`) +
        text(45, 153, `Latest: ${latest} ps | deadline: ${period - 100} ps | next edge: ${period} ps`, "small") +
        text(35, 188, "HOLD / current-edge check (different scale)") +
        rect(70, 205, 176, 65, "warning") +
        path("M70 200 V275", "clock") + path("M70 270 H580", "outline") +
        path(`M${hx(earliest)} 215 V270`) +
        text(45, 303, `Earliest: ${earliest} ps | must not change before: 80 ps`, "small"));
      result(`Setup: ${setup} ps (${setup >= 0 ? "PASS" : "FAIL"}) / Hold: ${hold} ps (${hold >= 0 ? "PASS" : "FAIL"})`,
        `Setup slack = ${period} - 100 - ${latest}. Hold slack = ${earliest} - 80. Blue lines mark capture edges; green lines mark arrivals; orange bands mark setup/hold intervals. Assumptions: same clock, single-cycle setup, zero skew and uncertainty, setup 100 ps, hold 80 ps.`);
    },
    signoff() {
      const passing = values.spacing >= 40;
      const right = 270 + values.spacing;
      diagram(`Two different nets have spacing ${values.spacing} units. Illustrative minimum 40: ${passing ? "pass" : "fail"}. LVS, timing, and power integrity are not checked.`,
        rect(210, 50, 60, 175) + text(204, 30, "NET A") +
        rect(right, 50, 60, 175) + text(right, 30, "NET B") +
        path(`M270 160 H${right}`, "clock") +
        text(100, 255, `Spacing: ${values.spacing} units / training minimum: 40`) +
        text(100, 292, "LVS / timing / power integrity: NOT CHECKED", "small"));
      result(`Spacing rule: ${passing ? "PASS" : "FAIL"} (${values.spacing} ${passing ? ">=" : "<"} 40 units)`,
        "This invented rule demonstrates a geometric check; it is not a foundry rule. No connectivity, timing, antenna, or power-integrity analysis has been performed.");
    },
  };

  function updateProgress() {
    $("guideProgress").value = completed.size;
    $("progressText").textContent = `${completed.size} of ${order.length}`;
    document.querySelectorAll("#conceptNav a").forEach((link) => {
      link.dataset.complete = String(completed.has(link.hash.slice(1)));
    });
  }

  function answer(index) {
    const concept = concepts[current];
    const correct = index === concept.correct;
    $("checkFeedback").textContent = concept.feedback[index];
    $("checkFeedback").dataset.correct = String(correct);
    document.querySelectorAll("#checkChoices button").forEach((button, choice) => {
      button.setAttribute("aria-pressed", String(choice === index));
    });
    if (!correct) return;
    completed.add(current);
    updateProgress();
    try {
      localStorage.setItem(storageKey, JSON.stringify([...completed]));
    } catch (error) {
      storageNotice("Progress could not be saved. Your checks count for this visit, but may be lost on reload.");
      console.warn("Visual guide progress could not be saved:", error);
    }
  }

  function renderControls(concept) {
    $("experimentControls").replaceChildren();
    concept.controls.forEach(([key, label, min, max, step, initial, unit]) => {
      values[key] = initial;
      const wrapper = document.createElement("div");
      wrapper.className = "experiment-control";
      const labelElement = document.createElement("label");
      labelElement.htmlFor = `control-${key}`;
      labelElement.textContent = label;
      const output = document.createElement("output");
      output.htmlFor = `control-${key}`;
      const input = document.createElement("input");
      Object.assign(input, { type: "range", id: `control-${key}`, min, max, step, value: initial });
      const showValue = () => {
        const display = key === "detour" ? (values[key] ? "Detour" : "Direct") : `${values[key]} ${unit}`;
        output.textContent = display;
        input.setAttribute("aria-valuetext", display);
      };
      input.addEventListener("input", () => {
        values[key] = Number(input.value);
        showValue();
        renderers[current]();
      });
      showValue();
      wrapper.append(labelElement, output, input);
      $("experimentControls").append(wrapper);
    });
  }

  function renderConcept(focusTitle = false) {
    const requested = location.hash.slice(1);
    current = order.includes(requested) ? requested : order[0];
    const concept = concepts[current];
    const index = order.indexOf(current);
    values = {};
    document.title = `${concept.name} | Visual Playground`;
    $("guideStage").textContent = `CONCEPT ${index + 1} OF ${order.length}`;
    $("guideTitle").textContent = concept.title;
    $("guideExplanation").textContent = concept.explanation;
    $("guideCaption").textContent = concept.caption;
    $("guideWhy").textContent = concept.why;
    $("guideMyth").textContent = concept.myth;
    $("experimentPrompt").textContent = concept.prompt;
    $("guideLab").href = current === "floorplan" ? "index.html" : `module.html?module=${current}`;
    $("guideLab").textContent = `Practice ${concept.name.toLowerCase()} in the lab`;
    $("nextConcept").textContent = index === order.length - 1 ? "Back to first concept" : `Next: ${concepts[order[index + 1]].name}`;
    $("guideGlossary").replaceChildren();
    concept.words.forEach(([word, definition]) => {
      const term = document.createElement("dt");
      const detail = document.createElement("dd");
      term.textContent = word;
      detail.textContent = definition;
      $("guideGlossary").append(term, detail);
    });
    $("guideSources").replaceChildren();
    concept.sources.forEach(([label, url]) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = url;
      link.textContent = label;
      item.append(link);
      $("guideSources").append(item);
    });
    $("checkTitle").textContent = concept.question;
    $("checkFeedback").textContent = completed.has(current) ? "You have already answered this check correctly. You can practice again." : "Choose an answer. A wrong answer gives a hint; you can retry.";
    delete $("checkFeedback").dataset.correct;
    $("checkChoices").replaceChildren();
    concept.answers.forEach((label, answerIndex) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "button button-secondary";
      button.textContent = label;
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => answer(answerIndex));
      $("checkChoices").append(button);
    });
    document.querySelectorAll("#conceptNav a").forEach((link) => {
      if (link.hash === `#${current}`) link.setAttribute("aria-current", "step");
      else link.removeAttribute("aria-current");
    });
    renderControls(concept);
    renderers[current]();
    updateProgress();
    if (focusTitle) $("guideTitle").focus({ preventScroll: true });
  }

  order.forEach((key, index) => {
    const link = document.createElement("a");
    link.href = `#${key}`;
    link.textContent = `${index + 1}. ${concepts[key].name}`;
    $("conceptNav").append(link);
  });
  $("nextConcept").addEventListener("click", () => {
    location.hash = order[(order.indexOf(current) + 1) % order.length];
  });
  window.addEventListener("hashchange", () => renderConcept(true));
  renderConcept();
})();
