
const devices = [
  {
    id: "router",
    name: "Network Router",
    type: "Network infrastructure",
    icon: "⌘",
    x: 380, y: 155,
    description: "Central routing point connecting the simulated network.",
    baseRisk: 18
  },
  {
    id: "camera",
    name: "Smart Camera",
    type: "IoT surveillance",
    icon: "◉",
    x: 180, y: 85,
    description: "A connected camera used in the first attack scenario.",
    baseRisk: 16
  },
  {
    id: "sensor",
    name: "Temperature Sensor",
    type: "Environmental IoT",
    icon: "⌁",
    x: 180, y: 250,
    description: "A sensor reporting environmental measurements.",
    baseRisk: 12
  },
  {
    id: "gateway",
    name: "IoT Gateway",
    type: "IoT infrastructure",
    icon: "▦",
    x: 570, y: 155,
    description: "Connects the router to downstream IoT devices.",
    baseRisk: 20
  },
  {
    id: "lock",
    name: "Smart Door Lock",
    type: "Access control IoT",
    icon: "▣",
    x: 690, y: 75,
    description: "A connected access-control device.",
    baseRisk: 15
  },
  {
    id: "laptop",
    name: "Admin Laptop",
    type: "Endpoint device",
    icon: "▱",
    x: 690, y: 260,
    description: "An endpoint used to administer the simulated network.",
    baseRisk: 18
  }
];

const connections = [
  ["camera", "router"],
  ["sensor", "router"],
  ["router", "gateway"],
  ["gateway", "lock"],
  ["gateway", "laptop"]
];

const initialState = () => ({
  risk: Object.fromEntries(devices.map(d => [d.id, d.baseRisk])),
  status: Object.fromEntries(devices.map(d => [d.id, "online"])),
  reasons: Object.fromEntries(devices.map(d => [
    d.id, ["No simulated threat indicators detected."]
  ])),
  selectedId: "router",
  attackEdges: [],
  activeIncident: null,
  events: [],
  nextEventId: 1
});

let state = initialState();

const $ = id => document.getElementById(id);

function deviceById(id) {
  return devices.find(device => device.id === id);
}

function scoreLevel(score) {
  if (score >= 85) return "Critical";
  if (score >= 65) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

function currentStatus(id) {
  if (state.status[id] === "isolated") return "isolated";
  if (state.status[id] === "compromised") return "compromised";
  return "online";
}

function addEvent(title, description, severity = "info") {
  state.events.unshift({
    id: state.nextEventId++,
    title,
    description,
    severity,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    })
  });
}

function renderNetwork() {
  const svg = $("network-map");
  let markup = "";

  for (const [fromId, toId] of connections) {
    const from = deviceById(fromId);
    const to = deviceById(toId);

    const edgeKey = `${fromId}-${toId}`;
    const reverseKey = `${toId}-${fromId}`;

    const isAttackEdge =
      state.attackEdges.includes(edgeKey) ||
      state.attackEdges.includes(reverseKey);

    const isIsolatedEdge =
      state.status[fromId] === "isolated" ||
      state.status[toId] === "isolated";

    let edgeClass = "network-edge";
    if (isAttackEdge) edgeClass += " attack-edge";
    else if (isIsolatedEdge) edgeClass += " isolated-edge";

    markup += `
      <line
        class="${edgeClass}"
        x1="${from.x}" y1="${from.y}"
        x2="${to.x}" y2="${to.y}"
      />
    `;
  }

  for (const device of devices) {
    const status = currentStatus(device.id);
    const isSelected = state.selectedId === device.id;
    const score = state.risk[device.id];

    let classes = "device-node";
    if (status === "compromised") classes += " compromised";
    if (status === "isolated") classes += " isolated";
    if (isSelected) classes += " selected";

    const statusLabel = {
      online: "ONLINE",
      compromised: "COMPROMISED",
      isolated: "ISOLATED"
    }[status];

    markup += `
      <g
        class="${classes}"
        data-device="${device.id}"
        tabindex="0"
        role="button"
        aria-label="${device.name}, ${statusLabel}, risk ${score} out of 100"
      >
        <rect
          class="node-card"
          x="${device.x - 61}"
          y="${device.y - 35}"
          width="122"
          height="70"
          rx="10"
        />
        <text class="node-icon" x="${device.x}" y="${device.y - 9}">
          ${device.icon}
        </text>
        <text class="node-name" x="${device.x}" y="${device.y + 9}">
          ${device.name}
        </text>
        <text class="node-status" x="${device.x}" y="${device.y + 23}">
          ${statusLabel} · RISK ${score}
        </text>
      </g>
    `;
  }

  svg.innerHTML = markup;
}

function renderMetrics() {
  const healthy = devices.filter(d =>
    state.status[d.id] === "online" &&
    state.risk[d.id] < 40
  ).length;

  const compromised = devices.filter(d =>
    state.status[d.id] === "compromised"
  ).length;

  $("total-devices").textContent = devices.length;
  $("healthy-devices").textContent = healthy;
  $("compromised-devices").textContent = compromised;
  $("active-incidents").textContent =
    state.activeIncident ? 1 : 0;

  $("event-count").textContent =
    `${state.events.length} EVENT${state.events.length === 1 ? "" : "S"}`;
}

function renderDeviceDetails() {
  const device = deviceById(state.selectedId);

  if (!device) return;

  const status = currentStatus(device.id);
  const score = state.risk[device.id];
  const level = scoreLevel(score);

  const statusText = {
    online: "ONLINE",
    compromised: "COMPROMISED",
    isolated: "ISOLATED"
  }[status];

  $("device-details").innerHTML = `
    <div class="detail-top">
      <div class="detail-icon">${device.icon}</div>
      <div>
        <div class="detail-name">${device.name}</div>
        <div class="detail-type">${device.type}</div>
        <span class="status-pill ${status === "online" ? "" : status}">
          ${statusText}
        </span>
      </div>
    </div>
    <p class="detail-description">${device.description}</p>
  `;

  $("risk-value").textContent = `${score}/100`;
  $("risk-bar").style.width = `${score}%`;

  const riskColors = {
    Low: "#34d399",
    Medium: "#fbbf24",
    High: "#fb923c",
    Critical: "#fb7185"
  };

  $("risk-bar").style.background = riskColors[level];
  $("risk-level").textContent = `${level} risk · Illustrative score`;

  $("risk-reasons").innerHTML = state.reasons[device.id]
    .map(reason => `<li>${reason}</li>`)
    .join("");

  $("isolate-btn").disabled = status !== "compromised";
  $("isolate-btn").textContent =
    status === "isolated"
      ? "Device already isolated"
      : "⊘ Isolate selected device";
}

function renderTimeline() {
  const timeline = $("timeline");

  if (state.events.length === 0) {
    timeline.innerHTML = `
      <div class="empty-timeline">
        No incidents yet. Run a scenario to begin an investigation.
      </div>
    `;
    return;
  }

  timeline.innerHTML = state.events.map(event => `
    <div class="timeline-entry">
      <div class="timeline-marker ${event.severity}"></div>
      <div>
        <div class="timeline-event-title">${event.title}</div>
        <div class="timeline-event-description">${event.description}</div>
        <div class="timeline-time">${event.time}</div>
      </div>
    </div>
  `).join("");
}

function render() {
  renderNetwork();
  renderMetrics();
  renderDeviceDetails();
  renderTimeline();
}

function selectDevice(id) {
  if (!deviceById(id)) return;
  state.selectedId = id;
  render();
}

function runCameraScenario() {
  if (state.activeIncident) {
    alert("Contain the current incident or reset the lab before starting another scenario.");
    return;
  }

  state.activeIncident = "camera";

  state.status.camera = "compromised";
  state.risk.camera = 94;
  state.reasons.camera = [
    "The simulation marked this camera as compromised.",
    "Suspicious lateral-movement activity was triggered.",
    "Containment is required to stop the simulated attack path."
  ];

  state.risk.router = 56;
  state.reasons.router = [
    "The simulated attack path passes through this router.",
    "Review the connected-device activity."
  ];

  state.risk.gateway = 44;
  state.reasons.gateway = [
    "The attack path reaches this network segment.",
    "This score represents simulated exposure, not confirmed compromise."
  ];

  state.risk.lock = 32;
  state.reasons.lock = [
    "The device is downstream of the simulated attack path.",
    "No direct compromise is simulated for this device."
  ];

  state.attackEdges = [
    "camera-router",
    "router-gateway",
    "gateway-lock"
  ];

  state.selectedId = "camera";

  addEvent(
    "Camera compromise simulated",
    "The smart camera has been marked compromised in the lab.",
    "danger"
  );

  addEvent(
    "Lateral movement path displayed",
    "The simulated path runs from camera through router and gateway toward the smart lock.",
    "warning"
  );

  addEvent(
    "Risk assessment updated",
    "Risk scores were recalculated using the predefined scenario rules.",
    "info"
  );

  render();
}

function runGatewayScenario() {
  if (state.activeIncident) {
    alert("Contain the current incident or reset the lab before starting another scenario.");
    return;
  }

  state.activeIncident = "gateway";

  state.status.gateway = "compromised";
  state.risk.gateway = 96;
  state.reasons.gateway = [
    "The gateway was marked compromised by this scenario.",
    "Suspicious gateway activity was simulated.",
    "Connected devices may be exposed through this node."
  ];

  state.risk.router = 62;
  state.reasons.router = [
    "The gateway is connected to the central router.",
    "The simulation indicates increased network exposure."
  ];

  state.risk.lock = 58;
  state.reasons.lock = [
    "The device is connected downstream of the compromised gateway.",
    "Potential exposure is simulated; direct compromise is not confirmed."
  ];

  state.risk.laptop = 58;
  state.reasons.laptop = [
    "The endpoint is connected to the compromised gateway.",
    "Review the simulated incident before taking action."
  ];

  state.attackEdges = [
    "router-gateway",
    "gateway-lock",
    "gateway-laptop"
  ];

  state.selectedId = "gateway";

  addEvent(
    "Gateway compromise simulated",
    "The IoT gateway has been marked compromised in the lab.",
    "danger"
  );

  addEvent(
    "Connected devices flagged",
    "The smart lock and admin laptop show increased simulated exposure.",
    "warning"
  );

  addEvent(
    "Risk assessment updated",
    "Risk scores were recalculated using the predefined scenario rules.",
    "info"
  );

  render();
}

function isolateSelectedDevice() {
  const id = state.selectedId;

  if (!id || state.status[id] !== "compromised") return;

  const device = deviceById(id);

  state.status[id] = "isolated";
  state.risk[id] = 22;
  state.reasons[id] = [
    "The simulated device has been isolated from the network.",
    "The active attack path has been stopped in the simulation.",
    "Isolation does not prove that the device is clean."
  ];

  state.attackEdges = [];
  state.activeIncident = null;

  addEvent(
    "Device isolated",
    `${device.name} was isolated in the simulation. The active attack path was stopped.`,
    "success"
  );

  addEvent(
    "Incident contained",
    "The simulated incident is marked contained. The device remains isolated until reset.",
    "success"
  );

  render();
}

function resetLab() {
  state = initialState();
  render();
}

$("network-map").addEventListener("click", event => {
  const node = event.target.closest("[data-device]");
  if (node) selectDevice(node.dataset.device);
});

$("network-map").addEventListener("keydown", event => {
  if (event.key !== "Enter" && event.key !== " ") return;

  const node = event.target.closest("[data-device]");
  if (!node) return;

  event.preventDefault();
  selectDevice(node.dataset.device);
});

$("attack-camera").addEventListener("click", runCameraScenario);
$("attack-gateway").addEventListener("click", runGatewayScenario);
$("isolate-btn").addEventListener("click", isolateSelectedDevice);
$("reset-btn").addEventListener("click", resetLab);

render();
