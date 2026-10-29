import React from 'react';
import { Box, Text } from 'ink';
import { ProcessMetrics, ProcessSortField, ProcessSortDirection } from '@taskpulse/core';
import { ColorTheme } from '../theme/theme.js';
import { formatBytes, formatPercent } from '@taskpulse/shared';

interface Props {
  processes: ProcessMetrics[];
  selectedIndex: number;
  sortField: ProcessSortField;
  sortDirection: ProcessSortDirection;
  searchQuery: string;
  theme: ColorTheme;
  maxRows?: number;
}

export const ProcessesView: React.FC<Props> = ({
  processes,
  selectedIndex,
  sortField,
  sortDirection,
  searchQuery,
  theme,
  maxRows = 16,
}) => {
  // Filter
  const filtered = processes.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      String(p.pid).includes(q) ||
      (p.user && p.user.toLowerCase().includes(q))
    );
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'cpu':
        comparison = b.cpuPercent - a.cpuPercent;
        break;
      case 'memory':
        comparison = b.memoryBytes - a.memoryBytes;
        break;
      case 'pid':
        comparison = a.pid - b.pid;
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'threads': {
        const aT = a.threads.status === 'available' ? a.threads.value : 0;
        const bT = b.threads.status === 'available' ? b.threads.value : 0;
        comparison = bT - aT;
        break;
      }
      case 'handles': {
        const aH = a.handles?.status === 'available' ? a.handles.value : 0;
        const bH = b.handles?.status === 'available' ? b.handles.value : 0;
        comparison = bH - aH;
        break;
      }
    }
    return sortDirection === 'asc' ? -comparison : comparison;
  });

  // Windowing/scrolling
  const total = sorted.length;
  const safeSelected = Math.max(0, Math.min(total - 1, selectedIndex));
  const startIdx = Math.max(
    0,
    Math.min(safeSelected - Math.floor(maxRows / 2), Math.max(0, total - maxRows)),
  );
  const visible = sorted.slice(startIdx, startIdx + maxRows);

  const sortIndicator = (field: ProcessSortField) => {
    if (sortField !== field) return '';
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <Box flexDirection="column" paddingX={1}>
      {/* Summary Header */}
      <Box justifyContent="space-between" marginBottom={0}>
        <Text bold color={theme.primary}>
          PROCESS EXPLORER ({total} active processes)
        </Text>
        <Text color={theme.muted}>
          Sorted by:{' '}
          <Text bold color={theme.accent}>
            {sortField.toUpperCase()}
            {sortIndicator(sortField)}
          </Text>{' '}
          | Filter: {searchQuery || 'None'}
        </Text>
      </Box>

      {/* Table Header */}
      <Box borderStyle="single" borderColor={theme.border} paddingX={1} marginY={0}>
        <Box width={8}>
          <Text bold color={theme.primary}>
            PID{sortIndicator('pid')}
          </Text>
        </Box>
        <Box width={26}>
          <Text bold color={theme.primary}>
            Name{sortIndicator('name')}
          </Text>
        </Box>
        <Box width={10}>
          <Text bold color={theme.primary}>
            CPU %{sortIndicator('cpu')}
          </Text>
        </Box>
        <Box width={11}>
          <Text bold color={theme.primary}>
            Memory{sortIndicator('memory')}
          </Text>
        </Box>
        <Box width={9}>
          <Text bold color={theme.primary}>
            Handles{sortIndicator('handles')}
          </Text>
        </Box>
        <Box width={9}>
          <Text bold color={theme.primary}>
            Threads{sortIndicator('threads')}
          </Text>
        </Box>
        <Box width={9}>
          <Text bold color={theme.primary}>
            State
          </Text>
        </Box>
        <Box flexGrow={1}>
          <Text bold color={theme.primary}>
            User
          </Text>
        </Box>
      </Box>

      {/* Process Rows */}
      <Box flexDirection="column">
        {visible.map((proc, idx) => {
          const absIdx = startIdx + idx;
          const isSelected = absIdx === safeSelected;
          const threadsText =
            proc.threads.status === 'available' ? String(proc.threads.value) : '-';
          const handlesText =
            proc.handles?.status === 'available' ? String(proc.handles.value) : '-';

          return (
            <Box
              key={proc.pid}
              paddingX={1}
              borderStyle={isSelected ? 'single' : undefined}
              borderColor={isSelected ? theme.accent : undefined}
            >
              <Box width={8}>
                <Text bold={isSelected} color={isSelected ? theme.accent : theme.muted}>
                  {proc.pid}
                </Text>
              </Box>
              <Box width={26}>
                <Text bold={isSelected} color={isSelected ? theme.primary : undefined}>
                  {proc.name.slice(0, 24)}
                </Text>
              </Box>
              <Box width={10}>
                <Text
                  bold={proc.cpuPercent > 10}
                  color={
                    proc.cpuPercent > 30
                      ? theme.danger
                      : proc.cpuPercent > 5
                        ? theme.warning
                        : undefined
                  }
                >
                  {formatPercent(proc.cpuPercent)}
                </Text>
              </Box>
              <Box width={11}>
                <Text>{formatBytes(proc.memoryBytes)}</Text>
              </Box>
              <Box width={9}>
                <Text color={theme.accent}>{handlesText}</Text>
              </Box>
              <Box width={9}>
                <Text color={theme.muted}>{threadsText}</Text>
              </Box>
              <Box width={9}>
                <Text color={proc.state === 'running' ? theme.success : theme.muted}>
                  {proc.state.slice(0, 8)}
                </Text>
              </Box>
              <Box flexGrow={1}>
                <Text color={theme.muted}>{(proc.user || '').slice(0, 18)}</Text>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Row count status */}
      <Box marginTop={1} justifyContent="space-between">
        <Text color={theme.muted}>
          Showing rows {startIdx + 1}-{Math.min(total, startIdx + maxRows)} of {total}
        </Text>
        <Text color={theme.muted}>
          Press{' '}
          <Text bold color={theme.secondary}>
            [k]
          </Text>{' '}
          to terminate |{' '}
          <Text bold color={theme.secondary}>
            [Enter]
          </Text>{' '}
          for details
        </Text>
      </Box>
    </Box>
  );
};
