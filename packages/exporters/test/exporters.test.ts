import { describe, it, expect } from 'vitest';
import { CsvExporter, JsonExporter } from '../src/index.js';
import { createMockSnapshot } from '@taskpulse/testing';

describe('Exporters', () => {
  it('exports snapshots to CSV format with proper columns', async () => {
    const snap1 = await createMockSnapshot();
    const snap2 = await createMockSnapshot({ timestamp: Date.now() + 1000 });

    const exporter = new CsvExporter();
    const result = await exporter.export([snap1, snap2]);

    expect(result.format).toBe('csv');
    expect(result.snapshotCount).toBe(2);

    const lines = result.data.split('\n');
    expect(lines.length).toBe(3); // Header + 2 rows
    expect(lines[0]).toContain('cpu_utilization_pct');
    expect(lines[0]).toContain('memory_used_bytes');
    expect(lines[1]).toContain(snap1.cpu.utilization.toFixed(1));
  });

  it('exports snapshots to JSON format', async () => {
    const snap = await createMockSnapshot();
    const exporter = new JsonExporter();
    const result = await exporter.export([snap]);

    expect(result.format).toBe('json');
    expect(result.snapshotCount).toBe(1);

    const parsed = JSON.parse(result.data);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0].cpu.utilization).toBe(snap.cpu.utilization);
  });

  it('filters out processes when includeProcesses is false', async () => {
    const snap = await createMockSnapshot();
    const exporter = new JsonExporter();
    const result = await exporter.export([snap], { includeProcesses: false });

    const parsed = JSON.parse(result.data);
    expect(parsed[0].processes).toBeUndefined();
    expect(parsed[0].cpu).toBeDefined();
  });
});
