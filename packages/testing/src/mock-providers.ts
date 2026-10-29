import {
  ICpuMonitor,
  IMemoryMonitor,
  IDiskMonitor,
  INetworkMonitor,
  IGpuMonitor,
  IHardwareMonitor,
  IProcessMonitor,
  CpuMetrics,
  MemoryMetrics,
  DiskMetrics,
  NetworkMetrics,
  GpuMetrics,
  HardwareMetrics,
  ProcessMetrics,
  ProviderMetadata,
  ProviderHealth,
  available,
} from '@taskpulse/core';

export class MockCpuMonitor implements ICpuMonitor {
  readonly metadata: ProviderMetadata = {
    id: 'mock-cpu',
    name: 'Mock CPU Monitor',
    version: '1.0.0',
    supportedPlatforms: ['win32', 'linux', 'darwin'],
    capabilities: [
      {
        id: 'cpu-utilization',
        name: 'CPU Utilization',
        status: 'supported',
        description: 'Overall CPU usage',
      },
      {
        id: 'cpu-per-core',
        name: 'Per-Core Utilization',
        status: 'supported',
        description: 'Per-core breakdown',
      },
    ],
  };

  private health: ProviderHealth = {
    healthy: true,
    lastSampleTimestamp: Date.now(),
    latencyMs: 1,
    errorCount: 0,
  };

  constructor(private mockUtilization: number = 35.5) {}

  setMockUtilization(val: number) {
    this.mockUtilization = val;
  }

  async initialize(): Promise<void> {}
  async dispose(): Promise<void> {}
  getHealth(): ProviderHealth {
    return { ...this.health };
  }

  async collect(_signal?: AbortSignal): Promise<CpuMetrics> {
    return {
      utilization: this.mockUtilization,
      cores: [
        { coreId: 0, utilization: this.mockUtilization + 2 },
        { coreId: 1, utilization: this.mockUtilization - 2 },
        { coreId: 2, utilization: this.mockUtilization + 4 },
        { coreId: 3, utilization: this.mockUtilization - 4 },
      ],
      hardware: {
        manufacturer: 'Intel',
        brand: 'Core i7-12700K',
        speedGHz: 3.6,
        physicalCores: 8,
        logicalCores: 16,
      },
      currentFrequencyGHz: available(3.8),
      temperatureCelsius: available(48),
      loadAverage: [1.2, 0.9, 0.8],
      timestamp: Date.now(),
    };
  }
}

export class MockMemoryMonitor implements IMemoryMonitor {
  readonly metadata: ProviderMetadata = {
    id: 'mock-memory',
    name: 'Mock Memory Monitor',
    version: '1.0.0',
    supportedPlatforms: ['win32', 'linux', 'darwin'],
    capabilities: [
      {
        id: 'memory-physical',
        name: 'Physical RAM',
        status: 'supported',
        description: 'Physical RAM',
      },
    ],
  };

  private health: ProviderHealth = {
    healthy: true,
    lastSampleTimestamp: Date.now(),
    latencyMs: 1,
    errorCount: 0,
  };

  constructor(private usedPercent: number = 60) {}

  async initialize(): Promise<void> {}
  async dispose(): Promise<void> {}
  getHealth(): ProviderHealth {
    return { ...this.health };
  }

  async collect(_signal?: AbortSignal): Promise<MemoryMetrics> {
    const totalBytes = 32 * 1024 * 1024 * 1024; // 32 GB
    const usedBytes = (totalBytes * this.usedPercent) / 100;
    const freeBytes = totalBytes - usedBytes;

    return {
      totalBytes,
      usedBytes,
      freeBytes,
      availableBytes: freeBytes,
      utilization: this.usedPercent,
      swap: {
        totalBytes: 8 * 1024 * 1024 * 1024,
        usedBytes: 1 * 1024 * 1024 * 1024,
        freeBytes: 7 * 1024 * 1024 * 1024,
        utilization: 12.5,
      },
      virtualMemory: available({
        commitTotalBytes: 20 * 1024 * 1024 * 1024,
        commitLimitBytes: 40 * 1024 * 1024 * 1024,
        commitUtilization: 50,
      }),
      kernelMemory: available({
        pagedPoolBytes: 650 * 1024 * 1024,
        nonPagedPoolBytes: 450 * 1024 * 1024,
        systemCacheBytes: 1024 * 1024 * 1024,
        commitPeakBytes: 25 * 1024 * 1024 * 1024,
        systemHandles: 145200,
        systemThreads: 3450,
        processCount: 290,
      }),
      platformSemantics: {
        os: 'win32',
        description: 'Physical RAM and Windows Commit Charge',
      },
      timestamp: Date.now(),
    };
  }
}

export class MockDiskMonitor implements IDiskMonitor {
  readonly metadata: ProviderMetadata = {
    id: 'mock-disk',
    name: 'Mock Disk Monitor',
    version: '1.0.0',
    supportedPlatforms: ['win32', 'linux', 'darwin'],
    capabilities: [
      {
        id: 'disk-volumes',
        name: 'Disk Volumes',
        status: 'supported',
        description: 'Mounted volumes',
      },
      { id: 'disk-io', name: 'Disk I/O', status: 'supported', description: 'Read/Write rates' },
    ],
  };

  private health: ProviderHealth = {
    healthy: true,
    lastSampleTimestamp: Date.now(),
    latencyMs: 1,
    errorCount: 0,
  };

  async initialize(): Promise<void> {}
  async dispose(): Promise<void> {}
  getHealth(): ProviderHealth {
    return { ...this.health };
  }

  async collect(_signal?: AbortSignal): Promise<DiskMetrics> {
    return {
      volumes: [
        {
          id: 'C:',
          name: 'Local Disk (C:)',
          mount: 'C:',
          fsType: 'NTFS',
          totalBytes: 1000 * 1024 * 1024 * 1024,
          usedBytes: 450 * 1024 * 1024 * 1024,
          freeBytes: 550 * 1024 * 1024 * 1024,
          utilization: 45.0,
        },
      ],
      devices: [
        {
          device: '0',
          name: 'Samsung SSD 980 PRO 1TB',
          type: 'NVMe',
          vendor: 'Samsung',
          sizeBytes: 1000 * 1024 * 1024 * 1024,
        },
      ],
      io: {
        readBytesPerSec: 15.4 * 1024 * 1024,
        writeBytesPerSec: 8.2 * 1024 * 1024,
        totalBytesPerSec: 23.6 * 1024 * 1024,
        readOpsPerSec: available(120),
        writeOpsPerSec: available(85),
        activityPercent: available(4.2),
      },
      timestamp: Date.now(),
    };
  }
}

export class MockNetworkMonitor implements INetworkMonitor {
  readonly metadata: ProviderMetadata = {
    id: 'mock-network',
    name: 'Mock Network Monitor',
    version: '1.0.0',
    supportedPlatforms: ['win32', 'linux', 'darwin'],
    capabilities: [
      {
        id: 'network-io',
        name: 'Network Throughput',
        status: 'supported',
        description: 'Upload/Download rate',
      },
    ],
  };

  private health: ProviderHealth = {
    healthy: true,
    lastSampleTimestamp: Date.now(),
    latencyMs: 1,
    errorCount: 0,
  };

  async initialize(): Promise<void> {}
  async dispose(): Promise<void> {}
  getHealth(): ProviderHealth {
    return { ...this.health };
  }

  async collect(_signal?: AbortSignal): Promise<NetworkMetrics> {
    return {
      interfaces: [
        {
          id: 'eth0',
          name: 'Ethernet',
          ip4: '192.168.1.100',
          isUp: true,
          isVirtual: false,
          speedMbps: available(1000),
          rxBytes: 500000000,
          txBytes: 250000000,
          rxBytesPerSec: 2.5 * 1024 * 1024,
          txBytesPerSec: 0.8 * 1024 * 1024,
        },
      ],
      totalRxBytesPerSec: 2.5 * 1024 * 1024,
      totalTxBytesPerSec: 0.8 * 1024 * 1024,
      totalRxBytes: 500000000,
      totalTxBytes: 250000000,
      timestamp: Date.now(),
    };
  }
}

export class MockGpuMonitor implements IGpuMonitor {
  readonly metadata: ProviderMetadata = {
    id: 'mock-gpu',
    name: 'Mock GPU Monitor',
    version: '1.0.0',
    supportedPlatforms: ['win32', 'linux', 'darwin'],
    capabilities: [
      {
        id: 'gpu-utilization',
        name: 'GPU Utilization',
        status: 'supported',
        description: 'GPU compute & memory',
      },
    ],
  };

  private health: ProviderHealth = {
    healthy: true,
    lastSampleTimestamp: Date.now(),
    latencyMs: 1,
    errorCount: 0,
  };

  async initialize(): Promise<void> {}
  async dispose(): Promise<void> {}
  getHealth(): ProviderHealth {
    return { ...this.health };
  }

  async collect(_signal?: AbortSignal): Promise<GpuMetrics> {
    return {
      devices: [
        {
          id: 'gpu-0',
          name: 'NVIDIA GeForce RTX 4080',
          vendor: 'NVIDIA',
          driverVersion: '551.86',
          utilization: available(28.0),
          memoryTotalBytes: 16 * 1024 * 1024 * 1024,
          memoryUsedBytes: 3.5 * 1024 * 1024 * 1024,
          memoryFreeBytes: 12.5 * 1024 * 1024 * 1024,
          memoryUtilization: available(21.8),
          temperatureCelsius: available(52),
          clockSpeedMHz: available(2205),
          powerWatts: available(115),
          fanSpeedPercent: available(40),
        },
      ],
      timestamp: Date.now(),
    };
  }
}

export class MockHardwareMonitor implements IHardwareMonitor {
  readonly metadata: ProviderMetadata = {
    id: 'mock-hardware',
    name: 'Mock Hardware Monitor',
    version: '1.0.0',
    supportedPlatforms: ['win32', 'linux', 'darwin'],
    capabilities: [
      {
        id: 'hardware-temps',
        name: 'Thermal Sensors',
        status: 'supported',
        description: 'Thermal readings',
      },
    ],
  };

  private health: ProviderHealth = {
    healthy: true,
    lastSampleTimestamp: Date.now(),
    latencyMs: 1,
    errorCount: 0,
  };

  async initialize(): Promise<void> {}
  async dispose(): Promise<void> {}
  getHealth(): ProviderHealth {
    return { ...this.health };
  }

  async collect(_signal?: AbortSignal): Promise<HardwareMetrics> {
    return {
      cpuPackageTemp: available(54),
      cpuCoreTemps: [
        { id: 'c0', label: 'Core 0', currentCelsius: 52 },
        { id: 'c1', label: 'Core 1', currentCelsius: 55 },
      ],
      fans: [{ id: 'f0', label: 'CPU Fan', rpm: 1250 }],
      voltages: [{ id: 'v0', label: 'CPU Vcore', volts: 1.25 }],
      powers: [{ id: 'p0', label: 'CPU Package', watts: 65.4 }],
      powerStatus: available({
        isAcOnline: true,
        hasBattery: true,
        batteryPercent: 92,
        batteryLifeRemainingSeconds: 14400,
        isCharging: false,
        statusDescription: 'Plugged in (92%)',
      }),
      timestamp: Date.now(),
    };
  }
}

export class MockProcessMonitor implements IProcessMonitor {
  readonly metadata: ProviderMetadata = {
    id: 'mock-process',
    name: 'Mock Process Monitor',
    version: '1.0.0',
    supportedPlatforms: ['win32', 'linux', 'darwin'],
    capabilities: [
      {
        id: 'process-list',
        name: 'Process Enumeration',
        status: 'supported',
        description: 'Process table',
      },
    ],
  };

  private processes: ProcessMetrics[] = [
    {
      pid: 1024,
      name: 'node.exe',
      cpuPercent: 12.5,
      memoryBytes: 256 * 1024 * 1024,
      memoryPercent: 0.8,
      threads: available(18),
      state: 'running',
      user: 'Administrator',
      handles: available(185),
      privateWorkingSetBytes: available(190 * 1024 * 1024),
      executablePath: available('C:\\Program Files\\nodejs\\node.exe'),
      diskIo: available({ readBytesPerSec: 1024 * 100, writeBytesPerSec: 1024 * 50 }),
      networkIo: available({ rxBytesPerSec: 5000, txBytesPerSec: 2000 }),
    },
    {
      pid: 2048,
      name: 'chrome.exe',
      cpuPercent: 8.2,
      memoryBytes: 1024 * 1024 * 1024,
      memoryPercent: 3.2,
      threads: available(42),
      state: 'running',
      user: 'User',
      handles: available(850),
      privateWorkingSetBytes: available(780 * 1024 * 1024),
      executablePath: available('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'),
      diskIo: available({ readBytesPerSec: 50000, writeBytesPerSec: 10000 }),
      networkIo: available({ rxBytesPerSec: 120000, txBytesPerSec: 45000 }),
    },
    {
      pid: 3096,
      name: 'Code.exe',
      cpuPercent: 4.1,
      memoryBytes: 512 * 1024 * 1024,
      memoryPercent: 1.6,
      threads: available(26),
      state: 'running',
      user: 'User',
      handles: available(340),
      privateWorkingSetBytes: available(310 * 1024 * 1024),
      executablePath: available(
        'C:\\Users\\User\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe',
      ),
      diskIo: available({ readBytesPerSec: 2000, writeBytesPerSec: 4000 }),
      networkIo: available({ rxBytesPerSec: 1000, txBytesPerSec: 500 }),
    },
  ];

  private health: ProviderHealth = {
    healthy: true,
    lastSampleTimestamp: Date.now(),
    latencyMs: 1,
    errorCount: 0,
  };

  async initialize(): Promise<void> {}
  async dispose(): Promise<void> {}
  getHealth(): ProviderHealth {
    return { ...this.health };
  }

  async collect(_signal?: AbortSignal): Promise<ProcessMetrics[]> {
    return [...this.processes];
  }

  async terminateProcess(pid: number, _force?: boolean): Promise<boolean> {
    const idx = this.processes.findIndex((p) => p.pid === pid);
    if (idx !== -1) {
      this.processes.splice(idx, 1);
      return true;
    }
    return false;
  }

  async getProcessDetails(pid: number): Promise<ProcessMetrics | null> {
    return this.processes.find((p) => p.pid === pid) ?? null;
  }
}
