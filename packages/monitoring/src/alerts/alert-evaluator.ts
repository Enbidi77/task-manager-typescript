import { AlertIncident, AlertRule, IAlertService, SystemSnapshot } from '@taskpulse/core';

export class AlertEvaluator implements IAlertService {
  private rules: Map<string, AlertRule> = new Map();
  private ruleViolations: Map<string, { firstSeen: number; lastSeen: number }> = new Map();
  private activeIncidents: Map<string, AlertIncident> = new Map();
  private incidentHistory: AlertIncident[] = [];

  constructor(defaultRules?: AlertRule[]) {
    if (defaultRules) {
      for (const rule of defaultRules) {
        this.addRule(rule);
      }
    }
  }

  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
  }

  removeRule(ruleId: string): boolean {
    this.ruleViolations.delete(ruleId);
    this.activeIncidents.delete(ruleId);
    return this.rules.delete(ruleId);
  }

  getRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  evaluate(snapshot: SystemSnapshot): AlertIncident[] {
    const now = snapshot.timestamp;
    const newlyTriggered: AlertIncident[] = [];

    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      const currentValue = this.extractMetricValue(snapshot, rule.metric);
      if (currentValue === null || !Number.isFinite(currentValue)) {
        continue;
      }

      const isViolating = this.checkThreshold(currentValue, rule.threshold, rule.comparison);

      if (isViolating) {
        const violation = this.ruleViolations.get(rule.id);
        if (!violation) {
          this.ruleViolations.set(rule.id, { firstSeen: now, lastSeen: now });
        } else {
          violation.lastSeen = now;
        }

        const currentViolation = this.ruleViolations.get(rule.id)!;
        const durationSec = (now - currentViolation.firstSeen) / 1000;

        if (durationSec >= rule.durationSeconds && !this.activeIncidents.has(rule.id)) {
          const incident: AlertIncident = {
            id: `inc-${rule.id}-${now}`,
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            message: `${rule.name}: ${currentValue.toFixed(1)} ${rule.comparison} ${rule.threshold} for ${durationSec.toFixed(0)}s`,
            currentValue,
            thresholdValue: rule.threshold,
            triggeredAt: now,
            active: true,
          };
          this.activeIncidents.set(rule.id, incident);
          this.incidentHistory.unshift(incident);
          newlyTriggered.push(incident);
        } else if (this.activeIncidents.has(rule.id)) {
          // Update active incident current value
          const incident = this.activeIncidents.get(rule.id)!;
          incident.currentValue = currentValue;
        }
      } else {
        // Not violating: resolve if active
        this.ruleViolations.delete(rule.id);
        const active = this.activeIncidents.get(rule.id);
        if (active) {
          active.active = false;
          active.resolvedAt = now;
          this.activeIncidents.delete(rule.id);
        }
      }
    }

    return newlyTriggered;
  }

  getActiveIncidents(): AlertIncident[] {
    return Array.from(this.activeIncidents.values());
  }

  getIncidentHistory(limit: number = 50): AlertIncident[] {
    return this.incidentHistory.slice(0, limit);
  }

  clearIncidents(): void {
    this.activeIncidents.clear();
    this.incidentHistory = [];
    this.ruleViolations.clear();
  }

  private extractMetricValue(snapshot: SystemSnapshot, metric: string): number | null {
    switch (metric) {
      case 'cpu_utilization':
        return snapshot.cpu.utilization;
      case 'memory_utilization':
        return snapshot.memory.utilization;
      case 'disk_utilization': {
        if (snapshot.disk.volumes.length === 0) return 0;
        return Math.max(...snapshot.disk.volumes.map((v) => v.utilization));
      }
      case 'disk_activity_mb_s':
        return snapshot.disk.io.totalBytesPerSec / (1024 * 1024);
      case 'network_throughput_mb_s':
        return (
          (snapshot.network.totalRxBytesPerSec + snapshot.network.totalTxBytesPerSec) /
          (1024 * 1024)
        );
      case 'gpu_utilization': {
        const gpu = snapshot.gpu.devices[0];
        return gpu && gpu.utilization.status === 'available' ? gpu.utilization.value : null;
      }
      case 'cpu_temperature': {
        return snapshot.hardware.cpuPackageTemp.status === 'available'
          ? snapshot.hardware.cpuPackageTemp.value
          : null;
      }
      default:
        return null;
    }
  }

  private checkThreshold(value: number, threshold: number, comparison: string): boolean {
    switch (comparison) {
      case '>':
        return value > threshold;
      case '>=':
        return value >= threshold;
      case '<':
        return value < threshold;
      case '<=':
        return value <= threshold;
      default:
        return false;
    }
  }
}
