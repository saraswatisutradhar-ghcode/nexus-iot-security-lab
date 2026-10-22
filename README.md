# NEXUS — IoT Security Simulation & Containment Lab

NEXUS is a browser-based educational simulator that demonstrates how a simulated security incident involving an IoT device can affect connected devices in a network.

It provides an interactive network topology, predefined attack scenarios, illustrative risk scores, an incident timeline, and simulated device containment.

> **Important:** NEXUS is an educational simulation. It does not monitor real network traffic, perform actual cyberattacks, detect real intrusions, or isolate physical devices. Risk scores are illustrative values defined by the scenarios.

## Features

- **Interactive network topology:** Explore six simulated devices and their connections.
- **Camera compromise scenario:** Observe a simulated lateral-movement path originating from a compromised smart camera.
- **Gateway threat scenario:** Explore a simulated incident involving a suspicious IoT gateway.
- **Illustrative risk scores:** View predefined risk values and explanations for selected devices.
- **Incident timeline:** Review the sequence of events generated during a scenario.
- **Simulated containment:** Isolate a simulated device and observe the displayed attack path being stopped.
- **Reset and replay:** Restore the initial state and run scenarios again.

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript

## Getting Started

### Prerequisites

A modern web browser and a code editor such as Visual Studio Code.

### Run Locally

1. Download or clone this repository.
2. Open the project folder.
3. Open `index.html` in your browser.

No backend, database, paid API, or additional package installation is required.

## Project Structure

- `index.html` — page structure and interface
- `style.css` — layout, styling, and visual design
- `script.js` — simulated device state, scenario behavior, risk display, event logging, containment, and reset logic

## How It Works

NEXUS uses predefined JavaScript rules to update the state of virtual devices when a scenario is triggered. The interface then displays the updated device statuses, risk values, attack-path visualization, and incident events.

Selecting a device displays its details. Simulated isolation changes its displayed state and removes the active simulated attack path. Reset restores the initial lab state.

## Limitations

- No real IoT devices or network traffic are accessed.
- The scenarios are predefined and do not represent a real attack engine.
- Risk scores are illustrative, not outputs of a validated risk-assessment model.
- Containment is simulated in the interface; it does not change network configuration.
- The application does not provide real intrusion detection or security guarantees.

## Future Improvements

- Add a transparent, configurable risk-scoring model.
- Improve scenario explanations and event filtering.
- Add automated tests for scenario transitions and reset behavior.
- Improve accessibility and responsive behavior.

## Purpose

NEXUS was developed as a learning project to explore IoT network concepts, cybersecurity incident visualization, and simulated containment workflows.