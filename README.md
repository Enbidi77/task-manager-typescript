# TaskPulse

> **Extensible Real-Time System Resource Monitor & Process Manager in TypeScript**  
> Inspired by Windows Task Manager, `htop`, and `btop`.

TaskPulse is a modern, interactive terminal application built from the ground up in TypeScript. It delivers real-time resource utilization, process exploration, hardware telemetry, threshold-based alerting, and metric export with a responsive, keyboard-driven terminal user interface powered by Ink and React.

---

## 🌟 Highlights

- **Genuine System Metrics**: Collects real operating system metrics (Windows 10/11 first-class target, cross-platform architecture). Never hardcodes or fabricates data.
- **10 Dedicated Terminal Views**:
  1. `Overview`: High-level dashboard with sparklines, resource cards, and top processes.
  2. `Processes`: Interactive Task Manager process explorer with sorting, filtering, selection, details, and safe termination.
  3. `CPU`: Overall utilization, per-core breakdown for all logical processors, clock speeds, and temperatures.
  4. `Memory`: Physical RAM, swap/pagefile, and Windows commit charge with architectural semantics.
  5. `Disks`: Logical volumes, filesystem mount points, storage devices, and live read/write I/O throughput.
  6. `Network`: Adapter metrics, IP addresses, MACs, link speeds, and live upload/download bandwidth.
  7. `GPU`: Multi-GPU support (discrete & integrated), compute loads, VRAM, thermals, clocks, and power.
  8. `Hardware`: CPU package & core thermal sensors, fan tachometers, voltages, and power draw.
  9. `Alerts`: Configurable threshold rules (CPU, Memory, Disk, Temp) with sustained duration and audit history.
  10. `Settings`: Runtime preferences, sampling configuration, UI theme switcher, and provider health diagnostics.
- **Fail-Safe Monitoring Engine**: Provider failures are isolated; if one sensor times out or fails, remaining metrics continue without crashing the application.
- **Clean Architecture Monorepo**: Built as a pnpm monorepo with Turborepo, isolating domain abstractions (`@taskpulse/core`) from collection (`@taskpulse/providers`), sampling (`@taskpulse/monitoring`), and UI (`@taskpulse/terminal-ui`).
- **Scriptable CLI**: Standalone one-shot commands (`summary`, `processes`, `system`, `providers`, `doctor`, `export`) with JSON support for automation and scripts.

---

## 🏗 Monorepo Architecture

```
TaskPulse/
├── apps/
│   ├── cli/             # Commander CLI & dependency injection wiring
│   └── web-dashboard/   # Future web dashboard roadmap & placeholder
├── packages/
│   ├── core/            # Domain models, typed interfaces, units & error classes (zero dependencies)
│   ├── shared/          # Formatting (bytes, durations, rates), sparklines, and progress bars
│   ├── config/          # Zod schema validation, environment variables, config file loader
│   ├── logging/         # Structured logger with TUI-safe file redirection
│   ├── storage/         # Bounded in-memory time-series history & retention pruner
│   ├── monitoring/      # Sampling coordinator, rate calculator, and alert evaluator
│   ├── providers/       # Real metric collectors (CPU, Memory, Disk, Network, GPU, Hardware, Processes)
│   ├── terminal-ui/     # Full-screen React + Ink terminal interface & 10 views
│   ├── exporters/       # CSV and JSON snapshot metrics exporters
│   ├── plugin-api/      # Public extension interfaces for custom providers & exporters
│   └── testing/         # Deterministic mock providers and snapshot fixtures
├── tests/
│   └── integration/     # End-to-end and CLI integration tests
└── docs/                # Architecture, metrics, platform support, and roadmap documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ LTS recommended)
- **pnpm**: v9.0.0 or higher

### Installation & Build

```bash
# Clone the repository
git clone https://github.com/example/taskpulse.git
cd taskpulse

# Install dependencies across all workspace packages
pnpm install

# Build all packages and the CLI
pnpm run build

# Run full test suite (Unit, Component, Integration)
pnpm run test

# Run strict TypeScript type checking across the monorepo
pnpm run type-check

# Run linting
pnpm run lint
```

---

## 💻 Usage

### 1. Interactive Terminal Monitor (Default)

Launch the full-screen interactive terminal dashboard:

```bash
# Run using pnpm script
pnpm cli

# Or directly execute the binary
node apps/cli/dist/index.js

# Custom sampling interval and theme
node apps/cli/dist/index.js monitor --interval 500 --theme nord
```

#### Keyboard Shortcuts:

| Key            | Action                                               |
| -------------- | ---------------------------------------------------- |
| `1` – `9`, `0` | Switch views directly (1: Overview .. 0: Settings)   |
| `↑` / `↓`      | Navigate process table rows                          |
| `Enter`        | Inspect process details modal                        |
| `/`            | Filter/search processes by name, PID, or user        |
| `s`            | Cycle sort column (CPU, Memory, PID, Name, Threads)  |
| `S`            | Toggle sort direction (Ascending / Descending)       |
| `k`            | Terminate selected process (`y` graceful, `Y` force) |
| `p`            | Pause / Resume metric sampling                       |
| `r`            | Force immediate refresh                              |
| `?`            | Toggle keyboard help modal                           |
| `q` / `Ctrl+C` | Quit TaskPulse                                       |

---

### 2. Scriptable CLI Commands

#### System Resource Summary

```bash
# Human-readable summary
node apps/cli/dist/index.js summary

# Structured JSON for scripts
node apps/cli/dist/index.js summary --json
```

#### Process Explorer

```bash
# Top 10 CPU-consuming processes
node apps/cli/dist/index.js processes --limit 10 --sort cpu

# Top memory consumers in JSON
node apps/cli/dist/index.js processes --limit 5 --sort memory --json
```

#### Hardware & Operating System Inventory

```bash
node apps/cli/dist/index.js system
```

#### Metric Providers & Latency Diagnostics

```bash
node apps/cli/dist/index.js providers
```

#### Diagnostic Doctor Check

Verifies runtime environment, permissions, driver support, and sensor access:

```bash
node apps/cli/dist/index.js doctor
```

#### Metric History Export (CSV / JSON)

Record time-series metrics over a duration:

```bash
# Export 5 seconds of snapshots to CSV
node apps/cli/dist/index.js export --format csv --duration 5 --output metrics.csv

# Export snapshots to JSON
node apps/cli/dist/index.js export --format json --duration 5 --output metrics.json
```

---

## 🔒 Permissions & Platform Notes

### Windows 10/11 (Primary Target):

- **Standard User**: Core metrics (CPU usage, RAM, Virtual Memory commit, disk volume capacities, network bandwidth, process list) are fully supported without elevation.
- **Administrator Privileges**: Motherboard hardware sensor chips (package/core temperatures, fan tachometers) and terminating protected system processes require running PowerShell or Command Prompt as Administrator.
- **Dedicated GPUs**: NVIDIA and AMD discrete GPUs expose utilization, VRAM, and temperatures when vendor display drivers are installed.

---

## 📜 License

MIT License.
