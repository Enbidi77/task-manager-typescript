import { describe, it, expect } from 'vitest';
import { MemoryMetricHistory } from '../src/index.js';
import { createMockSnapshot } from '@taskpulse/testing';

describe('MemoryMetricHistory', () => {
  it('records snapshots and maintains time series data', async () => {
    const history = new MemoryMetricHistory(300, 100);
    const snap1 = await createMockSnapshot();
    const snap2 = await createMockSnapshot({
      timestamp: Date.now() + 1000,
      cpu: { ...snap1.cpu, utilization: 75.5 },
    });

    history.addSnapshot(snap1);
    history.addSnapshot(snap2);

    expect(history.size()).toBe(2);
    expect(history.getLatestSnapshot()?.id).toBe(snap2.id);

    const cpuHistory = history.getCpuHistory();
    expect(cpuHistory.length).toBe(2);
    expect(cpuHistory[1].value).toBe(75.5);

    const memHistory = history.getMemoryHistory();
    expect(memHistory.length).toBe(2);

    const diskHistory = history.getDiskIoHistory();
    expect(diskHistory.length).toBe(2);

    const netHistory = history.getNetworkHistory();
    expect(netHistory.length).toBe(2);

    const gpuHistory = history.getGpuHistory();
    expect(gpuHistory.length).toBe(2);
  });

  it('prunes snapshots older than retention duration', async () => {
    const history = new MemoryMetricHistory(5, 50); // 5 seconds retention
    const now = Date.now();

    const oldSnap = await createMockSnapshot({ timestamp: now - 10000 });
    const newSnap = await createMockSnapshot({ timestamp: now });

    history.addSnapshot(oldSnap);
    history.addSnapshot(newSnap);

    // Old snapshot should have been pruned
    expect(history.size()).toBe(1);
    expect(history.getSnapshots().length).toBe(1);
  });

  it('clears all recorded time series', async () => {
    const history = new MemoryMetricHistory();
    const snap = await createMockSnapshot();
    history.addSnapshot(snap);
    expect(history.size()).toBe(1);

    history.clear();
    expect(history.size()).toBe(0);
    expect(history.getLatestSnapshot()).toBeNull();
  });
});
