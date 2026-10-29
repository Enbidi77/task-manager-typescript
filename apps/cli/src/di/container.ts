import { CollectorPool, SamplingCoordinator, AlertEvaluator } from '@taskpulse/monitoring';
import { MemoryMetricHistory } from '@taskpulse/storage';
import {
  SystemCpuProvider,
  SystemMemoryProvider,
  SystemDiskProvider,
  SystemNetworkProvider,
  SystemGpuProvider,
  SystemHardwareProvider,
  SystemProcessProvider,
  SystemInfoProvider,
} from '@taskpulse/providers';
import { AppConfig, ConfigLoader, ConfigOverrides } from '@taskpulse/config';
import { createLogger, ILogger } from '@taskpulse/logging';

export interface ServiceContainer {
  config: AppConfig;
  logger: ILogger;
  history: MemoryMetricHistory;
  alertEvaluator: AlertEvaluator;
  collectorPool: CollectorPool;
  coordinator: SamplingCoordinator;
}

export function createServiceContainer(
  configPath?: string,
  overrides?: ConfigOverrides,
  isInteractive: boolean = false,
): ServiceContainer {
  const config = ConfigLoader.load(configPath, overrides);

  const logger = createLogger({
    level: config.logging.level,
    logToFile: config.logging.logToFile,
    filePath: config.logging.filePath,
    isInteractiveTui: isInteractive,
  });

  const cpuProvider = config.providers.cpu ? new SystemCpuProvider(logger) : undefined;
  const memProvider = config.providers.memory ? new SystemMemoryProvider(logger) : undefined;
  const diskProvider = config.providers.disk ? new SystemDiskProvider(logger) : undefined;
  const netProvider = config.providers.network ? new SystemNetworkProvider(logger) : undefined;
  const gpuProvider = config.providers.gpu ? new SystemGpuProvider(logger) : undefined;
  const hwProvider = config.providers.hardware ? new SystemHardwareProvider(logger) : undefined;
  const procProvider = config.providers.processes ? new SystemProcessProvider(logger) : undefined;
  const sysInfoProvider = new SystemInfoProvider();

  const collectorPool = new CollectorPool(
    {
      cpu: cpuProvider,
      memory: memProvider,
      disk: diskProvider,
      network: netProvider,
      gpu: gpuProvider,
      hardware: hwProvider,
      processes: procProvider,
      systemInfo: sysInfoProvider,
    },
    config.sampling.timeoutMs,
    logger,
  );

  const history = new MemoryMetricHistory(config.sampling.historyDurationSeconds);

  // Initialize alert evaluator with config thresholds
  const alertEvaluator = new AlertEvaluator([
    {
      id: 'cpu-warn',
      name: 'High CPU Usage',
      metric: 'cpu_utilization',
      threshold: config.alerts.cpuWarningPercent,
      comparison: '>=',
      severity: 'warning',
      durationSeconds: config.alerts.sustainedDurationSeconds,
      enabled: true,
    },
    {
      id: 'cpu-crit',
      name: 'Critical CPU Usage',
      metric: 'cpu_utilization',
      threshold: config.alerts.cpuCriticalPercent,
      comparison: '>=',
      severity: 'critical',
      durationSeconds: config.alerts.sustainedDurationSeconds,
      enabled: true,
    },
    {
      id: 'mem-warn',
      name: 'High RAM Usage',
      metric: 'memory_utilization',
      threshold: config.alerts.memoryWarningPercent,
      comparison: '>=',
      severity: 'warning',
      durationSeconds: config.alerts.sustainedDurationSeconds,
      enabled: true,
    },
    {
      id: 'mem-crit',
      name: 'Critical RAM Usage',
      metric: 'memory_utilization',
      threshold: config.alerts.memoryCriticalPercent,
      comparison: '>=',
      severity: 'critical',
      durationSeconds: config.alerts.sustainedDurationSeconds,
      enabled: true,
    },
    {
      id: 'disk-warn',
      name: 'High Disk Space Usage',
      metric: 'disk_utilization',
      threshold: config.alerts.diskWarningPercent,
      comparison: '>=',
      severity: 'warning',
      durationSeconds: 1,
      enabled: true,
    },
    {
      id: 'temp-warn',
      name: 'High CPU Temperature',
      metric: 'cpu_temperature',
      threshold: config.alerts.temperatureWarningCelsius,
      comparison: '>=',
      severity: 'warning',
      durationSeconds: config.alerts.sustainedDurationSeconds,
      enabled: true,
    },
  ]);

  const coordinator = new SamplingCoordinator(
    collectorPool,
    history,
    alertEvaluator,
    {
      intervalMs: config.sampling.intervalMs,
      historyDurationSeconds: config.sampling.historyDurationSeconds,
      timeoutMs: config.sampling.timeoutMs,
    },
    logger,
  );

  return {
    config,
    logger,
    history,
    alertEvaluator,
    collectorPool,
    coordinator,
  };
}
