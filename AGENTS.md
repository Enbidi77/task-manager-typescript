# TaskPulse — AI & Developer Agent Guidelines (`AGENTS.md`)

This document defines architecture, package boundaries, development conventions, and protocols for agents and developers modifying the TaskPulse repository.

---

## 1. Architectural Overview & Boundaries

TaskPulse is an extensible system resource monitor built with TypeScript as a **pnpm monorepo** managed by **Turborepo**.

```
apps/cli ──────────► packages/terminal-ui
   │                         │
   ▼                         ▼
packages/monitoring ◄─── packages/core ◄─── packages/shared
   │                         ▲
   ▼                         │
packages/providers ──────────┘
   │
packages/storage, packages/exporters, packages/config, packages/plugin-api, packages/testing
```

### Dependency Rules:

1. **`packages/core` is strictly pure**:
   - Zero runtime dependencies.
   - Contains domain interfaces (`ICpuMonitor`, `IMemoryMonitor`, etc.), domain models (`CpuMetrics`, `SystemSnapshot`), unit definitions, and error classes (`MonitoringError`).
   - Must NEVER depend on React, Ink, systeminformation, or OS-specific code.
2. **`packages/monitoring` coordinates sampling**:
   - Manages collection scheduling, provider health tracking, timeouts, alert evaluation, and history buffering.
   - Must never directly render UI or couple directly to concrete OS syscalls (depends only on core monitor interfaces).
3. **`packages/providers` owns real metric collection**:
   - Collects real metrics using `systeminformation` and Node.js built-ins (`node:os`, `node:child_process`, `node:fs`).
   - Maps raw system data into typed domain models.
   - Never fabricate data: use `available(val)` or `unavailable(reason)`.
4. **`packages/terminal-ui` owns interactive rendering**:
   - React + Ink components for full-screen interactive terminal monitoring.
   - 10 distinct views (Overview, Processes, CPU, Memory, Disks, Network, GPU, Hardware, Alerts, Settings).
   - Manages focus state, modals, keyboard navigation, and responsive terminal layout.
5. **`apps/cli` is the entrypoint**:
   - Handles argument parsing via `commander`.
   - Dependency injection container composition.
   - Non-interactive script modes (`summary`, `processes`, `system`, `providers`, `doctor`, `export`).

---

## 2. Monorepo Development Commands

Always use `pnpm` from the monorepo root:

| Command                  | Action                                                 |
| ------------------------ | ------------------------------------------------------ |
| `pnpm install`           | Install all dependencies and link workspace packages   |
| `pnpm run build`         | Build all packages and CLI with Turborepo & tsup       |
| `pnpm run test`          | Run the complete Vitest test suite across all packages |
| `pnpm run type-check`    | Run `tsc --noEmit` across all packages via Turborepo   |
| `pnpm run lint`          | Run ESLint with TypeScript flat config                 |
| `pnpm run format`        | Format the entire codebase with Prettier               |
| `pnpm run format:check`  | Verify formatting consistency                          |
| `pnpm run cli -- <args>` | Execute the CLI locally                                |
| `pnpm run cli:dev`       | Run the CLI in development mode using `tsx`            |

---

## 3. How to Add a New Metric Provider

To add a new metric provider (e.g. for Linux `/proc` or a custom hardware sensor):

1. **Define the Capability & Interface in `@taskpulse/core`** (if not already existing):
   - Add capability identifier in `packages/core/src/models/availability.ts`.
   - Update or extend provider interface in `packages/core/src/interfaces/monitors.ts`.
2. **Implement Provider in `@taskpulse/providers`**:
   - Create a class implementing `IMetricProvider<T>` or a specific monitor interface.
   - Implement `readonly metadata: ProviderMetadata` listing supported platforms and capabilities.
   - Implement `initialize()`, `dispose()`, `getHealth()`, and `collect(signal?: AbortSignal)`.
   - Handle permissions and unsupported metrics honestly with `unavailable('Reason')`.
3. **Add Mock Implementation in `@taskpulse/testing`**:
   - Add deterministic mock provider and update fixtures.
4. **Wire into Container in `apps/cli/src/di/container.ts`**:
   - Register provider instance in `CollectorPool`.
5. **Verify with Tests & CLI**:
   - Run `pnpm test` and `node apps/cli/dist/index.js providers`.

---

## 4. Code Standards & Conventions

- **ESM Only**: Use `"type": "module"` and explicit `.js` import specifiers in TypeScript imports (e.g. `import { foo } from './foo.js'`).
- **Strict Typing**: No untyped `any` without explicit justification.
- **Fail-Safe Monitoring**: Individual provider exceptions must never crash the sampling loop. Providers must be wrapped in timeout/error boundaries.
- **TUI Safety**: Never call `console.log()` or write to stdout during interactive Ink rendering mode. Redirect logs to files or null sinks via `@taskpulse/logging`.
