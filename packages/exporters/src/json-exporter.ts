import { ExportOptions, ExportResult, IMetricExporter, SystemSnapshot } from '@taskpulse/core';

export class JsonExporter implements IMetricExporter {
  readonly format = 'json';

  async export(snapshots: SystemSnapshot[], options?: ExportOptions): Promise<ExportResult> {
    let output: unknown = snapshots;

    if (options && !options.includeProcesses) {
      output = snapshots.map((s) => {
        const { processes: _, ...rest } = s;
        return rest;
      });
    }

    const jsonString = JSON.stringify(output, null, 2);

    return {
      format: 'json',
      data: jsonString,
      snapshotCount: snapshots.length,
      timestamp: Date.now(),
    };
  }
}
