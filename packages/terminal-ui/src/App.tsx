import React, { useState, useEffect } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import {
  ProcessMetrics,
  ProcessSortDirection,
  ProcessSortField,
  SystemSnapshot,
} from '@taskpulse/core';
import { SamplingCoordinator } from '@taskpulse/monitoring';
import { AppConfig } from '@taskpulse/config';
import { ColorTheme, getTheme } from './theme/theme.js';
import { ViewId } from './navigation/views.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { HelpModal } from './components/HelpModal.js';
import { ProcessKillModal } from './components/ProcessKillModal.js';
import { ProcessDetailsModal } from './components/ProcessDetailsModal.js';

// Views
import { OverviewView } from './views/OverviewView.js';
import { ProcessesView } from './views/ProcessesView.js';
import { CpuView } from './views/CpuView.js';
import { MemoryView } from './views/MemoryView.js';
import { DisksView } from './views/DisksView.js';
import { NetworkView } from './views/NetworkView.js';
import { GpuView } from './views/GpuView.js';
import { HardwareView } from './views/HardwareView.js';
import { AlertsView } from './views/AlertsView.js';
import { SettingsView } from './views/SettingsView.js';

export interface AppProps {
  coordinator: SamplingCoordinator;
  config: AppConfig;
}

export const App: React.FC<AppProps> = ({ coordinator, config }) => {
  const { exit } = useApp();
  const theme: ColorTheme = getTheme(config.ui.theme);

  const [snapshot, setSnapshot] = useState<SystemSnapshot | null>(coordinator.getLatestSnapshot());
  const [activeView, setActiveView] = useState<ViewId>(ViewId.OVERVIEW);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [searchMode, setSearchMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProcIdx, setSelectedProcIdx] = useState<number>(0);
  const [procForDetails, setProcForDetails] = useState<ProcessMetrics | null>(null);
  const [procForKill, setProcForKill] = useState<ProcessMetrics | null>(null);
  const [sortField, setSortField] = useState<ProcessSortField>('cpu');
  const [sortDirection, setSortDirection] = useState<ProcessSortDirection>('desc');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(coordinator.isPaused());

  // Subscribe to snapshots
  useEffect(() => {
    const unsub = coordinator.onSnapshot((newSnap) => {
      setSnapshot(newSnap);
    });
    return () => unsub();
  }, [coordinator]);

  // Notice timeout
  useEffect(() => {
    if (statusNotice) {
      const timer = setTimeout(() => setStatusNotice(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [statusNotice]);

  // Keyboard navigation & controls
  useInput((input, key) => {
    // 1. If Kill confirmation modal is open
    if (procForKill) {
      if (input === 'y' && !key.shift) {
        // Graceful kill
        const procMonitor = coordinator.getCollectorPool().getProcessMonitor();
        if (procMonitor) {
          procMonitor
            .terminateProcess(procForKill.pid, false)
            .then(() => setStatusNotice(`Terminated process ${procForKill.pid} gracefully`))
            .catch((err) => setStatusNotice(`Failed to terminate: ${err.message}`));
        }
        setProcForKill(null);
      } else if (input === 'Y' || (input === 'y' && key.shift)) {
        // Force kill
        const procMonitor = coordinator.getCollectorPool().getProcessMonitor();
        if (procMonitor) {
          procMonitor
            .terminateProcess(procForKill.pid, true)
            .then(() => setStatusNotice(`Force killed process ${procForKill.pid}`))
            .catch((err) => setStatusNotice(`Failed to force kill: ${err.message}`));
        }
        setProcForKill(null);
      } else if (input === 'n' || key.escape) {
        setProcForKill(null);
      }
      return;
    }

    // 2. If Details modal is open
    if (procForDetails) {
      if (key.escape || key.return) {
        setProcForDetails(null);
      }
      return;
    }

    // 3. If Help modal is open
    if (showHelp) {
      if (input === '?' || key.escape) {
        setShowHelp(false);
      }
      return;
    }

    // 4. If Search mode is active
    if (searchMode) {
      if (key.escape) {
        setSearchMode(false);
        setSearchQuery('');
      } else if (key.return) {
        setSearchMode(false);
      } else if (key.backspace || key.delete) {
        setSearchQuery((q) => q.slice(0, -1));
      } else if (input && !key.ctrl && !key.meta) {
        setSearchQuery((q) => q + input);
      }
      return;
    }

    // 5. Normal View Controls
    if (input === 'q' || (key.ctrl && input === 'c')) {
      exit();
      return;
    }

    if (input === '?') {
      setShowHelp(true);
      return;
    }

    if (input === 'p') {
      if (coordinator.isPaused()) {
        coordinator.resume();
        setIsPaused(false);
        setStatusNotice('Sampling resumed');
      } else {
        coordinator.pause();
        setIsPaused(true);
        setStatusNotice('Sampling paused');
      }
      return;
    }

    if (input === 'r') {
      coordinator.forceSample().then(() => setStatusNotice('Metrics refreshed'));
      return;
    }

    // View switching keys 1-9, 0
    if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].includes(input)) {
      setActiveView(input as ViewId);
      return;
    }

    // Processes view specific shortcuts
    if (activeView === ViewId.PROCESSES && snapshot) {
      if (key.upArrow) {
        setSelectedProcIdx((idx) => Math.max(0, idx - 1));
      } else if (key.downArrow) {
        setSelectedProcIdx((idx) => Math.min(snapshot.processes.length - 1, idx + 1));
      } else if (input === '/') {
        setSearchMode(true);
      } else if (input === 's') {
        const fields: ProcessSortField[] = ['cpu', 'memory', 'pid', 'name', 'threads'];
        const nextIdx = (fields.indexOf(sortField) + 1) % fields.length;
        setSortField(fields[nextIdx]);
        setStatusNotice(`Sorted by ${fields[nextIdx].toUpperCase()}`);
      } else if (input === 'S') {
        setSortDirection((dir) => (dir === 'asc' ? 'desc' : 'asc'));
        setStatusNotice('Toggled sort direction');
      } else if (key.return) {
        const proc = snapshot.processes[selectedProcIdx];
        if (proc) setProcForDetails(proc);
      } else if (input === 'k') {
        const proc = snapshot.processes[selectedProcIdx];
        if (proc) setProcForKill(proc);
      }
    }
  });

  if (!snapshot) {
    return (
      <Box padding={2}>
        <Text color={theme.primary}>Initializing TaskPulse metric collectors...</Text>
      </Box>
    );
  }

  const history = coordinator.getHistory();
  const cpuHistory = history.getCpuHistory(60).map((p) => p.value);
  const memHistory = history.getMemoryHistory(60).map((p) => p.value);
  const diskHistory = history
    .getDiskIoHistory(60)
    .map((p) => p.value.readBytesSec + p.value.writeBytesSec);
  const netHistory = history
    .getNetworkHistory(60)
    .map((p) => p.value.rxBytesSec + p.value.txBytesSec);
  const gpuHistory = history.getGpuHistory(60).map((p) => p.value);

  return (
    <Box flexDirection="column" paddingX={1}>
      {/* Top Header */}
      <Header
        activeView={activeView}
        theme={theme}
        uptimeSeconds={snapshot.os.uptimeSeconds}
        isPaused={isPaused}
        hostname={snapshot.os.hostname}
      />

      {/* Status Notice Toast */}
      {statusNotice && (
        <Box paddingX={1} borderStyle="single" borderColor={theme.accent}>
          <Text bold color={theme.accent}>
            ℹ {statusNotice}
          </Text>
        </Box>
      )}

      {/* Main View Area */}
      <Box marginY={0}>
        {activeView === ViewId.OVERVIEW && (
          <OverviewView
            snapshot={snapshot}
            cpuHistory={cpuHistory}
            memoryHistory={memHistory}
            diskHistory={diskHistory}
            networkHistory={netHistory}
            theme={theme}
          />
        )}

        {activeView === ViewId.PROCESSES && (
          <ProcessesView
            processes={snapshot.processes}
            selectedIndex={selectedProcIdx}
            sortField={sortField}
            sortDirection={sortDirection}
            searchQuery={searchQuery}
            theme={theme}
          />
        )}

        {activeView === ViewId.CPU && (
          <CpuView
            cpu={snapshot.cpu}
            history={cpuHistory}
            topProcesses={snapshot.processes}
            theme={theme}
          />
        )}

        {activeView === ViewId.MEMORY && (
          <MemoryView
            memory={snapshot.memory}
            history={memHistory}
            topProcesses={snapshot.processes}
            theme={theme}
          />
        )}

        {activeView === ViewId.DISKS && (
          <DisksView disk={snapshot.disk} history={diskHistory} theme={theme} />
        )}

        {activeView === ViewId.NETWORK && (
          <NetworkView network={snapshot.network} history={netHistory} theme={theme} />
        )}

        {activeView === ViewId.GPU && (
          <GpuView gpu={snapshot.gpu} history={gpuHistory} theme={theme} />
        )}

        {activeView === ViewId.HARDWARE && (
          <HardwareView hardware={snapshot.hardware} theme={theme} />
        )}

        {activeView === ViewId.ALERTS && (
          <AlertsView
            rules={coordinator.getAlertService().getRules()}
            activeIncidents={coordinator.getAlertService().getActiveIncidents()}
            incidentHistory={coordinator.getAlertService().getIncidentHistory()}
            theme={theme}
          />
        )}

        {activeView === ViewId.SETTINGS && (
          <SettingsView config={config} providerStatus={snapshot.providerStatus} theme={theme} />
        )}
      </Box>

      {/* Modal Overlays */}
      {showHelp && (
        <Box position="absolute" marginTop={3} marginLeft={4}>
          <HelpModal theme={theme} onClose={() => setShowHelp(false)} />
        </Box>
      )}

      {procForKill && (
        <Box position="absolute" marginTop={5} marginLeft={8}>
          <ProcessKillModal process={procForKill} theme={theme} />
        </Box>
      )}

      {procForDetails && (
        <Box position="absolute" marginTop={3} marginLeft={4}>
          <ProcessDetailsModal process={procForDetails} theme={theme} />
        </Box>
      )}

      {/* Footer Keybindings */}
      <Footer
        theme={theme}
        activeView={activeView}
        searchMode={searchMode}
        searchQuery={searchQuery}
      />
    </Box>
  );
};
