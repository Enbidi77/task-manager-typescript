export type CapabilityStatus =
  'supported' | 'unsupported' | 'degraded' | 'permission_required' | 'driver_required';

export type MetricStatus = 'available' | 'unavailable' | 'stale' | 'error';

export type MetricValue<T> =
  | { status: 'available'; value: T; timestamp: number }
  | { status: 'unavailable'; reason: string; timestamp: number }
  | { status: 'stale'; value: T; timestamp: number; staleSince: number }
  | { status: 'error'; error: string; timestamp: number };

export interface MetricCapability {
  id: string;
  name: string;
  status: CapabilityStatus;
  description: string;
  platformNotes?: string;
}

export function available<T>(value: T, timestamp: number = Date.now()): MetricValue<T> {
  return { status: 'available', value, timestamp };
}

export function unavailable<T = never>(
  reason: string,
  timestamp: number = Date.now(),
): MetricValue<T> {
  return { status: 'unavailable', reason, timestamp };
}

export function stale<T>(
  value: T,
  staleSince: number,
  timestamp: number = Date.now(),
): MetricValue<T> {
  return { status: 'stale', value, timestamp, staleSince };
}

export function metricError<T = never>(
  error: string,
  timestamp: number = Date.now(),
): MetricValue<T> {
  return { status: 'error', error, timestamp };
}

export function isAvailable<T>(
  metric: MetricValue<T>,
): metric is { status: 'available'; value: T; timestamp: number } {
  return metric.status === 'available';
}
