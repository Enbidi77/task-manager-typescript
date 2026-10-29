import React from 'react';
import { Box, Text } from 'ink';
import { AlertIncident, AlertRule } from '@taskpulse/core';
import { ColorTheme } from '../theme/theme.js';

interface Props {
  rules: AlertRule[];
  activeIncidents: AlertIncident[];
  incidentHistory: AlertIncident[];
  theme: ColorTheme;
}

export const AlertsView: React.FC<Props> = ({ rules, activeIncidents, incidentHistory, theme }) => {
  return (
    <Box flexDirection="column" paddingX={1}>
      {/* Active Incidents Banner */}
      <Box
        borderStyle="single"
        borderColor={theme.border}
        paddingX={1}
        marginBottom={1}
        flexDirection="column"
      >
        <Box justifyContent="space-between" marginBottom={1}>
          <Text bold color={theme.primary}>
            ACTIVE SYSTEM INCIDENTS
          </Text>
          <Text color={theme.muted}>
            Count:{' '}
            <Text bold color={activeIncidents.length > 0 ? theme.danger : theme.success}>
              {activeIncidents.length}
            </Text>
          </Text>
        </Box>

        {activeIncidents.length === 0 ? (
          <Text color={theme.success}>✓ All systems operating within normal parameters.</Text>
        ) : (
          activeIncidents.map((inc) => (
            <Box key={inc.id} justifyContent="space-between" marginY={0}>
              <Box>
                <Text bold color={inc.severity === 'critical' ? theme.danger : theme.warning}>
                  [{inc.severity.toUpperCase()}]
                </Text>
                <Text> {inc.message}</Text>
              </Box>
              <Text color={theme.muted}>
                Triggered: {new Date(inc.triggeredAt).toLocaleTimeString()}
              </Text>
            </Box>
          ))
        )}
      </Box>

      {/* Configured Threshold Rules */}
      <Box
        borderStyle="single"
        borderColor={theme.border}
        paddingX={1}
        marginBottom={1}
        flexDirection="column"
      >
        <Box marginBottom={1}>
          <Text bold color={theme.primary}>
            CONFIGURED THRESHOLD RULES ({rules.length} rules)
          </Text>
        </Box>
        <Box borderStyle="single" borderColor={theme.border} paddingX={1} marginY={0}>
          <Box width={26}>
            <Text bold color={theme.primary}>
              Rule Name
            </Text>
          </Box>
          <Box width={20}>
            <Text bold color={theme.primary}>
              Metric Target
            </Text>
          </Box>
          <Box width={14}>
            <Text bold color={theme.primary}>
              Condition
            </Text>
          </Box>
          <Box width={12}>
            <Text bold color={theme.primary}>
              Severity
            </Text>
          </Box>
          <Box flexGrow={1}>
            <Text bold color={theme.primary}>
              Sustained Window
            </Text>
          </Box>
        </Box>
        {rules.map((rule) => (
          <Box key={rule.id} paddingX={1}>
            <Box width={26}>
              <Text bold color={theme.accent}>
                {rule.name}
              </Text>
            </Box>
            <Box width={20}>
              <Text>{rule.metric}</Text>
            </Box>
            <Box width={14}>
              <Text>
                {rule.comparison} {rule.threshold}
              </Text>
            </Box>
            <Box width={12}>
              <Text color={rule.severity === 'critical' ? theme.danger : theme.warning}>
                {rule.severity.toUpperCase()}
              </Text>
            </Box>
            <Box flexGrow={1}>
              <Text color={theme.muted}>{rule.durationSeconds}s</Text>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Incident History Log */}
      <Box borderStyle="single" borderColor={theme.border} paddingX={1} flexDirection="column">
        <Box marginBottom={1}>
          <Text bold color={theme.primary}>
            RECENT INCIDENT AUDIT TRAIL
          </Text>
        </Box>
        {incidentHistory.length === 0 ? (
          <Text color={theme.muted}>No past incidents recorded in this session.</Text>
        ) : (
          incidentHistory.slice(0, 5).map((inc) => (
            <Box key={inc.id} justifyContent="space-between">
              <Text>
                <Text color={inc.severity === 'critical' ? theme.danger : theme.warning}>
                  [{inc.severity.toUpperCase()}]
                </Text>{' '}
                {inc.message}
              </Text>
              <Text color={theme.muted}>
                {new Date(inc.triggeredAt).toLocaleTimeString()}
                {inc.resolvedAt
                  ? ` (Resolved: ${new Date(inc.resolvedAt).toLocaleTimeString()})`
                  : ' (Active)'}
              </Text>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};
