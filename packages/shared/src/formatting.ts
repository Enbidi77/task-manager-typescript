export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0 || !Number.isFinite(bytes)) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  const safeI = Math.min(i, sizes.length - 1);
  return `${(bytes / Math.pow(k, safeI)).toFixed(dm)} ${sizes[safeI]}`;
}

export function formatBytesPerSec(bytesPerSec: number, decimals: number = 1): string {
  return `${formatBytes(bytesPerSec, decimals)}/s`;
}

export function formatPercent(percent: number, decimals: number = 1): string {
  if (!Number.isFinite(percent)) return '0.0%';
  return `${percent.toFixed(decimals)}%`;
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0s';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(' ');
}

export function formatHertz(ghzOrMhz: number, isMhz: boolean = false): string {
  if (!Number.isFinite(ghzOrMhz) || ghzOrMhz <= 0) return 'N/A';
  if (isMhz) {
    if (ghzOrMhz >= 1000) {
      return `${(ghzOrMhz / 1000).toFixed(2)} GHz`;
    }
    return `${ghzOrMhz.toFixed(0)} MHz`;
  }
  return `${ghzOrMhz.toFixed(2)} GHz`;
}

export function formatTemperature(celsius?: number): string {
  if (celsius === undefined || !Number.isFinite(celsius) || celsius <= 0) return 'N/A';
  return `${celsius.toFixed(0)}°C`;
}

export function truncate(str: string, maxLen: number): string {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.slice(0, Math.max(0, maxLen - 1)) + '…';
}

export function pad(str: string, length: number, align: 'left' | 'right' = 'left'): string {
  const s = String(str);
  if (s.length >= length) return s.slice(0, length);
  const padding = ' '.repeat(length - s.length);
  return align === 'left' ? s + padding : padding + s;
}
