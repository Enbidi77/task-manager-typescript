import { MetricValue } from './availability.js';

export interface CpuCoreMetrics {
  coreId: number;
  utilization: number; // 0 to 100 %
  frequencyMHz?: number;
}

export interface CpuHardwareInfo {
  manufacturer: string;
  brand: string;
  speedGHz: number;
  physicalCores: number;
  logicalCores: number;
  socket?: string;
}

export interface CpuMetrics {
  utilization: number; // 0 to 100 %
  cores: CpuCoreMetrics[];
  hardware: CpuHardwareInfo;
  currentFrequencyGHz: MetricValue<number>;
  temperatureCelsius: MetricValue<number>;
  loadAverage: [number, number, number];
  timestamp: number;
}
