import { MetricValue } from './availability.js';

export interface TemperatureSensor {
  id: string;
  label: string;
  currentCelsius: number;
  maxCelsius?: number;
}

export interface FanSensor {
  id: string;
  label: string;
  rpm: number;
}

export interface VoltageSensor {
  id: string;
  label: string;
  volts: number;
}

export interface PowerSensor {
  id: string;
  label: string;
  watts: number;
}

export interface HardwareMetrics {
  cpuPackageTemp: MetricValue<number>;
  cpuCoreTemps: TemperatureSensor[];
  fans: FanSensor[];
  voltages: VoltageSensor[];
  powers: PowerSensor[];
  timestamp: number;
}
