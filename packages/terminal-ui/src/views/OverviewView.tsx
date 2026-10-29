import React from 'react';
import { Box, Text } from 'ink';
import { SystemSnapshot } from '@taskpulse/core';
import { ColorTheme } from '../theme/theme.js';
import { ProgressBar } from '../components/ProgressBar.js';
import { Sparkline } from '../components/Sparkline.js';
import {
  formatBytes,
  formatBytesPerSec,
  formatPercent,
  formatTemperature,
} from '@taskpulse/shared';

interface Props {
  snapshot: SystemSnapshot;
  cpuHistory: number[];
  memoryHistory: number[];
  diskHistory: number[];
  networkHistory: number[];
  theme: ColorTheme;
}

export const OverviewView: React.FC<Props> = ({
  snapshot,
  cpuHistory,
  memoryHistory,
  diskHistory,
  networkHistory,
  theme,
}) => {
  const { cpu, memory, disk, network, gpu, hardware, processes, os } = snapshot;

  const topCpuProcs = [...processes].sort((a, b) => b.cpuPercent - a.cpuPercent).slice(0, 4);

  const primaryGpu = gpu.devices[0];
  const gpuUtil =
    primaryGpu?.utilization.status === 'available' ? primaryGpu.utilization.value : null;

  const km = memory.kernelMemory?.status === 'available' ? memory.kernelMemory.value : null;

  return (
    <Box flexDirection="column" paddingX={1}>
      {/* OS Banner */}
      <Box justifyContent="space-between" marginBottom={1}>
        <Text color={theme.accent}>
          {os.distro} ({os.arch}) — Kernel: {os.release}
        </Text>
        <Text color={theme.muted}>
          {km ? (
            <Text>
              Handles:{' '}
              <Text bold color={theme.accent}>
                {km.systemHandles.toLocaleString()}
              </Text>{' '}
              | Threads:{' '}
              <Text bold color={theme.accent}>
                {km.systemThreads.toLocaleString()}
              </Text>{' '}
              |{' '}
            </Text>
          ) : null}
          Processes:{' '}
          <Text bold color={theme.primary}>
            {snapshot.totalProcessCount}
          </Text>{' '}
          | Latency: {snapshot.samplingDurationMs}ms
        </Text>
      </Box>

      {/* Row 1: CPU & Memory Cards */}
      <Box marginBottom={1}>
        {/* CPU Card */}
        <Box
          flexDirection="column"
          borderStyle="single"
          borderColor={theme.border}
          paddingX={1}
          width="50%"
          marginRight={1}
        >
          <Box justifyContent="space-between">
            <Text bold color={theme.primary}>
              CPU UTILIZATION
            </Text>
            <Text color={theme.accent}>{cpu.hardware.brand}</Text>
          </Box>
          <Box marginY={0}>
            <ProgressBar percent={cpu.utilization} width={24} theme={theme} />
          </Box>
          <Box justifyContent="space-between" marginTop={1}>
            <Text color={theme.muted}>
              Cores: {cpu.hardware.physicalCores}P / {cpu.hardware.logicalCores}L
            </Text>
            <Text color={theme.muted}>
              Temp:{' '}
              {hardware.cpuPackageTemp.status === 'available'
                ? formatTemperature(hardware.cpuPackageTemp.value)
                : 'N/A'}
            </Text>
          </Box>
          <Box marginTop={1}>
            <Sparkline values={cpuHistory} length={32} theme={theme} label="History" />
          </Box>
        </Box>

        {/* Memory Card */}
        <Box
          flexDirection="column"
          borderStyle="single"
          borderColor={theme.border}
          paddingX={1}
          width="50%"
        >
          <Box justifyContent="space-between">
            <Text bold color={theme.primary}>
              MEMORY (RAM)
            </Text>
            <Text color={theme.muted}>
              {formatBytes(memory.usedBytes)} / {formatBytes(memory.totalBytes)}
            </Text>
          </Box>
          <Box marginY={0}>
            <ProgressBar percent={memory.utilization} width={24} theme={theme} />
          </Box>
          <Box justifyContent="space-between" marginTop={1}>
            <Text color={theme.muted}>Available: {formatBytes(memory.availableBytes)}</Text>
            <Text color={theme.muted}>
              Swap: {formatBytes(memory.swap.usedBytes)} ({formatPercent(memory.swap.utilization)})
            </Text>
          </Box>
          {km ? (
            <Box justifyContent="space-between" marginTop={0}>
              <Text color={theme.muted}>
                Paged: {formatBytes(km.pagedPoolBytes)} | Non-paged:{' '}
                {formatBytes(km.nonPagedPoolBytes)}
              </Text>
              <Text color={theme.muted}>Cache: {formatBytes(km.systemCacheBytes)}</Text>
            </Box>
          ) : null}
          <Box marginTop={1}>
            <Sparkline
              values={memoryHistory}
              length={32}
              theme={theme}
              color={theme.secondary}
              label="History"
            />
          </Box>
        </Box>
      </Box>

      {/* Row 2: Disks & Network Cards */}
      <Box marginBottom={1}>
        {/* Disk Card */}
        <Box
          flexDirection="column"
          borderStyle="single"
          borderColor={theme.border}
          paddingX={1}
          width="50%"
          marginRight={1}
        >
          <Box justifyContent="space-between">
            <Text bold color={theme.primary}>
              STORAGE & DISK I/O
            </Text>
            <Text color={theme.muted}>
              R: {formatBytesPerSec(disk.io.readBytesPerSec)} | W:{' '}
              {formatBytesPerSec(disk.io.writeBytesPerSec)}
            </Text>
          </Box>
          <Box flexDirection="column" marginTop={0}>
            {disk.volumes.slice(0, 2).map((vol) => (
              <Box key={vol.id} justifyContent="space-between">
                <Text color={theme.accent}>
                  {vol.mount || vol.name} ({vol.fsType})
                </Text>
                <ProgressBar percent={vol.utilization} width={16} theme={theme} />
              </Box>
            ))}
          </Box>
          <Box marginTop={1}>
            <Sparkline
              values={diskHistory}
              length={32}
              theme={theme}
              color={theme.warning}
              label="I/O Activity"
            />
          </Box>
        </Box>

        {/* Network Card */}
        <Box
          flexDirection="column"
          borderStyle="single"
          borderColor={theme.border}
          paddingX={1}
          width="50%"
        >
          <Box justifyContent="space-between">
            <Text bold color={theme.primary}>
              NETWORK ACTIVITY
            </Text>
            <Text color={theme.muted}>
              ↓ {formatBytesPerSec(network.totalRxBytesPerSec)} | ↑{' '}
              {formatBytesPerSec(network.totalTxBytesPerSec)}
            </Text>
          </Box>
          <Box flexDirection="column" marginTop={0}>
            {network.interfaces
              .filter((i) => i.isUp)
              .slice(0, 2)
              .map((iface) => (
                <Box key={iface.id} justifyContent="space-between">
                  <Text color={theme.accent}>{iface.name}</Text>
                  <Text color={theme.muted}>
                    ↓ {formatBytesPerSec(iface.rxBytesPerSec)} ↑{' '}
                    {formatBytesPerSec(iface.txBytesPerSec)}
                  </Text>
                </Box>
              ))}
          </Box>
          <Box marginTop={1}>
            <Sparkline
              values={networkHistory}
              length={32}
              theme={theme}
              color={theme.accent}
              label="Throughput"
            />
          </Box>
        </Box>
      </Box>

      {/* Row 3: Top CPU Processes & GPU */}
      <Box>
        {/* Top Processes */}
        <Box
          flexDirection="column"
          borderStyle="single"
          borderColor={theme.border}
          paddingX={1}
          width="50%"
          marginRight={1}
        >
          <Text bold color={theme.primary}>
            TOP ACTIVE PROCESSES
          </Text>
          {topCpuProcs.map((p) => (
            <Box key={p.pid} justifyContent="space-between">
              <Text color={theme.accent}>
                {p.name.slice(0, 20).padEnd(20)}
                <Text color={theme.muted}> ({p.pid})</Text>
              </Text>
              <Text bold color={p.cpuPercent > 30 ? theme.danger : theme.success}>
                {formatPercent(p.cpuPercent)} CPU {formatBytes(p.memoryBytes)}
              </Text>
            </Box>
          ))}
        </Box>

        {/* GPU & Hardware Summary */}
        <Box
          flexDirection="column"
          borderStyle="single"
          borderColor={theme.border}
          paddingX={1}
          width="50%"
        >
          <Box justifyContent="space-between">
            <Text bold color={theme.primary}>
              GRAPHICS & SENSORS
            </Text>
            <Text color={theme.muted}>
              {primaryGpu?.name ? primaryGpu.name.slice(0, 24) : 'Integrated / Standard'}
            </Text>
          </Box>
          {gpuUtil !== null ? (
            <Box marginY={0}>
              <Text color={theme.muted}>GPU Load: </Text>
              <ProgressBar percent={gpuUtil} width={20} theme={theme} />
            </Box>
          ) : (
            <Text color={theme.muted}>GPU Compute: N/A (Integrated/Unsupported)</Text>
          )}
          {primaryGpu?.memoryTotalBytes && primaryGpu.memoryUsedBytes ? (
            <Text color={theme.muted}>
              VRAM: {formatBytes(primaryGpu.memoryUsedBytes)} /{' '}
              {formatBytes(primaryGpu.memoryTotalBytes)}
            </Text>
          ) : null}
          <Box marginTop={1} justifyContent="space-between">
            <Text color={theme.muted}>
              GPU Temp:{' '}
              {primaryGpu?.temperatureCelsius.status === 'available'
                ? formatTemperature(primaryGpu.temperatureCelsius.value)
                : 'N/A'}
            </Text>
            <Text color={theme.muted}>
              CPU Temp:{' '}
              {hardware.cpuPackageTemp.status === 'available'
                ? formatTemperature(hardware.cpuPackageTemp.value)
                : 'N/A'}
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
