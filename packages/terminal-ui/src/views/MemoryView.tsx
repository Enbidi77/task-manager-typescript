import React from 'react';
import { Box, Text } from 'ink';
import { MemoryMetrics, ProcessMetrics } from '@taskpulse/core';
import { ColorTheme } from '../theme/theme.js';
import { ProgressBar } from '../components/ProgressBar.js';
import { Sparkline } from '../components/Sparkline.js';
import { formatBytes, formatPercent } from '@taskpulse/shared';

interface Props {
  memory: MemoryMetrics;
  history: number[];
  topProcesses: ProcessMetrics[];
  theme: ColorTheme;
}

export const MemoryView: React.FC<Props> = ({ memory, history, topProcesses, theme }) => {
  const topMemProcs = [...topProcesses].sort((a, b) => b.memoryBytes - a.memoryBytes).slice(0, 6);

  const virtual = memory.virtualMemory.status === 'available' ? memory.virtualMemory.value : null;

  return (
    <Box flexDirection="column" paddingX={1}>
      {/* Physical RAM Header Card */}
      <Box
        borderStyle="single"
        borderColor={theme.border}
        paddingX={1}
        marginBottom={1}
        flexDirection="column"
      >
        <Box justifyContent="space-between" marginBottom={1}>
          <Box flexDirection="column">
            <Text bold color={theme.primary}>
              PHYSICAL SYSTEM MEMORY (RAM)
            </Text>
            <Text color={theme.muted}>
              Installed: {formatBytes(memory.totalBytes)} | In Use: {formatBytes(memory.usedBytes)}{' '}
              | Available: {formatBytes(memory.availableBytes)}
            </Text>
          </Box>
          <Box>
            <ProgressBar percent={memory.utilization} width={30} theme={theme} />
          </Box>
        </Box>
        <Box justifyContent="space-between">
          <Sparkline
            values={history}
            length={48}
            theme={theme}
            color={theme.secondary}
            label="RAM History"
          />
          <Text color={theme.muted}>Free (Unallocated): {formatBytes(memory.freeBytes)}</Text>
        </Box>
      </Box>

      {/* Page File / Swap & Commit Charge Row */}
      <Box marginBottom={1}>
        {/* Swap Card */}
        <Box
          borderStyle="single"
          borderColor={theme.border}
          paddingX={1}
          width="50%"
          marginRight={1}
          flexDirection="column"
        >
          <Box justifyContent="space-between">
            <Text bold color={theme.primary}>
              SWAP / PAGEFILE
            </Text>
            <Text color={theme.muted}>{formatPercent(memory.swap.utilization)}</Text>
          </Box>
          <Box marginY={0}>
            <ProgressBar percent={memory.swap.utilization} width={24} theme={theme} />
          </Box>
          <Box justifyContent="space-between" marginTop={1}>
            <Text color={theme.muted}>Used: {formatBytes(memory.swap.usedBytes)}</Text>
            <Text color={theme.muted}>Total: {formatBytes(memory.swap.totalBytes)}</Text>
          </Box>
        </Box>

        {/* Commit / Virtual Memory Card */}
        <Box
          borderStyle="single"
          borderColor={theme.border}
          paddingX={1}
          width="50%"
          flexDirection="column"
        >
          <Box justifyContent="space-between">
            <Text bold color={theme.primary}>
              VIRTUAL MEMORY COMMIT
            </Text>
            <Text color={theme.muted}>
              {virtual ? formatPercent(virtual.commitUtilization) : 'N/A'}
            </Text>
          </Box>
          <Box marginY={0}>
            {virtual ? (
              <ProgressBar percent={virtual.commitUtilization} width={24} theme={theme} />
            ) : (
              <Text color={theme.muted}>N/A</Text>
            )}
          </Box>
          <Box justifyContent="space-between" marginTop={1}>
            <Text color={theme.muted}>
              Committed: {virtual ? formatBytes(virtual.commitTotalBytes) : 'N/A'}
            </Text>
            <Text color={theme.muted}>
              Limit: {virtual ? formatBytes(virtual.commitLimitBytes) : 'N/A'}
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Windows Kernel Memory Pools & System Telemetry Card */}
      {memory.kernelMemory?.status === 'available' ? (
        <Box
          borderStyle="single"
          borderColor={theme.border}
          paddingX={1}
          marginBottom={1}
          flexDirection="column"
        >
          <Box justifyContent="space-between" marginBottom={1}>
            <Text bold color={theme.primary}>
              WINDOWS KERNEL MEMORY POOLS & SYSTEM TELEMETRY (Win32 FFI)
            </Text>
            <Text color={theme.accent}>
              Handles: {memory.kernelMemory.value.systemHandles.toLocaleString()} | Threads:{' '}
              {memory.kernelMemory.value.systemThreads.toLocaleString()}
            </Text>
          </Box>
          <Box justifyContent="space-between">
            <Box flexDirection="column" width="50%">
              <Text>
                <Text color={theme.muted}>Paged Pool: </Text>
                <Text bold color={theme.primary}>
                  {formatBytes(memory.kernelMemory.value.pagedPoolBytes)}
                </Text>
              </Text>
              <Text>
                <Text color={theme.muted}>Non-Paged Pool: </Text>
                <Text bold color={theme.primary}>
                  {formatBytes(memory.kernelMemory.value.nonPagedPoolBytes)}
                </Text>
              </Text>
            </Box>
            <Box flexDirection="column" width="50%">
              <Text>
                <Text color={theme.muted}>System File Cache: </Text>
                <Text bold color={theme.secondary}>
                  {formatBytes(memory.kernelMemory.value.systemCacheBytes)}
                </Text>
              </Text>
              <Text>
                <Text color={theme.muted}>Commit Peak: </Text>
                <Text bold color={theme.secondary}>
                  {formatBytes(memory.kernelMemory.value.commitPeakBytes)}
                </Text>
              </Text>
            </Box>
          </Box>
        </Box>
      ) : null}

      {/* Top Memory Consumers */}
      <Box
        borderStyle="single"
        borderColor={theme.border}
        paddingX={1}
        marginBottom={1}
        flexDirection="column"
      >
        <Box marginBottom={1}>
          <Text bold color={theme.primary}>
            TOP MEMORY CONSUMING PROCESSES
          </Text>
        </Box>
        {topMemProcs.map((p) => (
          <Box key={p.pid} justifyContent="space-between">
            <Text color={theme.accent}>
              {p.name.slice(0, 24).padEnd(25)}
              <Text color={theme.muted}>PID: {p.pid}</Text>
            </Text>
            <Text>
              RAM:{' '}
              <Text bold color={theme.primary}>
                {formatBytes(p.memoryBytes)}
              </Text>{' '}
              ({formatPercent(p.memoryPercent)}) | CPU: {formatPercent(p.cpuPercent)}
            </Text>
          </Box>
        ))}
      </Box>

      {/* Platform Semantics Note */}
      <Box borderStyle="single" borderColor={theme.border} paddingX={1}>
        <Text color={theme.muted}>
          <Text bold color={theme.secondary}>
            Architecture Note ({memory.platformSemantics.os}):{' '}
          </Text>
          {memory.platformSemantics.description}
        </Text>
      </Box>
    </Box>
  );
};
