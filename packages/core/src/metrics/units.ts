export type Unit =
  | 'bytes'
  | 'kilobytes'
  | 'megabytes'
  | 'gigabytes'
  | 'percent'
  | 'celsius'
  | 'megahertz'
  | 'gigahertz'
  | 'bytes_per_second'
  | 'count'
  | 'watts'
  | 'volts'
  | 'rpm';

export interface FormattedValue {
  raw: number;
  formatted: string;
  unit: Unit;
}
