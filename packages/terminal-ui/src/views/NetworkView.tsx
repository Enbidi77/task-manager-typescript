import React from 'react';
import { Box, Text } from 'ink';
import { NetworkMetrics } from '@taskpulse/core';
import { ColorTheme } from '../theme/theme.js';
import { Sparkline } from '../components/Sparkline.js';
import { formatBytes, formatBytesPerSec } from '@taskpulse/shared';

interface Props {
  network: NetworkMetrics;
  history: number[];
  theme: ColorTheme;
}

export const NetworkView: React.FC<Props> = ({ network, history, theme }) => {
  return (
    <Box flexDirection="column" paddingX={1}>
      {/* Network Traffic Summary Card */}
      <Box
        borderStyle="single"
        borderColor={theme.border}
        paddingX={1}
        marginBottom={1}
        flexDirection="column"
      >
        <Box justifyContent="space-between" marginBottom={0}>
          <Text bold color={theme.primary}>
            NETWORK TRAFFIC & BANDWIDTH
          </Text>
          <Text color={theme.muted}>
            Total Rx: {formatBytes(network.totalRxBytes)} | Total Tx:{' '}
            {formatBytes(network.totalTxBytes)}
          </Text>
        </Box>
        <Box justifyContent="space-between" marginY={1}>
          <Box>
            <Text color={theme.accent}>Download Rate (Rx): </Text>
            <Text bold color={theme.primary}>
              {formatBytesPerSec(network.totalRxBytesPerSec)}
            </Text>
          </Box>
          <Box>
            <Text color={theme.accent}>Upload Rate (Tx): </Text>
            <Text bold color={theme.secondary}>
              {formatBytesPerSec(network.totalTxBytesPerSec)}
            </Text>
          </Box>
        </Box>
        <Box>
          <Sparkline
            values={history}
            length={50}
            theme={theme}
            color={theme.accent}
            label="Total Throughput (60s)"
          />
        </Box>
      </Box>

      {/* Network Adapters Table */}
      <Box borderStyle="single" borderColor={theme.border} paddingX={1} flexDirection="column">
        <Box marginBottom={1}>
          <Text bold color={theme.primary}>
            NETWORK INTERFACES ({network.interfaces.length} adapters)
          </Text>
        </Box>
        <Box borderStyle="single" borderColor={theme.border} paddingX={1} marginY={0}>
          <Box width={16}>
            <Text bold color={theme.primary}>
              Interface
            </Text>
          </Box>
          <Box width={8}>
            <Text bold color={theme.primary}>
              Status
            </Text>
          </Box>
          <Box width={16}>
            <Text bold color={theme.primary}>
              IPv4
            </Text>
          </Box>
          <Box width={14}>
            <Text bold color={theme.primary}>
              Download
            </Text>
          </Box>
          <Box width={14}>
            <Text bold color={theme.primary}>
              Upload
            </Text>
          </Box>
          <Box width={14}>
            <Text bold color={theme.primary}>
              Total Rx
            </Text>
          </Box>
          <Box flexGrow={1}>
            <Text bold color={theme.primary}>
              Total Tx
            </Text>
          </Box>
        </Box>
        {network.interfaces.map((iface) => (
          <Box key={iface.id} paddingX={1}>
            <Box width={16}>
              <Text bold color={theme.accent}>
                {iface.name.slice(0, 15)}
              </Text>
            </Box>
            <Box width={8}>
              <Text color={iface.isUp ? theme.success : theme.muted}>
                {iface.isUp ? 'UP' : 'DOWN'}
              </Text>
            </Box>
            <Box width={16}>
              <Text>{iface.ip4 || 'None'}</Text>
            </Box>
            <Box width={14}>
              <Text>{formatBytesPerSec(iface.rxBytesPerSec)}</Text>
            </Box>
            <Box width={14}>
              <Text>{formatBytesPerSec(iface.txBytesPerSec)}</Text>
            </Box>
            <Box width={14}>
              <Text>{formatBytes(iface.rxBytes)}</Text>
            </Box>
            <Box flexGrow={1}>
              <Text>{formatBytes(iface.txBytes)}</Text>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
