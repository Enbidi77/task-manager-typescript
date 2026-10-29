# TaskPulse Project Roadmap

## Phase 1: Foundation (Completed)

- [x] pnpm workspace & Turborepo setup
- [x] Shared TypeScript configuration and strict type checking
- [x] Prettier and ESLint configuration
- [x] Core domain interfaces and models
- [x] Initial CLI skeleton with Commander

## Phase 2: Monitoring Engine & UI (Completed)

- [x] Real-time CPU, Memory, Disk, and Network collectors
- [x] SamplingCoordinator with collision protection and timeout isolation
- [x] Bounded in-memory time-series history
- [x] Full-screen interactive Ink terminal UI with 10 distinct views
- [x] Unicode sparklines and adaptive progress bars

## Phase 3: Process Explorer & Management (Completed)

- [x] Live OS process enumeration
- [x] Column sorting (CPU, Memory, PID, Name, Threads)
- [x] Dynamic filter & search (`/`)
- [x] Selected process details inspector modal
- [x] Safe process termination dialog (`taskkill` on Windows)

## Phase 4: Telemetry & Exporters (Completed)

- [x] Multi-GPU detection & telemetry
- [x] Hardware thermal & fan sensor support
- [x] CSV and JSON metric export
- [x] Diagnostic `doctor` and `providers` commands
- [x] Threshold-based alerting engine with sustained duration check

## Phase 5: Planned Future Extensions

- [ ] **SQLite Persistence**: Optional persistent SQLite storage engine in `@taskpulse/storage`.
- [ ] **Prometheus Exporter**: Standalone HTTP metric exporter for Prometheus scraping (`@taskpulse/exporters-prometheus`).
- [ ] **Native ETW Adapter**: Windows Event Tracing (ETW) provider for per-process disk and network socket metrics.
- [ ] **Web Dashboard**: Browser-based companion dashboard in `apps/web-dashboard`.
