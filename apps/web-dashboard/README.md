# TaskPulse Web Dashboard (Future Extension)

This directory is reserved for a future web-based monitoring dashboard for TaskPulse.

## Architecture Vision

- **Frontend**: Lightweight React/Vite web application with WebSocket streaming.
- **Backend Bridge**: Consumes `@taskpulse/core` and `@taskpulse/monitoring` via an optional HTTP/WebSocket daemon mode in `@taskpulse/cli`.
- **Status**: Currently planned for Phase 7 after CLI and terminal UI stabilization.
