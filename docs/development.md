# TaskPulse Development Guide

## Monorepo Layout

The repository is organized as a pnpm workspace with Turborepo task orchestration:

- `apps/cli`: CLI commands and interactive entrypoint.
- `packages/core`: Zero-dependency domain models and contracts.
- `packages/shared`: Pure formatting and math helpers.
- `packages/config`: Zod validation schemas and configuration file resolution.
- `packages/logging`: Structured logging with TUI file redirection.
- `packages/storage`: Time-series history buffers.
- `packages/monitoring`: Sampling coordination, timeouts, and alert evaluation.
- `packages/providers`: Systeminformation and Node built-in metrics collectors.
- `packages/terminal-ui`: React + Ink terminal views and components.
- `packages/exporters`: CSV and JSON serialization.
- `packages/plugin-api`: Plugin extension contracts.
- `packages/testing`: Test doubles, mock monitors, and snapshot fixtures.

## Workflows

### 1. Building the Monorepo

```bash
pnpm run build
```

### 2. Running Tests

```bash
pnpm run test
```

### 3. Type Checking

```bash
pnpm run type-check
```

### 4. Code Formatting & Linting

```bash
pnpm run lint
pnpm run format
pnpm run format:check
```

### 5. Running the CLI in Development

```bash
pnpm run cli:dev -- summary
```
