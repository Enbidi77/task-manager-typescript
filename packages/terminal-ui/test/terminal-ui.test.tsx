import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import {
  Header,
  Footer,
  ProgressBar,
  Sparkline,
  OverviewView,
  ProcessesView,
  ViewId,
  getTheme,
} from '../src/index.js';
import { createMockSnapshot } from '@taskpulse/testing';

describe('Terminal UI Components', () => {
  const theme = getTheme('dark');

  it('renders Header with hostname and views', () => {
    const { lastFrame } = render(
      <Header
        activeView={ViewId.OVERVIEW}
        theme={theme}
        uptimeSeconds={3600}
        isPaused={false}
        hostname="TEST-HOST"
      />,
    );

    const frame = lastFrame() || '';
    expect(frame).toContain('TASKPULSE');
    expect(frame).toContain('TEST-HOST');
    expect(frame).toContain('[1] Overview');
    expect(frame).toContain('● LIVE');
  });

  it('renders Footer with key shortcuts', () => {
    const { lastFrame } = render(
      <Footer theme={theme} activeView={ViewId.OVERVIEW} searchMode={false} searchQuery="" />,
    );

    const frame = lastFrame() || '';
    expect(frame).toContain('[1-0]');
    expect(frame).toContain('[?] Help');
    expect(frame).toContain('[q] Quit');
  });

  it('renders ProgressBar with filled blocks', () => {
    const { lastFrame } = render(<ProgressBar percent={50} width={10} theme={theme} />);

    const frame = lastFrame() || '';
    expect(frame).toContain('█████░░░░░');
    expect(frame).toContain('50.0%');
  });

  it('renders Sparkline with unicode ticks', () => {
    const { lastFrame } = render(
      <Sparkline values={[10, 20, 50, 80, 100]} length={5} theme={theme} label="CPU" />,
    );

    const frame = lastFrame() || '';
    expect(frame).toContain('CPU:');
  });

  it('renders OverviewView with system snapshot', async () => {
    const snapshot = await createMockSnapshot();
    const { lastFrame } = render(
      <OverviewView
        snapshot={snapshot}
        cpuHistory={[10, 20, 30]}
        memoryHistory={[50, 60, 70]}
        diskHistory={[5, 10, 15]}
        networkHistory={[100, 200, 300]}
        theme={theme}
      />,
    );

    const frame = lastFrame() || '';
    expect(frame).toContain('CPU UTILIZATION');
    expect(frame).toContain('MEMORY (RAM)');
    expect(frame).toContain('STORAGE & DISK I/O');
    expect(frame).toContain('NETWORK ACTIVITY');
  });

  it('renders ProcessesView with process table and search filtering', async () => {
    const snapshot = await createMockSnapshot();
    const { lastFrame } = render(
      <ProcessesView
        processes={snapshot.processes}
        selectedIndex={0}
        sortField="cpu"
        sortDirection="desc"
        searchQuery="node"
        theme={theme}
      />,
    );

    const frame = lastFrame() || '';
    expect(frame).toContain('PROCESS EXPLORER');
    expect(frame).toContain('node.exe');
  });
});
