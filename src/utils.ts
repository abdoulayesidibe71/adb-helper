import { exec } from 'child_process';

import {
  ADBError,
  ADBResponse,
} from './types';

export function ADBShell(command: string): Promise<ADBResponse> {
  console.log(command)
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`${ADBError.COMMAND_FAILED}: ${stderr || error.message}`);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}
export function getBatteryStatusString(statusCode: number): string {
  switch (statusCode) {
    case 1:
      return 'Not charging';
    case 2:
      return 'Charging';
    case 3:
      return 'Discharging';
    case 4:
      return 'Not charging';
    case 5:
      return 'Full';
    default:
      return 'Unknown';
  }
}
export function getChargeStatus(pluggedCode: number): string {
  switch (pluggedCode) {
    case 1:
      return 'USB';
    case 2:
      return 'AC';
    case 3:
      return 'Wireless';
    default:
      return 'Not plugged';
  }
}