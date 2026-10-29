import { MetricValue } from './availability.js';

export type ProcessState = 'running' | 'sleeping' | 'blocked' | 'stopped' | 'zombie' | 'unknown';

export interface ProcessMetrics {
  pid: number;
  parentPid?: number;
  name: string;
  command?: string;
  user?: string;
  cpuPercent: number;
  memoryBytes: number;
  memoryPercent: number;
  virtualMemoryBytes?: number;
  threads: MetricValue<number>;
  state: ProcessState;
  priority?: number;
  startedAt?: string;
  executablePath: MetricValue<string>;
  diskIo: MetricValue<{ readBytesPerSec: number; writeBytesPerSec: number }>;
  networkIo: MetricValue<{ rxBytesPerSec: number; txBytesPerSec: number }>;
}

export type ProcessSortField = 'cpu' | 'memory' | 'pid' | 'name' | 'threads';
export type ProcessSortDirection = 'asc' | 'desc';

export interface ProcessFilterOptions {
  query?: string;
  user?: string;
  minCpu?: number;
  minMemoryBytes?: number;
  limit?: number;
  sortField?: ProcessSortField;
  sortDirection?: ProcessSortDirection;
}
