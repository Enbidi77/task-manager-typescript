import os from 'node:os';
import si from 'systeminformation';
import {
  IMemoryMonitor,
  MemoryMetrics,
  ProviderMetadata,
  ProviderHealth,
  available,
} from '@taskpulse/core';
import { ILogger } from '@taskpulse/logging';

export class SystemMemoryProvider implements IMemoryMonitor {
  readonly metadata: ProviderMetadata = {
    id: 'system-memory',
    name: 'System Memory Monitor',
    version: '1.0.0',
    supportedPlatforms: ['win32', 'linux', 'darwin'],
    capabilities: [
      {
        id: 'memory-physical',
        name: 'Physical RAM',
        status: 'supported',
        description: 'Total, used, and free RAM',
      },
      {
        id: 'memory-swap',
        name: 'Swap/Pagefile',
        status: 'supported',
        description: 'Page file usage',
      },
      {
        id: 'memory-virtual',
        name: 'Virtual Memory & Commit',
        status: 'supported',
        description: 'Commit charge metrics',
      },
    ],
  };

  private health: ProviderHealth = {
    healthy: true,
    lastSampleTimestamp: 0,
    latencyMs: 0,
    errorCount: 0,
  };

  constructor(private readonly logger?: ILogger) {}

  async initialize(): Promise<void> {}
  async dispose(): Promise<void> {}

  getHealth(): ProviderHealth {
    return { ...this.health };
  }

  async collect(_signal?: AbortSignal): Promise<MemoryMetrics> {
    const start = performance.now();
    try {
      const mem = await si.mem();

      const totalBytes = mem.total || os.totalmem();
      const freeBytes = mem.free || os.freemem();
      const availableBytes = mem.available || freeBytes;
      const usedBytes = totalBytes - availableBytes;
      const utilization = totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0;

      const swapTotal = mem.swaptotal || 0;
      const swapUsed = mem.swapused || 0;
      const swapFree = mem.swapfree || 0;
      const swapUtil = swapTotal > 0 ? (swapUsed / swapTotal) * 100 : 0;

      // On Windows: Commit Limit is physical RAM + pagefile size
      const commitLimitBytes = totalBytes + swapTotal;
      const commitTotalBytes = usedBytes + swapUsed;
      const commitUtilization =
        commitLimitBytes > 0 ? (commitTotalBytes / commitLimitBytes) * 100 : 0;

      const isWin = process.platform === 'win32';
      const semanticsDesc = isWin
        ? 'Windows reports Working Set and Standby memory. "Available" includes zeroed, free, and standby pages. Virtual memory reflects the system Commit Charge against the Commit Limit.'
        : 'Linux distinguishes buffers and cached pages from unallocated memory. "Available" estimates how much memory can be started without swapping.';

      const durationMs = Math.round(performance.now() - start);
      this.health = {
        healthy: true,
        lastSampleTimestamp: Date.now(),
        latencyMs: durationMs,
        errorCount: 0,
      };

      return {
        totalBytes,
        usedBytes,
        freeBytes,
        availableBytes,
        utilization,
        swap: {
          totalBytes: swapTotal,
          usedBytes: swapUsed,
          freeBytes: swapFree,
          utilization: swapUtil,
        },
        virtualMemory: available({
          commitTotalBytes,
          commitLimitBytes,
          commitUtilization,
        }),
        cachedBytes: mem.buffcache || 0,
        buffersBytes: mem.buffers || 0,
        platformSemantics: {
          os: isWin ? 'win32' : (process.platform as 'linux' | 'darwin' | 'other'),
          description: semanticsDesc,
        },
        timestamp: Date.now(),
      };
    } catch (err: unknown) {
      const durationMs = Math.round(performance.now() - start);
      const errMsg = err instanceof Error ? err.message : String(err);
      this.health = {
        healthy: false,
        lastSampleTimestamp: Date.now(),
        latencyMs: durationMs,
        errorCount: this.health.errorCount + 1,
        lastError: errMsg,
      };
      throw err;
    }
  }
}
