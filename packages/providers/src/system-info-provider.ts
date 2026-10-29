import os from 'node:os';
import process from 'node:process';
import si from 'systeminformation';
import { ISystemInfoMonitor, OsInfo } from '@taskpulse/core';

export class SystemInfoProvider implements ISystemInfoMonitor {
  async getOsInfo(): Promise<OsInfo> {
    try {
      const osData = await si.osInfo();
      const timeData = si.time();

      return {
        platform: process.platform,
        distro: osData.distro || os.type(),
        release: osData.release || os.release(),
        arch: osData.arch || os.arch(),
        hostname: osData.hostname || os.hostname(),
        uptimeSeconds: timeData?.uptime || os.uptime(),
      };
    } catch {
      return {
        platform: process.platform,
        distro: os.type(),
        release: os.release(),
        arch: os.arch(),
        hostname: os.hostname(),
        uptimeSeconds: os.uptime(),
      };
    }
  }
}
