import { MetricValue } from './availability.js';

export interface MemorySwapMetrics {
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  utilization: number; // 0 to 100 %
}

export interface VirtualMemoryMetrics {
  commitTotalBytes: number;
  commitLimitBytes: number;
  commitUtilization: number; // 0 to 100 %
}

export interface MemoryMetrics {
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  availableBytes: number;
  utilization: number; // 0 to 100 %
  swap: MemorySwapMetrics;
  virtualMemory: MetricValue<VirtualMemoryMetrics>;
  cachedBytes?: number;
  buffersBytes?: number;
  platformSemantics: {
    os: 'win32' | 'linux' | 'darwin' | 'other';
    description: string;
  };
  timestamp: number;
}
