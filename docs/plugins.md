# TaskPulse Plugin Architecture

TaskPulse defines an extensible plugin contract via `@taskpulse/plugin-api`.

## Plugin Contract

A TaskPulse plugin implements the `ITaskPulsePlugin` interface:

```typescript
import { ITaskPulsePlugin, PluginContext } from '@taskpulse/plugin-api';
import { IMetricProvider } from '@taskpulse/core';

export class CustomHardwarePlugin implements ITaskPulsePlugin {
  readonly id = 'custom-hardware-plugin';
  readonly name = 'Custom Hardware Telemetry';
  readonly version = '1.0.0';

  initialize(context: PluginContext): void {
    // Register custom metric provider
    context.registerProvider(new MyCustomSensorProvider());
  }

  dispose(): void {
    // Cleanup resources
  }
}
```

## Extension Points

1. **Custom Metric Providers**:
   Allows registering additional telemetry collectors (e.g. IPMI servers, Raspberry Pi GPIO sensors, custom cloud metrics).
2. **Custom Exporters**:
   Allows exporting snapshots to alternative sinks (e.g. SQLite database, InfluxDB, Prometheus HTTP endpoint, or Datadog agent).
