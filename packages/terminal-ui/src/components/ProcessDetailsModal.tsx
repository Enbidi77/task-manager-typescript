import React from 'react';
import { Box, Text } from 'ink';
import { ColorTheme } from '../theme/theme.js';
import { ProcessMetrics } from '@taskpulse/core';
import { formatBytes, formatPercent } from '@taskpulse/shared';

interface Props {
  process: ProcessMetrics;
  theme: ColorTheme;
}

export const ProcessDetailsModal: React.FC<Props> = ({ process, theme }) => {
  const threadsText =
    process.threads.status === 'available' ? String(process.threads.value) : 'N/A';
  const pathText =
    process.executablePath.status === 'available'
      ? process.executablePath.value
      : process.executablePath.status === 'unavailable'
        ? `[${process.executablePath.reason}]`
        : '[Unavailable]';

  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor={theme.primary}
      paddingX={2}
      paddingY={1}
      width={76}
    >
      <Box justifyContent="center" marginBottom={1}>
        <Text bold color={theme.primary}>
          PROCESS DETAILS: {process.name} (PID: {process.pid})
        </Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text>
          <Text bold color={theme.accent}>
            Process Name:{' '}
          </Text>
          <Text>{process.name}</Text>
        </Text>
        <Text>
          <Text bold color={theme.accent}>
            PID / PPID:{' '}
          </Text>
          <Text>
            {process.pid} {process.parentPid ? `(Parent: ${process.parentPid})` : ''}
          </Text>
        </Text>
        <Text>
          <Text bold color={theme.accent}>
            State:{' '}
          </Text>
          <Text color={process.state === 'running' ? theme.success : theme.muted}>
            {process.state.toUpperCase()}
          </Text>
        </Text>
        <Text>
          <Text bold color={theme.accent}>
            User:{' '}
          </Text>
          <Text>{process.user || 'Unknown'}</Text>
        </Text>
        <Text>
          <Text bold color={theme.accent}>
            CPU Usage:{' '}
          </Text>
          <Text bold color={process.cpuPercent > 50 ? theme.danger : theme.success}>
            {formatPercent(process.cpuPercent)}
          </Text>
        </Text>
        <Text>
          <Text bold color={theme.accent}>
            Resident Memory:
          </Text>
          <Text>
            {formatBytes(process.memoryBytes)} ({formatPercent(process.memoryPercent)})
          </Text>
        </Text>
        {process.virtualMemoryBytes && (
          <Text>
            <Text bold color={theme.accent}>
              Virtual Memory:{' '}
            </Text>
            <Text>{formatBytes(process.virtualMemoryBytes)}</Text>
          </Text>
        )}
        <Text>
          <Text bold color={theme.accent}>
            Threads:{' '}
          </Text>
          <Text>{threadsText}</Text>
        </Text>
        <Text>
          <Text bold color={theme.accent}>
            Executable:{' '}
          </Text>
          <Text color={theme.muted}>{pathText}</Text>
        </Text>
        {process.command && (
          <Text>
            <Text bold color={theme.accent}>
              Command Line:{' '}
            </Text>
            <Text color={theme.muted}>{process.command.slice(0, 150)}</Text>
          </Text>
        )}
      </Box>

      <Box justifyContent="center">
        <Text color={theme.muted}>
          Press{' '}
          <Text bold color={theme.primary}>
            [Esc]
          </Text>{' '}
          or{' '}
          <Text bold color={theme.primary}>
            [Enter]
          </Text>{' '}
          to close
        </Text>
      </Box>
    </Box>
  );
};
