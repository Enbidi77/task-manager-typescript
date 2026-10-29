import { AlertRule, AlertIncident } from '../models/alert.js';
import { SystemSnapshot } from '../models/snapshot.js';

export interface IAlertService {
  addRule(rule: AlertRule): void;
  removeRule(ruleId: string): boolean;
  getRules(): AlertRule[];
  evaluate(snapshot: SystemSnapshot): AlertIncident[];
  getActiveIncidents(): AlertIncident[];
  getIncidentHistory(limit?: number): AlertIncident[];
  clearIncidents(): void;
}
