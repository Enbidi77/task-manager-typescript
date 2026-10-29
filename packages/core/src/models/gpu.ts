import { MetricValue } from './availability.js';

export interface GpuDeviceMetrics {
  id: string;
  name: string;
  vendor: string;
  driverVersion?: string;
  utilization: MetricValue<number>; // 0 to 100 %
  memoryTotalBytes?: number;
  memoryUsedBytes?: number;
  memoryFreeBytes?: number;
  memoryUtilization: MetricValue<number>;
  temperatureCelsius: MetricValue<number>;
  clockSpeedMHz: MetricValue<number>;
  powerWatts: MetricValue<number>;
  fanSpeedPercent: MetricValue<number>;
}

export interface GpuMetrics {
  devices: GpuDeviceMetrics[];
  timestamp: number;
}
