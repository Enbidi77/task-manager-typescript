import { ExportOptions, ExportResult, IMetricExporter, SystemSnapshot } from '@taskpulse/core';

export class CsvExporter implements IMetricExporter {
  readonly format = 'csv';

  async export(snapshots: SystemSnapshot[], _options?: ExportOptions): Promise<ExportResult> {
    const headers = [
      'timestamp',
      'datetime',
      'cpu_utilization_pct',
      'memory_total_bytes',
      'memory_used_bytes',
      'memory_utilization_pct',
      'disk_read_bytes_sec',
      'disk_write_bytes_sec',
      'network_rx_bytes_sec',
      'network_tx_bytes_sec',
      'gpu_utilization_pct',
      'process_count',
    ];

    const rows: string[] = [headers.join(',')];

    for (const s of snapshots) {
      const gpu = s.gpu.devices[0];
      const gpuVal =
        gpu?.utilization.status === 'available' ? gpu.utilization.value.toFixed(1) : '';

      const row = [
        s.timestamp,
        new Date(s.timestamp).toISOString(),
        s.cpu.utilization.toFixed(1),
        s.memory.totalBytes,
        s.memory.usedBytes,
        s.memory.utilization.toFixed(1),
        s.disk.io.readBytesPerSec.toFixed(0),
        s.disk.io.writeBytesPerSec.toFixed(0),
        s.network.totalRxBytesPerSec.toFixed(0),
        s.network.totalTxBytesPerSec.toFixed(0),
        gpuVal,
        s.totalProcessCount,
      ];
      rows.push(row.join(','));
    }

    return {
      format: 'csv',
      data: rows.join('\n'),
      snapshotCount: snapshots.length,
      timestamp: Date.now(),
    };
  }
}
