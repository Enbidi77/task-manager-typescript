import React from 'react';
import { Box, Text } from 'ink';
import { ColorTheme } from '../theme/theme.js';

interface Props {
  theme: ColorTheme;
  onClose: () => void;
}

export const HelpModal: React.FC<Props> = ({ theme }) => {
  return (
    <Box
      flexDirection="column"
      borderStyle="double"
      borderColor={theme.primary}
      paddingX={2}
      paddingY={1}
      width={72}
    >
      <Box justifyContent="center" marginBottom={1}>
        <Text bold color={theme.primary}>
          TASKPULSE — KEYBOARD SHORTCUTS & HELP
        </Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold color={theme.accent}>
          Navigation:
        </Text>
        <Text>
          {' '}
          <Text bold color={theme.secondary}>
            1 - 9, 0
          </Text>{' '}
          Switch directly between Views (1:Overview .. 0:Settings)
        </Text>
        <Text>
          {' '}
          <Text bold color={theme.secondary}>
            Tab
          </Text>{' '}
          Cycle through interactive regions
        </Text>
        <Text>
          {' '}
          <Text bold color={theme.secondary}>
            ↑ / ↓
          </Text>{' '}
          Navigate process list / table rows
        </Text>
        <Text>
          {' '}
          <Text bold color={theme.secondary}>
            Enter
          </Text>{' '}
          View details for selected process
        </Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold color={theme.accent}>
          Actions & Controls:
        </Text>
        <Text>
          {' '}
          <Text bold color={theme.secondary}>
            /
          </Text>{' '}
          Filter/Search processes by name or PID
        </Text>
        <Text>
          {' '}
          <Text bold color={theme.secondary}>
            s
          </Text>{' '}
          Cycle sorting column (CPU, Memory, Handles, Threads, PID, Name)
        </Text>
        <Text>
          {' '}
          <Text bold color={theme.secondary}>
            h
          </Text>{' '}
          Sort processes immediately by Open Handles
        </Text>
        <Text>
          {' '}
          <Text bold color={theme.secondary}>
            k
          </Text>{' '}
          Kill / Terminate selected process (fast Win32 FFI / taskkill)
        </Text>
        <Text>
          {' '}
          <Text bold color={theme.secondary}>
            p
          </Text>{' '}
          Pause / Resume metric sampling
        </Text>
        <Text>
          {' '}
          <Text bold color={theme.secondary}>
            r
          </Text>{' '}
          Force immediate refresh
        </Text>
        <Text>
          {' '}
          <Text bold color={theme.secondary}>
            ?
          </Text>{' '}
          Toggle this Help screen
        </Text>
        <Text>
          {' '}
          <Text bold color={theme.danger}>
            q / Ctrl+C
          </Text>{' '}
          Exit TaskPulse
        </Text>
      </Box>

      <Box justifyContent="center">
        <Text color={theme.muted}>
          Press{' '}
          <Text bold color={theme.primary}>
            [?]
          </Text>{' '}
          or{' '}
          <Text bold color={theme.primary}>
            [Esc]
          </Text>{' '}
          to close this help
        </Text>
      </Box>
    </Box>
  );
};
