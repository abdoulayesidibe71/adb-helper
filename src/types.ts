// src/types.ts

// Type pour les coordonnées de l'écran
 export interface Coordinates {
  x: number;
  y: number;
}

// Type pour les retours des commandes ADB
export type ADBResponse = string; // L'exécution d'une commande retourne généralement un texte

// Type pour la hiérarchie de l'écran (extrait via `uiautomator dump`)
export interface UIHierarchy {
  resourceId?: string;
  clickable?: boolean;
  text?: string;
  class?: string;
  package?: string;
  bounds?: string;
  [key: string]: any; // Permet d'ajouter d'autres attributs dynamiquement
}

// Enum pour les erreurs ADB courantes
export enum ADBError {
  DEVICE_NOT_FOUND = "Device not found",
  COMMAND_FAILED = "Command execution failed"
}

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