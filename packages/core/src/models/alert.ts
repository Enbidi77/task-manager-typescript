export type AlertSeverity = 'info' | 'warning' | 'critical';

export type AlertMetricType =
  | 'cpu_utilization'
  | 'memory_utilization'
  | 'disk_utilization'
  | 'disk_activity_mb_s'
  | 'network_throughput_mb_s'
  | 'gpu_utilization'
  | 'cpu_temperature'
  | 'gpu_temperature';

export type AlertComparison = '>' | '>=' | '<' | '<=';

export interface AlertRule {
  id: string;
  name: string;
  metric: AlertMetricType;
  threshold: number;
  comparison: AlertComparison;
  severity: AlertSeverity;
  durationSeconds: number; // sustained duration required to trigger
  enabled: boolean;
}

export interface AlertIncident {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: AlertSeverity;
  message: string;
  currentValue: number;
  thresholdValue: number;
  triggeredAt: number;
  resolvedAt?: number;
  active: boolean;
}
