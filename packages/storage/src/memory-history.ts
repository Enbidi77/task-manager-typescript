import { IMetricHistory, SystemSnapshot, TimeSeriesPoint } from '@taskpulse/core';

export class MemoryMetricHistory implements IMetricHistory {
  private snapshots: SystemSnapshot[] = [];
  private cpuHistory: TimeSeriesPoint<number>[] = [];
  private memoryHistory: TimeSeriesPoint<number>[] = [];
  private diskIoHistory: TimeSeriesPoint<{ readBytesSec: number; writeBytesSec: number }>[] = [];
  private networkHistory: TimeSeriesPoint<{ rxBytesSec: number; txBytesSec: number }>[] = [];
  private gpuHistory: TimeSeriesPoint<number>[] = [];

  constructor(
    private readonly retentionDurationSeconds: number = 300,
    private readonly maxSnapshots: number = 1000,
  ) {}

  addSnapshot(snapshot: SystemSnapshot): void {
    const ts = snapshot.timestamp;

    this.snapshots.push(snapshot);
    this.cpuHistory.push({ timestamp: ts, value: snapshot.cpu.utilization });
    this.memoryHistory.push({ timestamp: ts, value: snapshot.memory.utilization });
    this.diskIoHistory.push({
      timestamp: ts,
      value: {
        readBytesSec: snapshot.disk.io.readBytesPerSec,
        writeBytesSec: snapshot.disk.io.writeBytesPerSec,
      },
    });
    this.networkHistory.push({
      timestamp: ts,
      value: {
        rxBytesSec: snapshot.network.totalRxBytesPerSec,
        txBytesSec: snapshot.network.totalTxBytesPerSec,
      },
    });

    const primaryGpu = snapshot.gpu.devices[0];
    const gpuUtil =
      primaryGpu?.utilization.status === 'available' ? primaryGpu.utilization.value : 0;
    this.gpuHistory.push({ timestamp: ts, value: gpuUtil });

    this.prune(ts);
  }

  private prune(currentTimestamp: number): void {
    const cutoff = currentTimestamp - this.retentionDurationSeconds * 1000;

    const pruneSeries = <T>(series: TimeSeriesPoint<T>[]): TimeSeriesPoint<T>[] => {
      const idx = series.findIndex((pt) => pt.timestamp >= cutoff);
      if (idx > 0) {
        return series.slice(idx);
      }
      return series;
    };

    this.cpuHistory = pruneSeries(this.cpuHistory);
    this.memoryHistory = pruneSeries(this.memoryHistory);
    this.diskIoHistory = pruneSeries(this.diskIoHistory);
    this.networkHistory = pruneSeries(this.networkHistory);
    this.gpuHistory = pruneSeries(this.gpuHistory);

    const snapIdx = this.snapshots.findIndex((s) => s.timestamp >= cutoff);
    if (snapIdx > 0) {
      this.snapshots = this.snapshots.slice(snapIdx);
    }

    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots = this.snapshots.slice(this.snapshots.length - this.maxSnapshots);
    }
  }

  private filterByDuration<T>(
    series: TimeSeriesPoint<T>[],
    durationSeconds?: number,
  ): TimeSeriesPoint<T>[] {
    if (!durationSeconds || series.length === 0) return [...series];
    const latestTs = series[series.length - 1].timestamp;
    const cutoff = latestTs - durationSeconds * 1000;
    return series.filter((pt) => pt.timestamp >= cutoff);
  }

  getCpuHistory(durationSeconds?: number): TimeSeriesPoint<number>[] {
    return this.filterByDuration(this.cpuHistory, durationSeconds);
  }

  getMemoryHistory(durationSeconds?: number): TimeSeriesPoint<number>[] {
    return this.filterByDuration(this.memoryHistory, durationSeconds);
  }

  getDiskIoHistory(
    durationSeconds?: number,
  ): TimeSeriesPoint<{ readBytesSec: number; writeBytesSec: number }>[] {
    return this.filterByDuration(this.diskIoHistory, durationSeconds);
  }

  getNetworkHistory(
    durationSeconds?: number,
  ): TimeSeriesPoint<{ rxBytesSec: number; txBytesSec: number }>[] {
    return this.filterByDuration(this.networkHistory, durationSeconds);
  }

  getGpuHistory(durationSeconds?: number): TimeSeriesPoint<number>[] {
    return this.filterByDuration(this.gpuHistory, durationSeconds);
  }

  getSnapshots(durationSeconds?: number): SystemSnapshot[] {
    if (!durationSeconds || this.snapshots.length === 0) return [...this.snapshots];
    const latestTs = this.snapshots[this.snapshots.length - 1].timestamp;
    const cutoff = latestTs - durationSeconds * 1000;
    return this.snapshots.filter((s) => s.timestamp >= cutoff);
  }

  getLatestSnapshot(): SystemSnapshot | null {
    if (this.snapshots.length === 0) return null;
    return this.snapshots[this.snapshots.length - 1];
  }

  clear(): void {
    this.snapshots = [];
    this.cpuHistory = [];
    this.memoryHistory = [];
    this.diskIoHistory = [];
    this.networkHistory = [];
    this.gpuHistory = [];
  }

  size(): number {
    return this.snapshots.length;
  }
}
