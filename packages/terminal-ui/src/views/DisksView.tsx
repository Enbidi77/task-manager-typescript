import React from 'react';
import { Box, Text } from 'ink';
import { DiskMetrics } from '@taskpulse/core';
import { ColorTheme } from '../theme/theme.js';
import { ProgressBar } from '../components/ProgressBar.js';
import { Sparkline } from '../components/Sparkline.js';
import { formatBytes, formatBytesPerSec } from '@taskpulse/shared';

interface Props {
  disk: DiskMetrics;
  history: number[];
  theme: ColorTheme;
}

export const DisksView: React.FC<Props> = ({ disk, history, theme }) => {
  return (
    <Box flexDirection="column" paddingX={1}>
      {/* Live Disk I/O Card */}
      <Box
        borderStyle="single"
        borderColor={theme.border}
        paddingX={1}
        marginBottom={1}
        flexDirection="column"
      >
        <Box justifyContent="space-between" marginBottom={0}>
          <Text bold color={theme.primary}>
            LIVE DISK I/O ACTIVITY
          </Text>
          <Text color={theme.muted}>
            Total Throughput:{' '}
            <Text bold color={theme.warning}>
              {formatBytesPerSec(disk.io.totalBytesPerSec)}
            </Text>
          </Text>
        </Box>
        <Box justifyContent="space-between" marginY={1}>
          <Box>
            <Text color={theme.accent}>Read Speed: </Text>
            <Text bold color={theme.primary}>
              {formatBytesPerSec(disk.io.readBytesPerSec)}
            </Text>
            <Text color={theme.muted}>
              {' '}
              (
              {disk.io.readOpsPerSec.status === 'available'
                ? `${disk.io.readOpsPerSec.value} ops/s`
                : 'ops: N/A'}
              )
            </Text>
          </Box>
          <Box>
            <Text color={theme.accent}>Write Speed: </Text>
            <Text bold color={theme.warning}>
              {formatBytesPerSec(disk.io.writeBytesPerSec)}
            </Text>
            <Text color={theme.muted}>
              {' '}
              (
              {disk.io.writeOpsPerSec.status === 'available'
                ? `${disk.io.writeOpsPerSec.value} ops/s`
                : 'ops: N/A'}
              )
            </Text>
          </Box>
        </Box>
        <Box>
          <Sparkline
            values={history}
            length={50}
            theme={theme}
            color={theme.warning}
            label="I/O Throughput (60s)"
          />
        </Box>
      </Box>

      {/* Logical Volumes Table */}
      <Box
        borderStyle="single"
        borderColor={theme.border}
        paddingX={1}
        marginBottom={1}
        flexDirection="column"
      >
        <Box marginBottom={1}>
          <Text bold color={theme.primary}>
            MOUNTED LOGICAL VOLUMES ({disk.volumes.length} volumes)
          </Text>
        </Box>
        <Box borderStyle="single" borderColor={theme.border} paddingX={1} marginY={0}>
          <Box width={10}>
            <Text bold color={theme.primary}>
              Mount
            </Text>
          </Box>
          <Box width={16}>
            <Text bold color={theme.primary}>
              Filesystem
            </Text>
          </Box>
          <Box width={14}>
            <Text bold color={theme.primary}>
              Total
            </Text>
          </Box>
          <Box width={14}>
            <Text bold color={theme.primary}>
              Used
            </Text>
          </Box>
          <Box width={14}>
            <Text bold color={theme.primary}>
              Free
            </Text>
          </Box>
          <Box flexGrow={1}>
            <Text bold color={theme.primary}>
              Utilization
            </Text>
          </Box>
        </Box>
        {disk.volumes.map((vol) => (
          <Box key={vol.id} paddingX={1}>
            <Box width={10}>
              <Text bold color={theme.accent}>
                {vol.mount || vol.id}
              </Text>
            </Box>
            <Box width={16}>
              <Text>{vol.fsType || 'Standard'}</Text>
            </Box>
            <Box width={14}>
              <Text>{formatBytes(vol.totalBytes)}</Text>
            </Box>
            <Box width={14}>
              <Text>{formatBytes(vol.usedBytes)}</Text>
            </Box>
            <Box width={14}>
              <Text>{formatBytes(vol.freeBytes)}</Text>
            </Box>
            <Box flexGrow={1}>
              <ProgressBar percent={vol.utilization} width={18} theme={theme} />
            </Box>
          </Box>
        ))}
      </Box>

      {/* Physical Storage Drives */}
      <Box borderStyle="single" borderColor={theme.border} paddingX={1} flexDirection="column">
        <Box marginBottom={1}>
          <Text bold color={theme.primary}>
            PHYSICAL STORAGE DRIVES ({disk.devices.length} devices)
          </Text>
        </Box>
        {disk.devices.map((dev, idx) => (
          <Box key={idx} justifyContent="space-between" paddingX={1}>
            <Text color={theme.accent}>
              [{dev.device}] {dev.name}
            </Text>
            <Text color={theme.muted}>
              Type: {dev.type} | Vendor: {dev.vendor || 'Generic'} | Capacity:{' '}
              {formatBytes(dev.sizeBytes)}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
