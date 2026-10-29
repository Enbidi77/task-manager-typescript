import React from 'react';
import { Box, Text } from 'ink';
import { CpuMetrics, ProcessMetrics } from '@taskpulse/core';
import { ColorTheme } from '../theme/theme.js';
import { ProgressBar } from '../components/ProgressBar.js';
import { Sparkline } from '../components/Sparkline.js';
import { formatBytes, formatHertz, formatPercent, formatTemperature } from '@taskpulse/shared';

interface Props {
  cpu: CpuMetrics;
  history: number[];
  topProcesses: ProcessMetrics[];
  theme: ColorTheme;
}

export const CpuView: React.FC<Props> = ({ cpu, history, topProcesses, theme }) => {
  const { hardware, currentFrequencyGHz, temperatureCelsius, cores } = cpu;

  const topCpuProcs = [...topProcesses].sort((a, b) => b.cpuPercent - a.cpuPercent).slice(0, 6);

  return (
    <Box flexDirection="column" paddingX={1}>
      {/* CPU Header Summary */}
      <Box
        borderStyle="single"
        borderColor={theme.border}
        paddingX={1}
        marginBottom={1}
        justifyContent="space-between"
      >
        <Box flexDirection="column">
          <Text bold color={theme.primary}>
            {hardware.brand}
          </Text>
          <Text color={theme.muted}>
            Manufacturer: {hardware.manufacturer} | Sockets/Base:{' '}
            {hardware.speedGHz ? `${hardware.speedGHz} GHz` : 'N/A'}
          </Text>
        </Box>
        <Box flexDirection="column" alignItems="flex-end">
          <Text>
            Total Utilization:{' '}
            <Text bold color={cpu.utilization > 75 ? theme.danger : theme.success}>
              {formatPercent(cpu.utilization)}
            </Text>
          </Text>
          <Text color={theme.muted}>
            Cores: {hardware.physicalCores} Physical / {hardware.logicalCores} Logical
          </Text>
        </Box>
      </Box>

      {/* Main Bar & Sparkline */}
      <Box
        borderStyle="single"
        borderColor={theme.border}
        paddingX={1}
        marginBottom={1}
        flexDirection="column"
      >
        <Box justifyContent="space-between" marginBottom={0}>
          <Text bold color={theme.primary}>
            OVERALL UTILIZATION
          </Text>
          <ProgressBar percent={cpu.utilization} width={40} theme={theme} />
        </Box>
        <Box marginTop={1} justifyContent="space-between">
          <Sparkline values={history} length={50} theme={theme} label="Utilization History (60s)" />
          <Text color={theme.muted}>
            Clock:{' '}
            {currentFrequencyGHz.status === 'available'
              ? formatHertz(currentFrequencyGHz.value)
              : 'N/A'}{' '}
            | Temp:{' '}
            {temperatureCelsius.status === 'available'
              ? formatTemperature(temperatureCelsius.value)
              : 'N/A'}
          </Text>
        </Box>
      </Box>

      {/* Per-Core Breakdown Grid */}
      <Box
        borderStyle="single"
        borderColor={theme.border}
        paddingX={1}
        marginBottom={1}
        flexDirection="column"
      >
        <Box marginBottom={1}>
          <Text bold color={theme.primary}>
            PER-CORE LOGICAL PROCESSORS ({cores.length} cores)
          </Text>
        </Box>
        <Box flexWrap="wrap">
          {cores.map((c) => (
            <Box key={c.coreId} width="25%" marginBottom={1}>
              <Box flexDirection="column">
                <Box justifyContent="space-between">
                  <Text color={theme.accent}>Core {c.coreId}:</Text>
                  <Text bold color={c.utilization > 80 ? theme.danger : undefined}>
                    {formatPercent(c.utilization, 0)}
                  </Text>
                </Box>
                <ProgressBar
                  percent={c.utilization}
                  width={12}
                  theme={theme}
                  showPercentText={false}
                />
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Highest CPU Consumer Processes */}
      <Box borderStyle="single" borderColor={theme.border} paddingX={1} flexDirection="column">
        <Box marginBottom={1}>
          <Text bold color={theme.primary}>
            HIGHEST CPU PROCESSES
          </Text>
        </Box>
        {topCpuProcs.map((p) => (
          <Box key={p.pid} justifyContent="space-between">
            <Text color={theme.accent}>
              {p.name.slice(0, 24).padEnd(25)}
              <Text color={theme.muted}>PID: {p.pid}</Text>
            </Text>
            <Text>
              Memory: {formatBytes(p.memoryBytes)} | CPU:{' '}
              <Text bold color={p.cpuPercent > 30 ? theme.danger : theme.success}>
                {formatPercent(p.cpuPercent)}
              </Text>
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
