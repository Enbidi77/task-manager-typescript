import React from 'react';
import { Box, Text } from 'ink';
import { AppConfig } from '@taskpulse/config';
import { ProviderStatusSummary } from '@taskpulse/core';
import { ColorTheme } from '../theme/theme.js';

interface Props {
  config: AppConfig;
  providerStatus: Record<string, ProviderStatusSummary>;
  theme: ColorTheme;
}

export const SettingsView: React.FC<Props> = ({ config, providerStatus, theme }) => {
  return (
    <Box flexDirection="column" paddingX={1}>
      {/* Configuration Details Card */}
      <Box
        borderStyle="single"
        borderColor={theme.border}
        paddingX={1}
        marginBottom={1}
        flexDirection="column"
      >
        <Box marginBottom={1}>
          <Text bold color={theme.primary}>
            RUNTIME CONFIGURATION & PREFERENCES
          </Text>
        </Box>
        <Box justifyContent="space-between" marginBottom={0}>
          <Text>
            <Text bold color={theme.accent}>
              Sampling Interval:{' '}
            </Text>
            {config.sampling.intervalMs} ms
          </Text>
          <Text>
            <Text bold color={theme.accent}>
              History Retention:{' '}
            </Text>
            {config.sampling.historyDurationSeconds} seconds
          </Text>
          <Text>
            <Text bold color={theme.accent}>
              Collector Timeout:{' '}
            </Text>
            {config.sampling.timeoutMs} ms
          </Text>
        </Box>
        <Box justifyContent="space-between" marginTop={1}>
          <Text>
            <Text bold color={theme.accent}>
              UI Theme:{' '}
            </Text>
            {config.ui.theme}
          </Text>
          <Text>
            <Text bold color={theme.accent}>
              Show Charts:{' '}
            </Text>
            {config.ui.showCharts ? 'Enabled' : 'Disabled'}
          </Text>
          <Text>
            <Text bold color={theme.accent}>
              Logging Level:{' '}
            </Text>
            {config.logging.level}
          </Text>
        </Box>
      </Box>

      {/* Provider Health & Status Table */}
      <Box borderStyle="single" borderColor={theme.border} paddingX={1} flexDirection="column">
        <Box marginBottom={1}>
          <Text bold color={theme.primary}>
            METRIC PROVIDERS HEALTH & LATENCY
          </Text>
        </Box>
        <Box borderStyle="single" borderColor={theme.border} paddingX={1} marginY={0}>
          <Box width={20}>
            <Text bold color={theme.primary}>
              Provider Subsystem
            </Text>
          </Box>
          <Box width={14}>
            <Text bold color={theme.primary}>
              Health
            </Text>
          </Box>
          <Box width={16}>
            <Text bold color={theme.primary}>
              Latency
            </Text>
          </Box>
          <Box width={22}>
            <Text bold color={theme.primary}>
              Last Sample Time
            </Text>
          </Box>
          <Box flexGrow={1}>
            <Text bold color={theme.primary}>
              Diagnostic Notes
            </Text>
          </Box>
        </Box>
        {Object.entries(providerStatus).map(([name, status]) => (
          <Box key={name} paddingX={1}>
            <Box width={20}>
              <Text bold color={theme.accent}>
                {name.toUpperCase()}
              </Text>
            </Box>
            <Box width={14}>
              <Text color={status.healthy ? theme.success : theme.danger}>
                {status.healthy ? '● HEALTHY' : '▲ DEGRADED'}
              </Text>
            </Box>
            <Box width={16}>
              <Text>{status.latencyMs} ms</Text>
            </Box>
            <Box width={22}>
              <Text color={theme.muted}>
                {new Date(status.lastSampleTime).toLocaleTimeString()}
              </Text>
            </Box>
            <Box flexGrow={1}>
              <Text color={status.error ? theme.danger : theme.muted}>
                {status.error || 'Operating normally'}
              </Text>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
