import React from 'react';
import { Box, Text } from 'ink';
import { GpuMetrics } from '@taskpulse/core';
import { ColorTheme } from '../theme/theme.js';
import { ProgressBar } from '../components/ProgressBar.js';
import { Sparkline } from '../components/Sparkline.js';
import { formatBytes, formatTemperature } from '@taskpulse/shared';

interface Props {
  gpu: GpuMetrics;
  history: number[];
  theme: ColorTheme;
}

export const GpuView: React.FC<Props> = ({ gpu, history, theme }) => {
  return (
    <Box flexDirection="column" paddingX={1}>
      {/* Overview Card */}
      <Box
        borderStyle="single"
        borderColor={theme.border}
        paddingX={1}
        marginBottom={1}
        flexDirection="column"
      >
        <Box justifyContent="space-between">
          <Text bold color={theme.primary}>
            GRAPHICS SUBSYSTEM
          </Text>
          <Text color={theme.muted}>Detected GPUs: {gpu.devices.length}</Text>
        </Box>
        <Box marginTop={1}>
          <Sparkline
            values={history}
            length={50}
            theme={theme}
            color={theme.primary}
            label="GPU 0 Compute Load"
          />
        </Box>
      </Box>

      {/* GPU Devices */}
      {gpu.devices.length === 0 ? (
        <Box borderStyle="single" borderColor={theme.border} paddingX={1}>
          <Text color={theme.muted}>No discrete or supported GPU adapters detected.</Text>
        </Box>
      ) : (
        gpu.devices.map((dev) => {
          const util = dev.utilization.status === 'available' ? dev.utilization.value : null;
          const temp =
            dev.temperatureCelsius.status === 'available'
              ? dev.temperatureCelsius.value
              : undefined;
          const clock =
            dev.clockSpeedMHz.status === 'available' ? `${dev.clockSpeedMHz.value} MHz` : 'N/A';
          const power =
            dev.powerWatts.status === 'available' ? `${dev.powerWatts.value.toFixed(1)} W` : 'N/A';
          const fan =
            dev.fanSpeedPercent.status === 'available' ? `${dev.fanSpeedPercent.value}%` : 'N/A';

          return (
            <Box
              key={dev.id}
              borderStyle="single"
              borderColor={theme.border}
              paddingX={1}
              marginBottom={1}
              flexDirection="column"
            >
              <Box justifyContent="space-between" marginBottom={1}>
                <Box>
                  <Text bold color={theme.accent}>
                    {dev.name}
                  </Text>
                  <Text color={theme.muted}> ({dev.vendor})</Text>
                </Box>
                <Text color={theme.muted}>Driver: {dev.driverVersion || 'Generic/Standard'}</Text>
              </Box>

              <Box justifyContent="space-between" marginBottom={1}>
                <Box>
                  <Text color={theme.muted}>Compute Load: </Text>
                  {util !== null ? (
                    <ProgressBar percent={util} width={24} theme={theme} />
                  ) : (
                    <Text color={theme.muted}>N/A ({dev.utilization.status})</Text>
                  )}
                </Box>
                {dev.memoryTotalBytes && dev.memoryUsedBytes ? (
                  <Box>
                    <Text color={theme.muted}>VRAM: </Text>
                    <ProgressBar
                      percent={(dev.memoryUsedBytes / dev.memoryTotalBytes) * 100}
                      width={20}
                      theme={theme}
                    />
                  </Box>
                ) : null}
              </Box>

              <Box justifyContent="space-between">
                <Text color={theme.muted}>
                  Temperature:{' '}
                  <Text bold color={temp && temp > 80 ? theme.danger : theme.primary}>
                    {formatTemperature(temp)}
                  </Text>
                </Text>
                <Text color={theme.muted}>
                  Clock Speed: <Text color={theme.accent}>{clock}</Text>
                </Text>
                <Text color={theme.muted}>
                  Power: <Text color={theme.warning}>{power}</Text>
                </Text>
                <Text color={theme.muted}>
                  Fan: <Text color={theme.secondary}>{fan}</Text>
                </Text>
                {dev.memoryTotalBytes ? (
                  <Text color={theme.muted}>
                    Total VRAM:{' '}
                    <Text bold color={theme.primary}>
                      {formatBytes(dev.memoryTotalBytes)}
                    </Text>
                  </Text>
                ) : null}
              </Box>
            </Box>
          );
        })
      )}
    </Box>
  );
};
