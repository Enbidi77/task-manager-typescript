export enum ViewId {
  OVERVIEW = '1',
  PROCESSES = '2',
  CPU = '3',
  MEMORY = '4',
  DISKS = '5',
  NETWORK = '6',
  GPU = '7',
  HARDWARE = '8',
  ALERTS = '9',
  SETTINGS = '0',
}

export interface ViewMeta {
  id: ViewId;
  key: string;
  name: string;
  description: string;
}

export const VIEWS: ViewMeta[] = [
  {
    id: ViewId.OVERVIEW,
    key: '1',
    name: 'Overview',
    description: 'Real-time dashboard of all resources',
  },
  {
    id: ViewId.PROCESSES,
    key: '2',
    name: 'Processes',
    description: 'Active task manager & process tree',
  },
  { id: ViewId.CPU, key: '3', name: 'CPU', description: 'Per-core utilization, clock & history' },
  {
    id: ViewId.MEMORY,
    key: '4',
    name: 'Memory',
    description: 'Physical RAM, swap & virtual memory',
  },
  { id: ViewId.DISKS, key: '5', name: 'Disks', description: 'Volumes capacity and live I/O rates' },
  { id: ViewId.NETWORK, key: '6', name: 'Network', description: 'Interface traffic & throughput' },
  { id: ViewId.GPU, key: '7', name: 'GPU', description: 'GPU compute load, VRAM & thermals' },
  {
    id: ViewId.HARDWARE,
    key: '8',
    name: 'Hardware',
    description: 'Sensors, thermal zones & fan speeds',
  },
  {
    id: ViewId.ALERTS,
    key: '9',
    name: 'Alerts',
    description: 'Threshold rules & active incidents',
  },
  {
    id: ViewId.SETTINGS,
    key: '0',
    name: 'Settings',
    description: 'Configuration & provider diagnostics',
  },
];
