import React from 'react';
import { Box, Text } from 'ink';
import { VIEWS, ViewId } from '../navigation/views.js';
import { ColorTheme } from '../theme/theme.js';
import { formatDuration } from '@taskpulse/shared';

interface Props {
  activeView: ViewId;
  theme: ColorTheme;
  uptimeSeconds: number;
  isPaused: boolean;
  hostname: string;
}

export const Header: React.FC<Props> = ({
  activeView,
  theme,
  uptimeSeconds,
  isPaused,
  hostname,
}) => {
  return (
    <Box flexDirection="column" borderStyle="single" borderColor={theme.border} paddingX={1}>
      {/* Top Title & System Row */}
      <Box justifyContent="space-between">
        <Box>
          <Text bold color={theme.primary}>
            TASKPULSE
          </Text>
          <Text color={theme.muted}> | </Text>
          <Text color={theme.accent}>{hostname}</Text>
          <Text color={theme.muted}> (up {formatDuration(uptimeSeconds)})</Text>
        </Box>
        <Box>
          {isPaused ? (
            <Text bold color={theme.warning}>
              [PAUSED]
            </Text>
          ) : (
            <Text color={theme.success}>● LIVE</Text>
          )}
        </Box>
      </Box>

      {/* Tabs Row */}
      <Box marginTop={0} flexWrap="wrap">
        {VIEWS.map((v) => {
          const isActive = v.id === activeView;
          return (
            <Box key={v.id} marginRight={1}>
              <Text
                bold={isActive}
                color={isActive ? theme.primary : theme.muted}
                inverse={isActive}
              >
                [{v.key}] {v.name}
              </Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
