import si from 'systeminformation';
import {
  INetworkMonitor,
  NetworkMetrics,
  NetworkInterfaceMetrics,
  ProviderMetadata,
  ProviderHealth,
  available,
  unavailable,
} from '@taskpulse/core';
import { calculateRate } from '@taskpulse/shared';
import { ILogger } from '@taskpulse/logging';

interface PrevSample {
  rxBytes: number;
  txBytes: number;
  timestamp: number;
}

export class SystemNetworkProvider implements INetworkMonitor {
  readonly metadata: ProviderMetadata = {
    id: 'system-network',
    name: 'System Network Monitor',
    version: '1.0.0',
    supportedPlatforms: ['win32', 'linux', 'darwin'],
    capabilities: [
      {
        id: 'network-throughput',
        name: 'Network Rates',
        status: 'supported',
        description: 'Download/Upload rate calculation',
      },
      {
        id: 'network-interfaces',
        name: 'Network Adapters',
        status: 'supported',
        description: 'IP addresses and adapter state',
      },
    ],
  };

  private prevStats: Map<string, PrevSample> = new Map();
  private health: ProviderHealth = {
    healthy: true,
    lastSampleTimestamp: 0,
    latencyMs: 0,
    errorCount: 0,
  };

  constructor(private readonly logger?: ILogger) {}

  async initialize(): Promise<void> {}
  async dispose(): Promise<void> {
    this.prevStats.clear();
  }

  getHealth(): ProviderHealth {
    return { ...this.health };
  }

  async collect(_signal?: AbortSignal): Promise<NetworkMetrics> {
    const start = performance.now();
    try {
      const [ifaces, stats] = await Promise.all([si.networkInterfaces(), si.networkStats()]);

      const ifaceList = Array.isArray(ifaces) ? ifaces : [ifaces];
      const statsList = Array.isArray(stats) ? stats : [stats];

      const ifaceMap = new Map<string, (typeof ifaceList)[0]>();
      for (const iface of ifaceList) {
        ifaceMap.set(iface.iface, iface);
      }

      const now = performance.now();
      let totalRxSec = 0;
      let totalTxSec = 0;
      let totalRxBytes = 0;
      let totalTxBytes = 0;

      const interfaces: NetworkInterfaceMetrics[] = [];

      for (const stat of statsList) {
        const ifaceInfo = ifaceMap.get(stat.iface);
        const name = ifaceInfo?.ifaceName || stat.iface;
        const rxBytes = stat.rx_bytes || 0;
        const txBytes = stat.tx_bytes || 0;

        totalRxBytes += rxBytes;
        totalTxBytes += txBytes;

        let rxSec = stat.rx_sec || 0;
        let txSec = stat.tx_sec || 0;

        // If systeminformation did not provide rates, compute with monotonic delta
        const prev = this.prevStats.get(stat.iface);
        if (prev && rxSec === 0 && txSec === 0) {
          const deltaSec = (now - prev.timestamp) / 1000;
          if (deltaSec > 0.1) {
            rxSec = calculateRate(rxBytes, prev.rxBytes, deltaSec);
            txSec = calculateRate(txBytes, prev.txBytes, deltaSec);
          }
        }
        this.prevStats.set(stat.iface, { rxBytes, txBytes, timestamp: now });

        totalRxSec += rxSec;
        totalTxSec += txSec;

        const speed = ifaceInfo?.speed ? available(ifaceInfo.speed) : unavailable('Speed unknown');

        interfaces.push({
          id: stat.iface,
          name: name || stat.iface,
          ip4: ifaceInfo?.ip4 || undefined,
          ip6: ifaceInfo?.ip6 || undefined,
          mac: ifaceInfo?.mac || undefined,
          isUp: ifaceInfo?.operstate === 'up' || stat.operstate === 'up',
          isVirtual: ifaceInfo?.virtual || false,
          speedMbps: speed,
          rxBytes,
          txBytes,
          rxBytesPerSec: rxSec,
          txBytesPerSec: txSec,
        });
      }

      const durationMs = Math.round(performance.now() - start);
      this.health = {
        healthy: true,
        lastSampleTimestamp: Date.now(),
        latencyMs: durationMs,
        errorCount: 0,
      };

      return {
        interfaces,
        totalRxBytesPerSec: totalRxSec,
        totalTxBytesPerSec: totalTxSec,
        totalRxBytes,
        totalTxBytes,
        timestamp: Date.now(),
      };
    } catch (err: unknown) {
      const durationMs = Math.round(performance.now() - start);
      const errMsg = err instanceof Error ? err.message : String(err);
      this.health = {
        healthy: false,
        lastSampleTimestamp: Date.now(),
        latencyMs: durationMs,
        errorCount: this.health.errorCount + 1,
        lastError: errMsg,
      };
      throw err;
    }
  }
}
