import { MetricValue } from './availability.js';

export interface DiskVolumeMetrics {
  id: string;
  name: string;
  mount: string;
  fsType: string;
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  utilization: number; // 0 to 100 %
}

export interface DiskDeviceMetrics {
  device: string;
  name: string;
  type: string;
  vendor: string;
  sizeBytes: number;
}

export interface DiskIoMetrics {
  readBytesPerSec: number;
  writeBytesPerSec: number;
  totalBytesPerSec: number;
  readOpsPerSec: MetricValue<number>;
  writeOpsPerSec: MetricValue<number>;
  activityPercent: MetricValue<number>;
}

export interface DiskMetrics {
  volumes: DiskVolumeMetrics[];
  devices: DiskDeviceMetrics[];
  io: DiskIoMetrics;
  timestamp: number;
}
