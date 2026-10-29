import process from 'node:process';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import si from 'systeminformation';
import {
  IProcessMonitor,
  ProcessMetrics,
  ProcessState,
  ProviderMetadata,
  ProviderHealth,
  ProcessTerminationError,
  available,
  unavailable,
} from '@taskpulse/core';
import { ILogger } from '@taskpulse/logging';
import {
  getWin32ProcessTelemetry,
  getWin32ProcessThreadCounts,
  terminateWin32Process,
} from './windows/native-adapter.js';

const execFileAsync = promisify(execFile);

export class SystemProcessProvider implements IProcessMonitor {
  readonly metadata: ProviderMetadata = {
    id: 'system-processes',
    name: 'System Process Monitor',
    version: '1.0.0',
    supportedPlatforms: ['win32', 'linux', 'darwin'],
    capabilities: [
      {
        id: 'proc-list',
        name: 'Process Enumeration',
        status: 'supported',
        description: 'Lists active processes',
      },
      {
        id: 'proc-terminate',
        name: 'Process Termination',
        status: 'supported',
        description: 'Graceful or force termination via Win32 FFI or OS signals',
      },
      {
        id: 'proc-native-telemetry',
        name: 'Win32 Process Telemetry',
        status: process.platform === 'win32' ? 'supported' : 'unsupported',
        description: 'Query open handles, private working set, and page faults via Win32 API',
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

  async collect(_signal?: AbortSignal): Promise<ProcessMetrics[]> {
    const start = performance.now();
    try {
      const procData = await si.processes();
      const list = procData.list || [];
      const threadCounts = process.platform === 'win32' ? getWin32ProcessThreadCounts() : null;

      const processes: ProcessMetrics[] = list.map((p) => {
        let state: ProcessState = 'unknown';
        const st = (p.state || '').toLowerCase();
        if (st.includes('running') || st === 'r') state = 'running';
        else if (st.includes('sleeping') || st === 's') state = 'sleeping';
        else if (st.includes('blocked') || st === 'd') state = 'blocked';
        else if (st.includes('stopped') || st === 't') state = 'stopped';
        else if (st.includes('zombie') || st === 'z') state = 'zombie';
        else if (p.cpu > 0) state = 'running';
        else state = 'sleeping';

        const memoryBytes = (p.memRss || p.mem || 0) * 1024; // si returns memory in KB
        const winThreads = threadCounts?.get(p.pid);
        const rawThreads = (p as unknown as { threads?: number }).threads;
        const threadVal =
          winThreads !== undefined
            ? winThreads
            : rawThreads && rawThreads > 0
              ? rawThreads
              : undefined;
        const threads = threadVal !== undefined ? available(threadVal) : unavailable('N/A');
        const execPath = p.path ? available(p.path) : unavailable('Access Denied');

        let handles;
        let privateWorkingSetBytes;
        let peakWorkingSetBytes;
        let pageFaults;

        if (process.platform === 'win32') {
          const telemetry = getWin32ProcessTelemetry(p.pid);
          if (telemetry) {
            if (telemetry.handles !== undefined) {
              handles = available(telemetry.handles);
            }
            if (telemetry.privateWorkingSetBytes !== undefined) {
              privateWorkingSetBytes = available(telemetry.privateWorkingSetBytes);
            }
            if (telemetry.peakWorkingSetBytes !== undefined) {
              peakWorkingSetBytes = available(telemetry.peakWorkingSetBytes);
            }
            if (telemetry.pageFaults !== undefined) {
              pageFaults = available(telemetry.pageFaults);
            }
          }
        }

        return {
          pid: p.pid,
          parentPid: p.parentPid || undefined,
          name: p.name || 'unknown',
          command: p.command || undefined,
          user: p.user || undefined,
          cpuPercent: Math.max(0, p.cpu || 0),
          memoryBytes,
          memoryPercent: Math.max(0, p.mem || 0),
          virtualMemoryBytes: p.memVsz ? p.memVsz * 1024 : undefined,
          threads,
          state,
          priority: p.priority || undefined,
          startedAt: p.started || undefined,
          executablePath: execPath,
          handles,
          privateWorkingSetBytes,
          peakWorkingSetBytes,
          pageFaults,
          diskIo: unavailable('Requires native per-process ETW provider'),
          networkIo: unavailable('Requires native per-process socket filter'),
        };
      });

      const durationMs = Math.round(performance.now() - start);
      this.health = {
        healthy: true,
        lastSampleTimestamp: Date.now(),
        latencyMs: durationMs,
        errorCount: 0,
      };

      return processes;
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

  async terminateProcess(pid: number, force: boolean = false): Promise<boolean> {
    if (pid <= 0) {
      throw new ProcessTerminationError(pid, 'Invalid PID');
    }

    try {
      if (process.platform === 'win32') {
        // Fast path: direct native Win32 TerminateProcess call
        const terminated = terminateWin32Process(pid, force ? 1 : 0);
        if (terminated) {
          return true;
        }

        // Fallback: spawn taskkill utility
        const args = ['/PID', String(pid)];
        if (force) args.push('/F');
        await execFileAsync('taskkill', args);
        return true;
      } else {
        process.kill(pid, force ? 'SIGKILL' : 'SIGTERM');
        return true;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new ProcessTerminationError(pid, msg);
    }
  }

  async getProcessDetails(pid: number): Promise<ProcessMetrics | null> {
    const list = await this.collect();
    return list.find((p) => p.pid === pid) || null;
  }
}
