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

export interface WindowsKernelMemoryMetrics {
  pagedPoolBytes: number;
  nonPagedPoolBytes: number;
  systemCacheBytes: number;
  commitPeakBytes: number;
  systemHandles: number;
  systemThreads: number;
  processCount: number;
}

export interface MemoryMetrics {
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  availableBytes: number;
  utilization: number; // 0 to 100 %
  swap: MemorySwapMetrics;
  virtualMemory: MetricValue<VirtualMemoryMetrics>;
  kernelMemory?: MetricValue<WindowsKernelMemoryMetrics>;
  cachedBytes?: number;
  buffersBytes?: number;
  platformSemantics: {
    os: 'win32' | 'linux' | 'darwin' | 'other';
    description: string;
  };
  timestamp: number;
}
