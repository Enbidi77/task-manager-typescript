import { SystemSnapshot } from '../models/snapshot.js';

export interface TimeSeriesPoint<T> {
  timestamp: number;
  value: T;
}

export interface HistoryQueryOptions {
  durationSeconds?: number;
  limit?: number;
}

export interface IMetricHistory {
  addSnapshot(snapshot: SystemSnapshot): void;
  getCpuHistory(durationSeconds?: number): TimeSeriesPoint<number>[];
  getMemoryHistory(durationSeconds?: number): TimeSeriesPoint<number>[];
  getDiskIoHistory(
    durationSeconds?: number,
  ): TimeSeriesPoint<{ readBytesSec: number; writeBytesSec: number }>[];
  getNetworkHistory(
    durationSeconds?: number,
  ): TimeSeriesPoint<{ rxBytesSec: number; txBytesSec: number }>[];
  getGpuHistory(durationSeconds?: number): TimeSeriesPoint<number>[];
  getSnapshots(durationSeconds?: number): SystemSnapshot[];
  getLatestSnapshot(): SystemSnapshot | null;
  clear(): void;
  size(): number;
}
