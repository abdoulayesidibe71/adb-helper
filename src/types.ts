// src/types.ts

// Type for screen coordinates
export interface Coordinates {
  x: number;
  y: number;
}

// Type for ADB command responses
export type ADBResponse = string; // Executing a command typically returns a text output

// Type for the screen hierarchy (retrieved via `uiautomator dump`)
export interface UIHierarchy {
  resourceId?: string;
  clickable?: boolean;
  text?: string;
  class?: string;
  package?: string;
  bounds?: string;
  [key: string]: any; // Allows dynamically adding other attributes
}

// Enum for common ADB errors
export enum ADBError {
  DEVICE_NOT_FOUND = "Device not found",
  COMMAND_FAILED = "Command execution failed"
}

// Enum for key codes used in ADB commands
export enum KeyCode {
  BACK = '4',
  HOME = '3',
  ENTER = '66',
  MENU = '82',
  VOLUME_UP = '24',
  VOLUME_DOWN = '25',
  POWER = '26',
  SEARCH = '84',
  CAMERA = '27',
  CALL = '5',
  END_CALL = '6',
  DEL = '67',
  SPACE = '62',
  BACKSPACE = '67',
  ESC = '111',
  RIGHT = '22',
  LEFT = '21',
  UP = '19',
  DOWN = '20',
  SELECT = '23',
}
