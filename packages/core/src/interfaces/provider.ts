import { MetricCapability } from '../models/availability.js';

export interface ProviderMetadata {
  id: string;
  name: string;
  version: string;
  supportedPlatforms: ('win32' | 'linux' | 'darwin')[];
  capabilities: MetricCapability[];
}

export interface ProviderHealth {
  healthy: boolean;
  lastSampleTimestamp: number;
  latencyMs: number;
  errorCount: number;
  lastError?: string;
}

export interface IMetricProvider<T> {
  readonly metadata: ProviderMetadata;
  initialize(): Promise<void>;
  collect(signal?: AbortSignal): Promise<T>;
  dispose(): Promise<void>;
  getHealth(): ProviderHealth;
}
