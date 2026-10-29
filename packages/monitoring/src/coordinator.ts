import { AlertIncident, IAlertService, IMetricHistory, SystemSnapshot } from '@taskpulse/core';
import { ILogger } from '@taskpulse/logging';
import { CollectorPool } from './collectors/collector-pool.js';
import { AlertEvaluator } from './alerts/alert-evaluator.js';

export interface CoordinatorOptions {
  intervalMs?: number;
  historyDurationSeconds?: number;
  timeoutMs?: number;
}

export type SnapshotListener = (snapshot: SystemSnapshot) => void;
export type AlertListener = (incidents: AlertIncident[]) => void;

export class SamplingCoordinator {
  private timer: NodeJS.Timeout | null = null;
  private isSampling: boolean = false;
  private paused: boolean = false;
  private snapshotListeners: Set<SnapshotListener> = new Set();
  private alertListeners: Set<AlertListener> = new Set();
  private sampleCount: number = 0;

  constructor(
    private readonly collectorPool: CollectorPool,
    private readonly history: IMetricHistory,
    private readonly alertService: IAlertService = new AlertEvaluator(),
    private readonly options: CoordinatorOptions = {},
    private readonly logger?: ILogger,
  ) {}

  async initialize(): Promise<void> {
    await this.collectorPool.initialize();
  }

  start(): void {
    if (this.timer) return;
    const interval = this.options.intervalMs ?? 1000;

    // Trigger first sample immediately
    this.sampleTick().catch((err) => {
      this.logger?.error('Error in initial sample tick:', err);
    });

    this.timer = setInterval(() => {
      if (!this.paused) {
        this.sampleTick().catch((err) => {
          this.logger?.error('Error in periodic sample tick:', err);
        });
      }
    }, interval);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async dispose(): Promise<void> {
    this.stop();
    await this.collectorPool.dispose();
    this.snapshotListeners.clear();
    this.alertListeners.clear();
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
  }

  isPaused(): boolean {
    return this.paused;
  }

  async forceSample(): Promise<SystemSnapshot | null> {
    return this.sampleTick();
  }

  onSnapshot(listener: SnapshotListener): () => void {
    this.snapshotListeners.add(listener);
    return () => {
      this.snapshotListeners.delete(listener);
    };
  }

  onAlert(listener: AlertListener): () => void {
    this.alertListeners.add(listener);
    return () => {
      this.alertListeners.delete(listener);
    };
  }

  getHistory(): IMetricHistory {
    return this.history;
  }

  getAlertService(): IAlertService {
    return this.alertService;
  }

  getCollectorPool(): CollectorPool {
    return this.collectorPool;
  }

  getLatestSnapshot(): SystemSnapshot | null {
    return this.history.getLatestSnapshot();
  }

  private async sampleTick(): Promise<SystemSnapshot | null> {
    if (this.isSampling) {
      this.logger?.warn(
        'Previous sampling tick is still in progress, skipping tick to prevent overlap',
      );
      return null;
    }

    this.isSampling = true;
    const startTime = performance.now();

    try {
      const data = await this.collectorPool.collectAll();
      const durationMs = Math.round(performance.now() - startTime);

      const snapshot: SystemSnapshot = {
        id: `snap-${++this.sampleCount}`,
        timestamp: Date.now(),
        os: data.os,
        cpu: data.cpu,
        memory: data.memory,
        disk: data.disk,
        network: data.network,
        gpu: data.gpu,
        hardware: data.hardware,
        processes: data.processes,
        totalProcessCount: data.processes.length,
        samplingDurationMs: durationMs,
        providerStatus: data.providerStatus,
      };

      this.history.addSnapshot(snapshot);

      const triggeredIncidents = this.alertService.evaluate(snapshot);
      if (triggeredIncidents.length > 0) {
        for (const listener of this.alertListeners) {
          try {
            listener(triggeredIncidents);
          } catch (err) {
            this.logger?.warn('Error in alert listener:', err);
          }
        }
      }

      for (const listener of this.snapshotListeners) {
        try {
          listener(snapshot);
        } catch (err) {
          this.logger?.warn('Error in snapshot listener:', err);
        }
      }

      return snapshot;
    } catch (err) {
      this.logger?.error('Unhandled exception during sampling tick:', err);
      return null;
    } finally {
      this.isSampling = false;
    }
  }
}
