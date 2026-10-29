export class MonitoringError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'MONITORING_ERROR',
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'MonitoringError';
  }
}

export class ProviderUnavailableError extends MonitoringError {
  constructor(providerId: string, reason: string) {
    super(`Provider '${providerId}' is unavailable: ${reason}`, 'PROVIDER_UNAVAILABLE');
    this.name = 'ProviderUnavailableError';
  }
}

export class MetricCollectionTimeoutError extends MonitoringError {
  constructor(providerId: string, timeoutMs: number) {
    super(
      `Metric collection timed out after ${timeoutMs}ms for provider '${providerId}'`,
      'COLLECTION_TIMEOUT',
    );
    this.name = 'MetricCollectionTimeoutError';
  }
}

export class PlatformNotSupportedError extends MonitoringError {
  constructor(feature: string, platform: string) {
    super(
      `Feature '${feature}' is not supported on platform '${platform}'`,
      'PLATFORM_NOT_SUPPORTED',
    );
    this.name = 'PlatformNotSupportedError';
  }
}

export class ProcessTerminationError extends MonitoringError {
  constructor(pid: number, reason: string) {
    super(`Failed to terminate process ${pid}: ${reason}`, 'PROCESS_TERMINATION_ERROR');
    this.name = 'ProcessTerminationError';
  }
}
