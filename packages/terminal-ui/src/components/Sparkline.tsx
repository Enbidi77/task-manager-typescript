import React from 'react';
import { Box, Text } from 'ink';
import { renderSparkline } from '@taskpulse/shared';
import { ColorTheme } from '../theme/theme.js';

interface Props {
  values: number[];
  length?: number;
  min?: number;
  max?: number;
  theme: ColorTheme;
  color?: string;
  label?: string;
}

export const Sparkline: React.FC<Props> = ({
  values,
  length = 20,
  min = 0,
  max = 100,
  theme,
  color,
  label,
}) => {
  const line = renderSparkline(values, { min, max, length });
  const sparkColor = color || theme.primary;

  return (
    <Box>
      {label && <Text color={theme.muted}>{label}: </Text>}
      <Text color={sparkColor}>{line}</Text>
    </Box>
  );
};
