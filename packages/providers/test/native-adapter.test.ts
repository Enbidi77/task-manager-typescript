import process from 'node:process';
import { describe, it, expect } from 'vitest';
import {
  isWin32NativeAvailable,
  getWin32PerformanceInfo,
  getWin32PowerStatus,
  getWin32ProcessTelemetry,
  getWin32ProcessThreadCounts,
  terminateWin32Process,
} from '../src/windows/native-adapter.js';

describe('Win32 Native Adapter via koffi', () => {
  it('should report availability consistently with platform', () => {
    const available = isWin32NativeAvailable();
    if (process.platform === 'win32') {
      expect(typeof available).toBe('boolean');
    } else {
      expect(available).toBe(false);
    }
  });

  if (process.platform === 'win32') {
    it('should retrieve genuine Win32 performance info on Windows', () => {
      const info = getWin32PerformanceInfo();
      if (info) {
        expect(info.systemHandles).toBeGreaterThan(0);
        expect(info.systemThreads).toBeGreaterThan(0);
        expect(info.processCount).toBeGreaterThan(0);
        expect(info.pagedPoolBytes).toBeGreaterThan(0);
        expect(info.nonPagedPoolBytes).toBeGreaterThan(0);
      }
    });

    it('should retrieve Win32 power status on Windows', () => {
      const power = getWin32PowerStatus();
      if (power) {
        expect(typeof power.isAcOnline).toBe('boolean');
        expect(typeof power.hasBattery).toBe('boolean');
        expect(typeof power.statusDescription).toBe('string');
      }
    });

    it('should retrieve process telemetry for current process', () => {
      const telemetry = getWin32ProcessTelemetry(process.pid);
      if (telemetry) {
        expect(telemetry.handles).toBeDefined();
        expect(telemetry.handles).toBeGreaterThan(0);
        if (telemetry.privateWorkingSetBytes !== undefined) {
          expect(telemetry.privateWorkingSetBytes).toBeGreaterThan(0);
        }
      }
    });

    it('should safely return null for invalid PID', () => {
      const telemetry = getWin32ProcessTelemetry(-1);
      expect(telemetry).toBeNull();
    });

    it('should safely fail to terminate non-existent PID', () => {
      const res = terminateWin32Process(-1);
      expect(res).toBe(false);
    });

    it('should enumerate process thread counts on Windows', () => {
      const threadMap = getWin32ProcessThreadCounts();
      expect(threadMap).not.toBeNull();
      if (threadMap) {
        expect(threadMap.size).toBeGreaterThan(0);
        // Current process should exist in map and have threads > 0
        const currentThreads = threadMap.get(process.pid);
        expect(currentThreads).toBeDefined();
        expect(currentThreads).toBeGreaterThan(0);
      }
    });
  }
});
