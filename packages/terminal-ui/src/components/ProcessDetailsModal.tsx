import React from 'react';
import { Box, Text } from 'ink';
import { ColorTheme } from '../theme/theme.js';
import { ProcessMetrics } from '@taskpulse/core';
import { formatBytes, formatPercent, truncate } from '@taskpulse/shared';

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

  const renderRow = (label: string, valueNode: React.ReactNode) => (
    <Box key={label} justifyContent="flex-start" marginY={0}>
      <Box width={24}>
        <Text bold color={theme.accent}>
          {label}:
        </Text>
      </Box>
      <Box flexGrow={1}>{valueNode}</Box>
    </Box>
  );

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={theme.primary}
      paddingX={2}
      paddingY={1}
      width={80}
    >
      <Box justifyContent="center" marginBottom={1}>
        <Text bold color={theme.primary}>
          PROCESS DETAILS — {process.name} (PID: {process.pid})
        </Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        {renderRow(
          'Process Name',
          <Text bold color={theme.primary}>
            {process.name}
          </Text>,
        )}
        {renderRow(
          'PID / PPID',
          <Text>
            <Text bold color={theme.secondary}>
              {process.pid}
            </Text>
            {process.parentPid ? (
              <Text color={theme.muted}> (Parent: {process.parentPid})</Text>
            ) : (
              ''
            )}
          </Text>,
        )}
        {renderRow(
          'Process State',
          <Text
            bold
            color={
              process.state === 'running'
                ? theme.success
                : process.state === 'sleeping'
                  ? theme.muted
                  : theme.warning
            }
          >
            ● {process.state.toUpperCase()}
          </Text>,
        )}
        {renderRow('User / Owner', <Text>{process.user || 'Unknown / System'}</Text>)}
        {renderRow(
          'CPU Utilization',
          <Text
            bold
            color={
              process.cpuPercent > 30
                ? theme.danger
                : process.cpuPercent > 10
                  ? theme.warning
                  : theme.success
            }
          >
            {formatPercent(process.cpuPercent)}
          </Text>,
        )}
        {renderRow(
          'Resident Memory (RSS)',
          <Text>
            <Text bold color={theme.primary}>
              {formatBytes(process.memoryBytes)}
            </Text>
            <Text color={theme.muted}> ({formatPercent(process.memoryPercent)})</Text>
          </Text>,
        )}
        {process.privateWorkingSetBytes?.status === 'available' &&
          renderRow(
            'Private Working Set',
            <Text bold color={theme.secondary}>
              {formatBytes(process.privateWorkingSetBytes.value)}
            </Text>,
          )}
        {process.peakWorkingSetBytes?.status === 'available' &&
          renderRow(
            'Peak Working Set',
            <Text color={theme.muted}>{formatBytes(process.peakWorkingSetBytes.value)}</Text>,
          )}
        {process.virtualMemoryBytes &&
          renderRow(
            'Virtual Memory (VSZ)',
            <Text color={theme.muted}>{formatBytes(process.virtualMemoryBytes)}</Text>,
          )}
        {renderRow(
          'Open System Handles',
          <Text bold color={process.handles?.status === 'available' ? theme.accent : theme.muted}>
            {process.handles?.status === 'available'
              ? process.handles.value.toLocaleString()
              : 'N/A (Access Denied / System)'}
          </Text>,
        )}
        {process.pageFaults?.status === 'available' &&
          renderRow(
            'Page Faults',
            <Text color={theme.muted}>{process.pageFaults.value.toLocaleString()}</Text>,
          )}
        {renderRow('Active Threads', <Text color={theme.muted}>{threadsText}</Text>)}
        {renderRow('Executable Path', <Text color={theme.muted}>{truncate(pathText, 50)}</Text>)}
        {process.command &&
          renderRow(
            'Command Line',
            <Text color={theme.muted}>{truncate(process.command, 50)}</Text>,
          )}
      </Box>

      <Box justifyContent="center">
        <Text color={theme.muted}>
          Press{' '}
          <Text bold color={theme.primary}>
            [Esc]
          </Text>
          ,{' '}
          <Text bold color={theme.primary}>
            [Enter]
          </Text>
          , or{' '}
          <Text bold color={theme.primary}>
            [q]
          </Text>{' '}
          to return to process list
        </Text>
      </Box>
    </Box>
  );
};
