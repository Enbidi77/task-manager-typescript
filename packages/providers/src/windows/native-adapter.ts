import { createRequire } from 'node:module';
import { WindowsKernelMemoryMetrics, PowerStatusMetrics } from '@taskpulse/core';

// Types for Win32 API returns
export interface Win32ProcessTelemetry {
  handles?: number;
  privateWorkingSetBytes?: number;
  peakWorkingSetBytes?: number;
  pageFaults?: number;
}

interface Win32Bindings {
  getPerformanceInfo: (out: Record<string, unknown>, cb: number) => boolean;
  sizeofPerformanceInformation: number;
  getSystemPowerStatus: (out: Record<string, unknown>) => boolean;
  openProcess: (access: number, inherit: boolean, pid: number) => unknown;
  closeHandle: (handle: unknown) => boolean;
  getProcessHandleCount: (handle: unknown, out: number[]) => boolean;
  getProcessMemoryInfo: (handle: unknown, out: Record<string, unknown>, cb: number) => boolean;
  sizeofProcessMemoryCountersEx: number;
  terminateProcess: (handle: unknown, exitCode: number) => boolean;
}

const PROCESS_QUERY_LIMITED_INFORMATION = 0x1000;
const PROCESS_VM_READ = 0x0010;
const PROCESS_TERMINATE = 0x0001;

let bindings: Win32Bindings | null = null;
let initAttempted = false;

function initWin32Bindings(): Win32Bindings | null {
  if (initAttempted) return bindings;
  initAttempted = true;

  if (process.platform !== 'win32') {
    return null;
  }

  try {
    const req = createRequire(import.meta.url);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const koffi = req('koffi');

    const psapi = koffi.load('psapi.dll');
    const kernel32 = koffi.load('kernel32.dll');

    const PERFORMANCE_INFORMATION = koffi.struct('PERFORMANCE_INFORMATION', {
      cb: 'uint32_t',
      CommitTotal: 'size_t',
      CommitLimit: 'size_t',
      CommitPeak: 'size_t',
      PhysicalTotal: 'size_t',
      PhysicalAvailable: 'size_t',
      SystemCache: 'size_t',
      KernelTotal: 'size_t',
      KernelPaged: 'size_t',
      KernelNonpaged: 'size_t',
      PageSize: 'size_t',
      HandleCount: 'uint32_t',
      ProcessCount: 'uint32_t',
      ThreadCount: 'uint32_t',
    });

    koffi.struct('SYSTEM_POWER_STATUS', {
      ACLineStatus: 'uint8_t',
      BatteryFlag: 'uint8_t',
      BatteryLifePercent: 'uint8_t',
      SystemStatusFlag: 'uint8_t',
      BatteryLifeTime: 'uint32_t',
      BatteryFullLifeTime: 'uint32_t',
    });

    const PROCESS_MEMORY_COUNTERS_EX = koffi.struct('PROCESS_MEMORY_COUNTERS_EX', {
      cb: 'uint32_t',
      PageFaultCount: 'uint32_t',
      PeakWorkingSetSize: 'size_t',
      WorkingSetSize: 'size_t',
      QuotaPeakPagedPoolUsage: 'size_t',
      QuotaPagedPoolUsage: 'size_t',
      QuotaPeakNonPagedPoolUsage: 'size_t',
      QuotaNonPagedPoolUsage: 'size_t',
      PagefileUsage: 'size_t',
      PeakPagefileUsage: 'size_t',
      PrivateUsage: 'size_t',
    });

    const getPerformanceInfo = psapi.func(
      'bool __stdcall GetPerformanceInfo(_Out_ PERFORMANCE_INFORMATION *pPerformanceInformation, uint32_t cb)',
    );
    const getSystemPowerStatus = kernel32.func(
      'bool __stdcall GetSystemPowerStatus(_Out_ SYSTEM_POWER_STATUS *lpSystemPowerStatus)',
    );
    const openProcess = kernel32.func(
      'void* __stdcall OpenProcess(uint32_t dwDesiredAccess, bool bInheritHandle, uint32_t dwProcessId)',
    );
    const closeHandle = kernel32.func('bool __stdcall CloseHandle(void* hObject)');
    const getProcessHandleCount = kernel32.func(
      'bool __stdcall GetProcessHandleCount(void* hProcess, _Out_ uint32_t *pdwHandleCount)',
    );
    const getProcessMemoryInfo = psapi.func(
      'bool __stdcall GetProcessMemoryInfo(void* hProcess, _Out_ PROCESS_MEMORY_COUNTERS_EX *ppsmcex, uint32_t cb)',
    );
    const terminateProcess = kernel32.func(
      'bool __stdcall TerminateProcess(void* hProcess, uint32_t uExitCode)',
    );

    bindings = {
      getPerformanceInfo,
      sizeofPerformanceInformation: koffi.sizeof(PERFORMANCE_INFORMATION),
      getSystemPowerStatus,
      openProcess,
      closeHandle,
      getProcessHandleCount,
      getProcessMemoryInfo,
      sizeofProcessMemoryCountersEx: koffi.sizeof(PROCESS_MEMORY_COUNTERS_EX),
      terminateProcess,
    };

    return bindings;
  } catch {
    bindings = null;
    return null;
  }
}

export function isWin32NativeAvailable(): boolean {
  return initWin32Bindings() !== null;
}

export function getWin32PerformanceInfo(): WindowsKernelMemoryMetrics | null {
  const b = initWin32Bindings();
  if (!b) return null;

  try {
    const raw: Record<string, unknown> = {};
    const success = b.getPerformanceInfo(raw, b.sizeofPerformanceInformation);
    if (!success) return null;

    const pageSize = Number(raw.PageSize || 4096);
    return {
      pagedPoolBytes: Number(raw.KernelPaged || 0) * pageSize,
      nonPagedPoolBytes: Number(raw.KernelNonpaged || 0) * pageSize,
      systemCacheBytes: Number(raw.SystemCache || 0) * pageSize,
      commitPeakBytes: Number(raw.CommitPeak || 0) * pageSize,
      systemHandles: Number(raw.HandleCount || 0),
      systemThreads: Number(raw.ThreadCount || 0),
      processCount: Number(raw.ProcessCount || 0),
    };
  } catch {
    return null;
  }
}

export function getWin32PowerStatus(): PowerStatusMetrics | null {
  const b = initWin32Bindings();
  if (!b) return null;

  try {
    const raw: Record<string, unknown> = {};
    const success = b.getSystemPowerStatus(raw);
    if (!success) return null;

    const acStatus = Number(raw.ACLineStatus);
    const batteryFlag = Number(raw.BatteryFlag);
    const lifePercent = Number(raw.BatteryLifePercent);
    const lifeTimeSec = Number(raw.BatteryLifeTime);

    const isAcOnline = acStatus === 1;
    const hasBattery = batteryFlag !== 128 && lifePercent !== 255;
    const isCharging = (batteryFlag & 8) !== 0;

    let batteryPercent: number | null = null;
    if (hasBattery && lifePercent <= 100) {
      batteryPercent = lifePercent;
    }

    let batteryLifeRemainingSeconds: number | null = null;
    if (hasBattery && lifeTimeSec !== 0xffffffff && lifeTimeSec > 0) {
      batteryLifeRemainingSeconds = lifeTimeSec;
    }

    let statusDescription = 'AC Online';
    if (!hasBattery) {
      statusDescription = 'AC Power (Desktop / No battery)';
    } else if (isCharging) {
      statusDescription = `Charging (${batteryPercent ?? 0}%)`;
    } else if (isAcOnline) {
      statusDescription = `Fully Charged / Plugged in (${batteryPercent ?? 100}%)`;
    } else {
      statusDescription = `On Battery (${batteryPercent ?? 0}%)`;
    }

    return {
      isAcOnline,
      hasBattery,
      batteryPercent,
      batteryLifeRemainingSeconds,
      isCharging,
      statusDescription,
    };
  } catch {
    return null;
  }
}

export function getWin32ProcessTelemetry(pid: number): Win32ProcessTelemetry | null {
  const b = initWin32Bindings();
  if (!b || pid <= 0) return null;

  try {
    const hProc = b.openProcess(PROCESS_QUERY_LIMITED_INFORMATION | PROCESS_VM_READ, false, pid);
    if (!hProc) return null;

    try {
      const telemetry: Win32ProcessTelemetry = {};

      const handleArr = [0];
      if (b.getProcessHandleCount(hProc, handleArr)) {
        telemetry.handles = handleArr[0];
      }

      const mem: Record<string, unknown> = {};
      if (b.getProcessMemoryInfo(hProc, mem, b.sizeofProcessMemoryCountersEx)) {
        if (mem.PrivateUsage !== undefined) {
          telemetry.privateWorkingSetBytes = Number(mem.PrivateUsage);
        }
        if (mem.PeakWorkingSetSize !== undefined) {
          telemetry.peakWorkingSetBytes = Number(mem.PeakWorkingSetSize);
        }
        if (mem.PageFaultCount !== undefined) {
          telemetry.pageFaults = Number(mem.PageFaultCount);
        }
      }

      return telemetry;
    } finally {
      b.closeHandle(hProc);
    }
  } catch {
    return null;
  }
}

export function terminateWin32Process(pid: number, exitCode: number = 1): boolean {
  const b = initWin32Bindings();
  if (!b || pid <= 0) return false;

  try {
    const hProc = b.openProcess(PROCESS_TERMINATE, false, pid);
    if (!hProc) return false;

    try {
      return b.terminateProcess(hProc, exitCode);
    } finally {
      b.closeHandle(hProc);
    }
  } catch {
    return false;
  }
}
