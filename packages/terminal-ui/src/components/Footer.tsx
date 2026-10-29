import React from 'react';
import { Box, Text } from 'ink';
import { ColorTheme } from '../theme/theme.js';
import { ViewId } from '../navigation/views.js';

interface Props {
  theme: ColorTheme;
  activeView: ViewId;
  searchMode: boolean;
  searchQuery: string;
}

export const Footer: React.FC<Props> = ({ theme, activeView, searchMode, searchQuery }) => {
  if (searchMode) {
    return (
      <Box
        borderStyle="single"
        borderColor={theme.primary}
        paddingX={1}
        justifyContent="space-between"
      >
        <Box>
          <Text bold color={theme.primary}>
            SEARCH:{' '}
          </Text>
          <Text color={theme.accent}>{searchQuery}</Text>
          <Text color={theme.primary}>█</Text>
        </Box>
        <Box>
          <Text color={theme.muted}>[Esc] Clear/Exit [Enter] Confirm</Text>
        </Box>
      </Box>
    );
  }

  const isProcessView = activeView === ViewId.PROCESSES;

  return (
    <Box
      borderStyle="single"
      borderColor={theme.border}
      paddingX={1}
      justifyContent="space-between"
    >
      <Box flexWrap="wrap">
        <Text color={theme.muted}>
          <Text bold color={theme.secondary}>
            [1-0]
          </Text>{' '}
          Views{' '}
          {isProcessView && (
            <>
              <Text bold color={theme.secondary}>
                [↑/↓]
              </Text>{' '}
              Select{' '}
              <Text bold color={theme.secondary}>
                [Enter]
              </Text>{' '}
              Details{' '}
              <Text bold color={theme.secondary}>
                [s]
              </Text>{' '}
              Sort{' '}
              <Text bold color={theme.secondary}>
                [/]
              </Text>{' '}
              Filter{' '}
              <Text bold color={theme.danger}>
                [k]
              </Text>{' '}
              Terminate{' '}
            </>
          )}
          <Text bold color={theme.secondary}>
            [p]
          </Text>{' '}
          Pause{' '}
          <Text bold color={theme.secondary}>
            [r]
          </Text>{' '}
          Refresh{' '}
          <Text bold color={theme.secondary}>
            [?]
          </Text>{' '}
          Help{' '}
          <Text bold color={theme.danger}>
            [q]
          </Text>{' '}
          Quit
        </Text>
      </Box>
      <Box>
        <Text color={theme.muted}>TaskPulse v0.1.0</Text>
      </Box>
    </Box>
  );
};
