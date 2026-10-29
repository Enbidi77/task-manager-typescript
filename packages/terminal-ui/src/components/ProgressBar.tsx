import React from 'react';
import { Box, Text } from 'ink';
import { renderProgressBar } from '@taskpulse/shared';
import { ColorTheme } from '../theme/theme.js';

interface Props {
  percent: number;
  width?: number;
  theme: ColorTheme;
  showPercentText?: boolean;
}

export const ProgressBar: React.FC<Props> = ({
  percent,
  width = 16,
  theme,
  showPercentText = true,
}) => {
  const safePercent = Math.max(0, Math.min(100, percent));
  const bar = renderProgressBar(safePercent, width);

  let color = theme.success;
  if (safePercent >= 85) {
    color = theme.danger;
  } else if (safePercent >= 70) {
    color = theme.warning;
  }

  return (
    <Box>
      <Text color={color}>{bar}</Text>
      {showPercentText && <Text color={color}> {safePercent.toFixed(1).padStart(5)}%</Text>}
    </Box>
  );
};
