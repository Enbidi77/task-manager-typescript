import { z } from 'zod';

export const SamplingConfigSchema = z.object({
  intervalMs: z.number().int().min(250).max(60000).default(1000),
  historyDurationSeconds: z.number().int().min(30).max(3600).default(300),
  timeoutMs: z.number().int().min(500).max(30000).default(3000),
});

export const UiConfigSchema = z.object({
  theme: z.enum(['dark', 'light', 'nord', 'matrix']).default('dark'),
  showCharts: z.boolean().default(true),
  compactMode: z.boolean().default(false),
  refreshRateFps: z.number().min(1).max(30).default(2),
});

export const ProvidersConfigSchema = z.object({
  cpu: z.boolean().default(true),
  memory: z.boolean().default(true),
  disk: z.boolean().default(true),
  network: z.boolean().default(true),
  gpu: z.boolean().default(true),
  hardware: z.boolean().default(true),
  processes: z.boolean().default(true),
});

export const AlertsConfigSchema = z.object({
  cpuWarningPercent: z.number().min(0).max(100).default(80),
  cpuCriticalPercent: z.number().min(0).max(100).default(95),
  memoryWarningPercent: z.number().min(0).max(100).default(85),
  memoryCriticalPercent: z.number().min(0).max(100).default(95),
  diskWarningPercent: z.number().min(0).max(100).default(90),
  diskCriticalPercent: z.number().min(0).max(100).default(98),
  temperatureWarningCelsius: z.number().min(0).max(150).default(80),
  sustainedDurationSeconds: z.number().min(0).max(300).default(3),
});

export const LoggingConfigSchema = z.object({
  level: z.enum(['debug', 'info', 'warn', 'error', 'silent']).default('info'),
  logToFile: z.boolean().default(false),
  filePath: z.string().default('./taskpulse.log'),
});

export const AppConfigSchema = z.object({
  sampling: SamplingConfigSchema.default({}),
  ui: UiConfigSchema.default({}),
  providers: ProvidersConfigSchema.default({}),
  alerts: AlertsConfigSchema.default({}),
  logging: LoggingConfigSchema.default({}),
});

export type SamplingConfig = z.infer<typeof SamplingConfigSchema>;
export type UiConfig = z.infer<typeof UiConfigSchema>;
export type ProvidersConfig = z.infer<typeof ProvidersConfigSchema>;
export type AlertsConfig = z.infer<typeof AlertsConfigSchema>;
export type LoggingConfig = z.infer<typeof LoggingConfigSchema>;
export type AppConfig = z.infer<typeof AppConfigSchema>;
