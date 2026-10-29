import React from 'react';
import { Box, Text } from 'ink';
import { HardwareMetrics } from '@taskpulse/core';
import { ColorTheme } from '../theme/theme.js';
import { formatTemperature } from '@taskpulse/shared';

interface Props {
  hardware: HardwareMetrics;
  theme: ColorTheme;
}

export const HardwareView: React.FC<Props> = ({ hardware, theme }) => {
  const pkgTemp =
    hardware.cpuPackageTemp.status === 'available' ? hardware.cpuPackageTemp.value : undefined;

  return (
    <Box flexDirection="column" paddingX={1}>
      {/* CPU Thermal Card */}
      <Box
        borderStyle="single"
        borderColor={theme.border}
        paddingX={1}
        marginBottom={1}
        flexDirection="column"
      >
        <Box justifyContent="space-between" marginBottom={1}>
          <Text bold color={theme.primary}>
            CPU THERMAL PACKAGE
          </Text>
          <Text color={theme.muted}>
            Package Sensor:{' '}
            <Text bold color={pkgTemp && pkgTemp > 75 ? theme.danger : theme.success}>
              {formatTemperature(pkgTemp)}
            </Text>
          </Text>
        </Box>

        {hardware.cpuCoreTemps.length > 0 ? (
          <Box flexWrap="wrap">
            {hardware.cpuCoreTemps.map((c) => (
              <Box key={c.id} width="25%" marginBottom={1}>
                <Text color={theme.accent}>{c.label}: </Text>
                <Text bold color={c.currentCelsius > 75 ? theme.danger : theme.primary}>
                  {formatTemperature(c.currentCelsius)}
                </Text>
              </Box>
            ))}
          </Box>
        ) : (
          <Text color={theme.muted}>
            Per-core thermal sensors: Not reported by motherboard driver.
          </Text>
        )}
      </Box>

      {/* Fan Speeds & Cooling */}
      <Box
        borderStyle="single"
        borderColor={theme.border}
        paddingX={1}
        marginBottom={1}
        flexDirection="column"
      >
        <Box marginBottom={1}>
          <Text bold color={theme.primary}>
            COOLING FANS & TACHOMETERS ({hardware.fans.length} detected)
          </Text>
        </Box>
        {hardware.fans.length > 0 ? (
          <Box flexWrap="wrap">
            {hardware.fans.map((f) => (
              <Box key={f.id} width="33%">
                <Text color={theme.accent}>{f.label}: </Text>
                <Text bold color={theme.secondary}>
                  {f.rpm} RPM
                </Text>
              </Box>
            ))}
          </Box>
        ) : (
          <Text color={theme.muted}>
            Fan tachometer readings require vendor-specific kernel driver (e.g. WinRing0,
            OpenHardwareMonitor).
          </Text>
        )}
      </Box>

      {/* Power & Voltages */}
      <Box
        borderStyle="single"
        borderColor={theme.border}
        paddingX={1}
        marginBottom={1}
        flexDirection="column"
      >
        <Box marginBottom={1}>
          <Text bold color={theme.primary}>
            VOLTAGE & POWER SENSORS
          </Text>
        </Box>
        <Box justifyContent="space-between">
          <Box flexDirection="column" width="50%">
            <Text bold color={theme.accent}>
              Voltages:
            </Text>
            {hardware.voltages.length > 0 ? (
              hardware.voltages.map((v) => (
                <Text key={v.id}>
                  {v.label}: {v.volts.toFixed(2)} V
                </Text>
              ))
            ) : (
              <Text color={theme.muted}>None reported</Text>
            )}
          </Box>
          <Box flexDirection="column" width="50%">
            <Text bold color={theme.accent}>
              Power Consumption:
            </Text>
            {hardware.powers.length > 0 ? (
              hardware.powers.map((p) => (
                <Text key={p.id}>
                  {p.label}: {p.watts.toFixed(1)} W
                </Text>
              ))
            ) : (
              <Text color={theme.muted}>None reported</Text>
            )}
          </Box>
        </Box>
      </Box>

      {/* Driver / Privileges Note */}
      <Box borderStyle="single" borderColor={theme.border} paddingX={1}>
        <Text color={theme.muted}>
          <Text bold color={theme.warning}>
            Note on Hardware Sensors:{' '}
          </Text>
          Accessing motherboard thermal chips and fan controllers on Windows requires running the
          terminal with Administrator privileges or installing vendor motherboard utilities.
        </Text>
      </Box>
    </Box>
  );
};
