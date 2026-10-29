import { describe, it, expect, vi } from 'vitest';
import { AlertEvaluator, CollectorPool, SamplingCoordinator } from '../src/index.js';
import {
  MockCpuMonitor,
  MockMemoryMonitor,
  MockDiskMonitor,
  MockNetworkMonitor,
  MockGpuMonitor,
  MockHardwareMonitor,
  MockProcessMonitor,
  createMockSnapshot,
} from '@taskpulse/testing';
import { MemoryMetricHistory } from '@taskpulse/storage';
import { ICpuMonitor, ProviderMetadata, ProviderHealth } from '@taskpulse/core';

describe('AlertEvaluator', () => {
  it('triggers an incident when threshold is violated for sustained duration', async () => {
    const evaluator = new AlertEvaluator([
      {
        id: 'cpu-high',
        name: 'High CPU',
        metric: 'cpu_utilization',
        threshold: 80,
        comparison: '>=',
        severity: 'warning',
        durationSeconds: 0, // trigger immediately
        enabled: true,
      },
    ]);

    const normalSnap = await createMockSnapshot();
    const highSnap = await createMockSnapshot({
      cpu: { ...normalSnap.cpu, utilization: 85.0 },
    });

    const noIncidents = evaluator.evaluate(normalSnap);
    expect(noIncidents.length).toBe(0);

    const triggered = evaluator.evaluate(highSnap);
    expect(triggered.length).toBe(1);
    expect(triggered[0].ruleId).toBe('cpu-high');
    expect(triggered[0].active).toBe(true);

    expect(evaluator.getActiveIncidents().length).toBe(1);

    // Resolves when load returns to normal
    evaluator.evaluate(normalSnap);
    expect(evaluator.getActiveIncidents().length).toBe(0);
  });
});

describe('CollectorPool', () => {
  it('collects metrics from all registered collectors', async () => {
    const pool = new CollectorPool({
      cpu: new MockCpuMonitor(),
      memory: new MockMemoryMonitor(),
      disk: new MockDiskMonitor(),
      network: new MockNetworkMonitor(),
      gpu: new MockGpuMonitor(),
      hardware: new MockHardwareMonitor(),
      processes: new MockProcessMonitor(),
    });

    await pool.initialize();
    const result = await pool.collectAll();
    await pool.dispose();

    expect(result.cpu.utilization).toBe(35.5);
    expect(result.memory.utilization).toBe(60);
    expect(result.disk.volumes.length).toBe(1);
    expect(result.network.interfaces.length).toBe(1);
    expect(result.processes.length).toBe(3);
    expect(result.providerStatus.cpu.healthy).toBe(true);
  });

  it('isolates failures: when one provider throws, others continue unaffected', async () => {
    class FailingCpuMonitor implements ICpuMonitor {
      readonly metadata: ProviderMetadata = {
        id: 'failing-cpu',
        name: 'Failing CPU',
        version: '1.0.0',
        supportedPlatforms: ['win32'],
        capabilities: [],
      };
      async initialize() {}
      async dispose() {}
      getHealth(): ProviderHealth {
        return { healthy: false, lastSampleTimestamp: 0, latencyMs: 0, errorCount: 1 };
      }
      async collect(): Promise<any> {
        throw new Error('Access Denied to Hardware Counter');
      }
    }

    const pool = new CollectorPool({
      cpu: new FailingCpuMonitor(),
      memory: new MockMemoryMonitor(),
    });

    const result = await pool.collectAll();

    expect(result.providerStatus.cpu.healthy).toBe(false);
    expect(result.providerStatus.cpu.error).toContain('Access Denied');
    // Memory collector still completed successfully!
    expect(result.providerStatus.memory.healthy).toBe(true);
    expect(result.memory.utilization).toBe(60);
  });
});

describe('SamplingCoordinator', () => {
  it('manages sampling lifecycle, history, and notifications', async () => {
    const pool = new CollectorPool({
      cpu: new MockCpuMonitor(),
      memory: new MockMemoryMonitor(),
    });

    const history = new MemoryMetricHistory();
    const evaluator = new AlertEvaluator();
    const coordinator = new SamplingCoordinator(pool, history, evaluator, {
      intervalMs: 1000,
    });

    await coordinator.initialize();

    const snapshotListener = vi.fn();
    const unsub = coordinator.onSnapshot(snapshotListener);

    const snap = await coordinator.forceSample();
    expect(snap).not.toBeNull();
    expect(snapshotListener).toHaveBeenCalledTimes(1);
    expect(history.size()).toBe(1);

    // Pause & Resume
    expect(coordinator.isPaused()).toBe(false);
    coordinator.pause();
    expect(coordinator.isPaused()).toBe(true);
    coordinator.resume();
    expect(coordinator.isPaused()).toBe(false);

    unsub();
    await coordinator.dispose();
  });
});
