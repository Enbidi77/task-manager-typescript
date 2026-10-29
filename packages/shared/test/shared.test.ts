import { describe, it, expect } from 'vitest';
import {
  formatBytes,
  formatBytesPerSec,
  formatPercent,
  formatDuration,
  formatHertz,
  formatTemperature,
  renderSparkline,
  renderProgressBar,
  calculateRate,
  clamp,
} from '../src/index.js';

describe('Shared Utilities', () => {
  describe('formatBytes', () => {
    it('formats zero bytes properly', () => {
      expect(formatBytes(0)).toBe('0 B');
    });

    it('formats bytes, kilobytes, megabytes, gigabytes', () => {
      expect(formatBytes(512)).toBe('512.0 B');
      expect(formatBytes(1024)).toBe('1.0 KB');
      expect(formatBytes(1024 * 1024 * 1.5)).toBe('1.5 MB');
      expect(formatBytes(1024 * 1024 * 1024 * 32)).toBe('32.0 GB');
    });

    it('handles negative or finite checks', () => {
      expect(formatBytes(NaN)).toBe('0 B');
    });
  });

  describe('formatBytesPerSec', () => {
    it('appends /s correctly', () => {
      expect(formatBytesPerSec(1024 * 1024)).toBe('1.0 MB/s');
    });
  });

  describe('formatPercent', () => {
    it('formats percentages correctly', () => {
      expect(formatPercent(42.54)).toBe('42.5%');
      expect(formatPercent(42.54, 2)).toBe('42.54%');
      expect(formatPercent(NaN)).toBe('0.0%');
    });
  });

  describe('formatDuration', () => {
    it('formats seconds into human readable duration', () => {
      expect(formatDuration(45)).toBe('45s');
      expect(formatDuration(125)).toBe('2m 5s');
      expect(formatDuration(3665)).toBe('1h 1m 5s');
      expect(formatDuration(90065)).toBe('1d 1h 1m 5s');
    });
  });

  describe('formatHertz', () => {
    it('formats GHz and MHz', () => {
      expect(formatHertz(3.6)).toBe('3.60 GHz');
      expect(formatHertz(2400, true)).toBe('2.40 GHz');
      expect(formatHertz(800, true)).toBe('800 MHz');
    });
  });

  describe('formatTemperature', () => {
    it('formats Celsius correctly', () => {
      expect(formatTemperature(55)).toBe('55°C');
      expect(formatTemperature(undefined)).toBe('N/A');
    });
  });

  describe('renderSparkline', () => {
    it('produces unicode sparklines', () => {
      const line = renderSparkline([0, 25, 50, 75, 100], { length: 5 });
      expect(line.length).toBe(5);
      expect(line[0]).toBe(' ');
      expect(line[4]).toBe('█');
    });
  });

  describe('renderProgressBar', () => {
    it('generates progress bar of specified width', () => {
      const bar = renderProgressBar(50, 10);
      expect(bar.length).toBe(10);
      expect(bar).toBe('█████░░░░░');
    });
  });

  describe('calculateRate', () => {
    it('computes per-second delta rate', () => {
      expect(calculateRate(2000, 1000, 1)).toBe(1000);
      expect(calculateRate(5000, 2000, 2)).toBe(1500);
    });

    it('returns 0 when counter resets or drops', () => {
      expect(calculateRate(100, 500, 1)).toBe(0);
    });
  });

  describe('clamp', () => {
    it('clamps values between min and max', () => {
      expect(clamp(150, 0, 100)).toBe(100);
      expect(clamp(-20, 0, 100)).toBe(0);
      expect(clamp(50, 0, 100)).toBe(50);
    });
  });
});
