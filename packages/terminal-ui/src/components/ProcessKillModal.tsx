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
      borderStyle="round"
      borderColor={theme.danger}
      paddingX={2}
      paddingY={1}
      width={70}
    >
      <Box justifyContent="center" marginBottom={1}>
        <Text bold color={theme.danger}>
          ⚠ TERMINATE PROCESS CONFIRMATION
        </Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text>Are you sure you want to terminate this process?</Text>
        <Box marginY={0}>
          <Text bold color={theme.accent}>
            {process.name} <Text color={theme.muted}>(PID: {process.pid})</Text>
          </Text>
        </Box>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text>
          <Text bold color={theme.warning}>
            [y]
          </Text>{' '}
          Graceful termination (SIGTERM / Win32 close)
        </Text>
        <Text>
          <Text bold color={theme.danger}>
            [Y / Shift+Y]
          </Text>{' '}
          Force termination (SIGKILL / Win32 TerminateProcess)
        </Text>
        <Text>
          <Text bold color={theme.primary}>
            [n / Esc]
          </Text>{' '}
          Cancel and return to process list
        </Text>
      </Box>
    </Box>
  );
};
