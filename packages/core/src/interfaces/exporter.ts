import { SystemSnapshot } from '../models/snapshot.js';

export type ExportFormat = 'csv' | 'json';

export interface ExportOptions {
  metrics?: ('cpu' | 'memory' | 'disk' | 'network' | 'gpu' | 'processes')[];
  durationSeconds?: number;
  includeProcesses?: boolean;
}

export interface ExportResult {
  format: ExportFormat;
  data: string;
  filename?: string;
  snapshotCount: number;
  timestamp: number;
}

export interface IMetricExporter {
  readonly format: ExportFormat;
  export(snapshots: SystemSnapshot[], options?: ExportOptions): Promise<ExportResult>;
}
