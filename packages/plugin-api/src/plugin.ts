import { IMetricProvider, IMetricExporter } from '@taskpulse/core';

export interface IProviderRegistry {
  register(provider: IMetricProvider<any>): void;
}

export interface IExporterRegistry {
  register(exporter: IMetricExporter): void;
}

export interface PluginContext {
  version: string;
  config: Record<string, unknown>;
  registerProvider: (provider: IMetricProvider<any>) => void;
  registerExporter: (exporter: IMetricExporter) => void;
}

export interface ITaskPulsePlugin {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  initialize(context: PluginContext): Promise<void> | void;
  dispose?(): Promise<void> | void;
}
