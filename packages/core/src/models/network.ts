import { MetricValue } from './availability.js';

export interface NetworkAddress {
  address: string;
  family: 'IPv4' | 'IPv6';
  internal: boolean;
  netmask?: string;
}

export interface NetworkInterfaceMetrics {
  id: string;
  name: string;
  ip4?: string;
  ip6?: string;
  mac?: string;
  isUp: boolean;
  isVirtual: boolean;
  speedMbps: MetricValue<number>;
  rxBytes: number;
  txBytes: number;
  rxBytesPerSec: number;
  txBytesPerSec: number;
}

export interface NetworkMetrics {
  interfaces: NetworkInterfaceMetrics[];
  totalRxBytesPerSec: number;
  totalTxBytesPerSec: number;
  totalRxBytes: number;
  totalTxBytes: number;
  timestamp: number;
}
