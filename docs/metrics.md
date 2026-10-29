# TaskPulse Metrics & Sampling Reference

## Metric Types & Availability

TaskPulse wraps all dynamic measurements in the discriminated union `MetricValue<T>`:

```typescript
type MetricValue<T> =
  | { status: 'available'; value: T; timestamp: number }
  | { status: 'unavailable'; reason: string; timestamp: number }
  | { status: 'stale'; value: T; timestamp: number; staleSince: number }
  | { status: 'error'; error: string; timestamp: number };
```

This prevents fabricating zeros for unsupported features (e.g. GPU temperature on an integrated GPU or fan tachometers requiring kernel drivers).

## Subsystems

### CPU Metrics

- **Overall Utilization (%)**: Computed via delta busy time vs total processor time.
- **Per-Core Utilization (%)**: Independent utilization for each logical core.
- **Clock Speed (GHz)**: Real-time clock speed if reported by OS performance counters.
- **Package Temperature (°C)**: Thermal reading from motherboard ACPI / thermal zones.

### Memory Metrics

- **Total Physical RAM**: Total installed physical memory.
- **Used & Available**:
  - On Windows: Available includes zeroed pages, free list, and standby cache.
  - On Linux: Available estimates memory available for starting new applications without swapping.
- **Commit Charge & Limit**: On Windows, tracks the system commit charge against physical RAM + pagefile size.

### Storage & Live I/O

- **Logical Volumes**: Mounted drives, filesystem type, total capacity, used, and free space.
- **Live Throughput**: Monotonic delta calculations for Read MB/s and Write MB/s.

### Network Throughput

- **Adapters**: Name, operational state (Up/Down), IPv4, IPv6, MAC, link speed.
- **Live Bandwidth**: Monotonic delta calculations for Rx (Download) and Tx (Upload) rates.

### GPU Subsystem

- **Adapters**: Detects discrete (NVIDIA, AMD) and integrated (Intel, Apple) GPUs.
- **Compute Load & VRAM**: Percentage compute utilization and dedicated video memory usage.
- **Thermals & Power**: Temperature, fan speeds, clock frequencies, and power draw where reported by vendor drivers.
