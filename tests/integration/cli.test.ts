import { describe, it, expect } from 'vitest';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import process from 'node:process';

const execFileAsync = promisify(execFile);
const cliPath = path.resolve(process.cwd(), 'apps/cli/dist/index.js');

describe('TaskPulse CLI Integration', () => {
  it('displays help information', async () => {
    const { stdout } = await execFileAsync('node', [cliPath, '--help']);
    expect(stdout).toContain('TaskPulse — Extensible System Resource Monitor');
    expect(stdout).toContain('monitor');
    expect(stdout).toContain('summary');
    expect(stdout).toContain('processes');
    expect(stdout).toContain('system');
    expect(stdout).toContain('providers');
    expect(stdout).toContain('doctor');
    expect(stdout).toContain('export');
  });

  it('runs summary command and outputs valid JSON', async () => {
    const { stdout } = await execFileAsync('node', [cliPath, 'summary', '--json']);
    const snapshot = JSON.parse(stdout);
    expect(snapshot.id).toBeDefined();
    expect(snapshot.os).toBeDefined();
    expect(snapshot.cpu).toBeDefined();
    expect(snapshot.memory).toBeDefined();
    expect(snapshot.disk).toBeDefined();
    expect(snapshot.network).toBeDefined();
    expect(typeof snapshot.cpu.utilization).toBe('number');
  }, 15000);

  it('runs system command and outputs hardware JSON', async () => {
    const { stdout } = await execFileAsync('node', [cliPath, 'system', '--json']);
    const systemInfo = JSON.parse(stdout);
    expect(systemInfo.os).toBeDefined();
    expect(systemInfo.cpu).toBeDefined();
    expect(systemInfo.memory).toBeDefined();
  }, 15000);

  it('runs processes command with limit and outputs JSON', async () => {
    const { stdout } = await execFileAsync('node', [
      cliPath,
      'processes',
      '--limit',
      '5',
      '--json',
    ]);
    const processes = JSON.parse(stdout);
    expect(Array.isArray(processes)).toBe(true);
    expect(processes.length).toBeLessThanOrEqual(5);
    if (processes.length > 0) {
      expect(typeof processes[0].pid).toBe('number');
      expect(typeof processes[0].cpuPercent).toBe('number');
    }
  }, 15000);

  it('runs providers command and outputs healthy providers', async () => {
    const { stdout } = await execFileAsync('node', [cliPath, 'providers', '--json']);
    const providers = JSON.parse(stdout);
    expect(providers.cpu).toBeDefined();
    expect(providers.memory).toBeDefined();
    expect(providers.disk).toBeDefined();
    expect(providers.network).toBeDefined();
    expect(providers.cpu.healthy).toBe(true);
  }, 15000);

  it('runs doctor command and outputs pass checks', async () => {
    const { stdout } = await execFileAsync('node', [cliPath, 'doctor']);
    expect(stdout).toContain('TaskPulse Diagnostic Doctor');
    expect(stdout).toContain('[PASS] Node.js Runtime');
    expect(stdout).toContain('CPU Metrics: Real-time load');
  }, 15000);
});
