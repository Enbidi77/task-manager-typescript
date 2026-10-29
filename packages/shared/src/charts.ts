const SPARK_CHARS = [' ', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

export function renderSparkline(
  values: number[],
  options?: {
    min?: number;
    max?: number;
    length?: number;
  },
): string {
  if (!values || values.length === 0) {
    return ' '.repeat(options?.length ?? 10);
  }

  let data = values;
  if (options?.length && options.length > 0) {
    if (data.length > options.length) {
      data = data.slice(-options.length);
    } else if (data.length < options.length) {
      const padding = new Array(options.length - data.length).fill(0);
      data = [...padding, ...data];
    }
  }

  const min = options?.min ?? Math.min(...data);
  const max = options?.max ?? Math.max(...data);
  const range = max - min;

  return data
    .map((v) => {
      if (range === 0 || !Number.isFinite(v)) {
        return SPARK_CHARS[0];
      }
      const normalized = Math.max(0, Math.min(1, (v - min) / range));
      const idx = Math.min(SPARK_CHARS.length - 1, Math.floor(normalized * SPARK_CHARS.length));
      return SPARK_CHARS[idx];
    })
    .join('');
}

export function renderProgressBar(
  percent: number,
  width: number = 20,
  filledChar: string = '█',
  emptyChar: string = '░',
): string {
  const safePercent = Math.max(0, Math.min(100, percent));
  const filledCount = Math.round((safePercent / 100) * width);
  const emptyCount = Math.max(0, width - filledCount);
  return filledChar.repeat(filledCount) + emptyChar.repeat(emptyCount);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function calculateRate(current: number, previous: number, deltaSeconds: number): number {
  if (deltaSeconds <= 0 || !Number.isFinite(deltaSeconds)) return 0;
  if (current < previous) {
    // Counter wrapped or interface reset
    return 0;
  }
  return Math.max(0, (current - previous) / deltaSeconds);
}
