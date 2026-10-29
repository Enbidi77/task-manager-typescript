import React from 'react';
import { Box, Text } from 'ink';
import { ColorTheme } from '../theme/theme.js';
import { ProcessMetrics } from '@taskpulse/core';

interface Props {
  process: ProcessMetrics;
  theme: ColorTheme;
}

export const ProcessKillModal: React.FC<Props> = ({ process, theme }) => {
  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor={theme.danger}
      paddingX={2}
      paddingY={1}
      width={60}
    >
      <Box justifyContent="center" marginBottom={1}>
        <Text bold color={theme.danger}>
          TERMINATE PROCESS CONFIRMATION
        </Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text>Are you sure you want to terminate:</Text>
        <Text bold color={theme.accent}>
          {process.name} <Text color={theme.muted}>(PID: {process.pid})</Text>
        </Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text>
          <Text bold color={theme.warning}>
            [y]
          </Text>{' '}
          Graceful termination (SIGTERM)
        </Text>
        <Text>
          <Text bold color={theme.danger}>
            [Y / Shift+Y]
          </Text>{' '}
          Force termination (SIGKILL / /F)
        </Text>
        <Text>
          <Text bold color={theme.primary}>
            [n / Esc]
          </Text>{' '}
          Cancel
        </Text>
      </Box>
    </Box>
  );
};
