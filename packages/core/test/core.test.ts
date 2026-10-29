import { describe, it, expect } from 'vitest';
import {
  available,
  unavailable,
  stale,
  metricError,
  isAvailable,
  MonitoringError,
  ProcessTerminationError,
} from '../src/index.js';

describe('Core Models & Errors', () => {
  it('creates available metric values', () => {
    const m = available(42);
    expect(m.status).toBe('available');
    expect(m.value).toBe(42);
    expect(isAvailable(m)).toBe(true);
  });

  it('creates unavailable metric values', () => {
    const m = unavailable<number>('Sensor not connected');
    expect(m.status).toBe('unavailable');
    expect(m.reason).toBe('Sensor not connected');
    expect(isAvailable(m)).toBe(false);
  });

  it('creates stale metric values', () => {
    const now = Date.now();
    const m = stale(100, now - 5000);
    expect(m.status).toBe('stale');
    expect(m.value).toBe(100);
    expect(m.staleSince).toBe(now - 5000);
  });

  it('creates error metric values', () => {
    const m = metricError<number>('Failed to read bus');
    expect(m.status).toBe('error');
    expect(m.error).toBe('Failed to read bus');
  });

  it('creates typed monitoring error classes', () => {
    const err = new ProcessTerminationError(1234, 'Access is denied');
    expect(err.name).toBe('ProcessTerminationError');
    expect(err.code).toBe('PROCESS_TERMINATION_ERROR');
    expect(err.message).toContain('1234');
    expect(err instanceof MonitoringError).toBe(true);
  });
});
