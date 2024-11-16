import {
  ADBResponse,
  KeyCode,
  UIHierarchy,
} from './types';
import { ADBShell } from './utils';

/**
 * Class that extends CacheManagement to manage various screen-related operations for Android devices.
 * This class includes methods for taking screenshots, performing gestures, and other actions related to screen interactions.
 * It utilizes ADB commands to interact with Android devices and allows for easy management of screen-related tasks.
 * 
 * @extends CacheManagement
 * 
 * @note While this class can be used independently, it is primarily designed to be used as part of the ADBHelper class. 
 * When used within ADBHelper, it is instantiated and managed as part of the broader Android device interaction.
 * 
 * @param {string} deviceId The unique identifier for the Android device.
 * 
 * @example
 * // Using ScreenInteractions independently:
 * let deviceId = "XXXXXXXXXXXX";
 * const screenManager = new ScreenInteractions(deviceId);
 * await screenManager.takeScreenshot('/path/to/screenshot.png');
 * 
 * @example
 * // Using ScreenInteractions within ADBHelper:
 * const adbHelper = new ADBHelper("device123");
 * await adbHelper.screenInteractions.takeScreenshot('/path/to/screenshot.png');
 */
export class ScreenInteractions {
    private deviceId: string;

    constructor(deviceId: string) {
        this.deviceId = deviceId;
    }
/**
 * Simulates a tap (click) on the specified UI element based on its bounds.
 * @param element The UI element to be clicked, which should have the 'bounds' attribute.
 * @returns A promise that resolves when the tap command is executed.
 * @example
 * // Usage
 * const adbHelper = new ADBHelper("device123");
 * await adbHelper.screenInteraction.clickElement(element); // Clicks the element based on its bounds
 */
async clickElement(element: UIHierarchy): Promise<void> {
  // Check if the element has a "bounds" attribute
  if (!element.bounds) {
      console.error("Element does not have defined coordinates.");
      return;
  }

  // Extract coordinates from the "bounds" attribute (format [x1,y1][x2,y2])
  const bounds = element.bounds.match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
  if (!bounds) {
      console.error("Unable to extract coordinates from the 'bounds' attribute.");
      return;
  }

  const [, x1, y1, x2, y2] = bounds;
  const x = Math.floor((parseInt(x1, 10) + parseInt(x2, 10)) / 2); // Click in the center of the element
  const y = Math.floor((parseInt(y1, 10) + parseInt(y2, 10)) / 2);

  console.log(`Clicking on element at (${x}, ${y})`);

  // Execute ADB command to simulate a tap at these coordinates
  await this.execCommand(`adb -s ${this.deviceId} shell input tap ${x} ${y}`);
}

/**
* Simulates a tap (click) at the specified coordinates.
* @param x The x-coordinate where the tap will occur.
* @param y The y-coordinate where the tap will occur.
* @returns A promise that resolves when the tap command is executed.
* @example
* // Usage
* await adbHelper.clickAtCoordinates(500, 600); // Clicks at coordinates (500, 600)
*/
async clickAtCoordinates(x: number, y: number): Promise<void> {
  console.log(`Clicking at coordinates (${x}, ${y})`);

  // Execute ADB command to simulate a tap at these coordinates
  await this.execCommand(`adb -s ${this.deviceId} shell input tap ${x} ${y}`);
}

/**
* Simulates a long press on the specified UI element based on its bounds, with an optional duration.
* @param element The UI element to long-click, which should have the 'bounds' attribute.
* @param duration The duration of the long press in milliseconds (default is 1000ms).
* @returns A promise that resolves when the long press command is executed.
* @example
* // Usage
 * const adbHelper = new ADBHelper("device123");
 * await adbHelper.screenInteraction.longClickOnElement(element, 2000); // Long-clicks the element with a duration of 2000ms
*/
async longClickOnElement(element: UIHierarchy, duration: number = 1000): Promise<void> {
  if (!element.bounds) {
      console.log("Element does not have a 'bounds' attribute.");
      return;
  }

  const [x1, y1, x2, y2] = this.parseBounds(element.bounds);
  const x = (x1 + x2) / 2; // Use the horizontal center of the element
  const y = (y1 + y2) / 2; // Use the vertical center of the element

  console.log(`Long click on element at (${x}, ${y}) for ${duration} ms`);

  // Execute ADB command for a long click at these coordinates with the specified duration
  await this.execCommand(`adb -s ${this.deviceId} shell input swipe ${x} ${y} ${x} ${y} ${duration}`);
}

/**
* Simulates a long press at the specified coordinates, with an optional duration.
* @param x The x-coordinate where the long press will occur.
* @param y The y-coordinate where the long press will occur.
* @param duration The duration of the long press in milliseconds (default is 1000ms).
* @returns A promise that resolves when the long press command is executed.
* @example
* // Usage
 * const adbHelper = new ADBHelper("device123");
 * await adbHelper.screenInteraction.longClickAtCoordinates(500, 600, 2000); // Long-clicks at coordinates (500, 600) for 2000ms
*/
async longClickAtCoordinates(x: number, y: number, duration: number = 1000): Promise<void> {
  console.log(`Long click at coordinates (${x}, ${y}) for ${duration} ms`);

  // Execute ADB command for a long click at these coordinates with the specified duration
  await this.execCommand(`adb -s ${this.deviceId} shell input swipe ${x} ${y} ${x} ${y} ${duration}`);
}

/**
* Simulates a double-tap at the specified coordinates, with an optional interval between taps.
* @param x The x-coordinate where the double-tap will occur.
* @param y The y-coordinate where the double-tap will occur.
* @param interval The interval between the two taps in milliseconds (default is 100ms).
* @returns A promise that resolves when the double-tap command is executed.
* @example
* // Usage
 * const adbHelper = new ADBHelper("device123");
 * await adbHelper.screenInteraction.doubleTapAtCoordinates(500, 600, 150); // Double-taps at coordinates (500, 600) with a 150ms interval
*/
async doubleTapAtCoordinates(x: number, y: number, interval: number = 100): Promise<void> {
  await this.clickAtCoordinates(x, y);
  await this.delay(interval); // Delay between taps for the double-tap effect
  await this.clickAtCoordinates(x, y);
}

    // Fonction pour analyser les coordonnées de bounds (format '[x1,y1][x2,y2]')
    private parseBounds(bounds: string): number[] {
        const match = bounds.match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
        if (!match) {
            throw new Error('Format des bounds invalide');
        }
        return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), parseInt(match[4])];
    }
    ////////////////////////////////////////
 /**
 * Takes a screenshot on the Android device and saves it to the specified file path.
 * @param filePath The local path where the screenshot will be saved (e.g., '/path/to/save/screenshot.png').
 * @example
 * // Take a screenshot and save it to the specified path
 * const adbHelper = new ADBHelper("device123");
 * await adbHelper.screenInteraction.takeScreenshot('/path/to/save/screenshot.png');
 */
async takeScreenshot(filePath: string): Promise<void> {
  try {
      // Step 1: Capture a screenshot on the Android device
      const tempFilePathOnDevice = '/sdcard/DCIM/screenshot.png';
      await this.execCommand(`adb -s ${this.deviceId} shell screencap -p ${tempFilePathOnDevice}`);

      // Step 2: Check if the file exists on the Android device
      const checkFileExistence = await this.execCommand(`adb -s ${this.deviceId} shell ls ${tempFilePathOnDevice}`);
      if (!checkFileExistence) {
          throw new Error("Screenshot file does not exist on the device.");
      }

      // Step 3: Transfer the screenshot from the device to the computer
      await this.execCommand(`adb -s ${this.deviceId} pull ${tempFilePathOnDevice} ${filePath}`);

      console.log(`Screenshot successful and saved at ${filePath}`);
  } catch (error) {
      console.error("Error capturing screenshot:", error);
  }
}

/**
* Simulates a swipe gesture on the device.
* @param x1 The x-coordinate of the start point.
* @param y1 The y-coordinate of the start point.
* @param x2 The x-coordinate of the end point.
* @param y2 The y-coordinate of the end point.
* @param duration The duration of the swipe gesture in milliseconds.
* @example
* // Swipe from (100, 200) to (300, 400) with a duration of 500ms
 * const adbHelper = new ADBHelper("device123");
 * await adbHelper.screenInteraction.swipe(100, 200, 300, 400, 500);
*/
async swipe(x1: number, y1: number, x2: number, y2: number, duration: number): Promise<void> {
  await this.execCommand(`adb -s ${this.deviceId} shell input swipe ${x1} ${y1} ${x2} ${y2} ${duration}`);
}

/**
* Types the given text on the Android device.
* @param text The text to type.
* @example
* // Type the text "Hello World" on the device
 * const adbHelper = new ADBHelper("device123");
 * await adbHelper.screenInteraction.typeText("Hello World");
*/
async typeText(text: string): Promise<void> {
  await this.execCommand(`adb -s ${this.deviceId} shell input text "${text}"`);
}

/**
* Simulates pressing a key on the Android device's keyboard using a key code.
* @param keyCode The key code of the key to press.
* @example
* // Press the 'HOME' key
 * const adbHelper = new ADBHelper("device123");
 * await adbHelper.screenInteraction.pressKey(3);
*/
async pressKey(keyCode: KeyCode): Promise<void> {
  await this.execCommand(`adb -s ${this.deviceId} shell input keyevent ${keyCode}`);
}

/**
* Simulates a zoom gesture on the Android device (pinch to zoom in or spread to zoom out).
* @param x1 The x-coordinate of the first starting point.
* @param y1 The y-coordinate of the first starting point.
* @param x2 The x-coordinate of the second starting point.
* @param y2 The y-coordinate of the second starting point.
* @param zoomDirection The direction of the zoom (true for zoom in, false for zoom out).
* @param duration The duration of the zoom animation in milliseconds (default is 1000ms).
* @example
* // Perform a zoom-in gesture
* await adbHelper.zoom(100, 200, 300, 400, true);
*
* // Perform a zoom-out gesture
 * const adbHelper = new ADBHelper("device123");
 * await adbHelper.screenInteraction.zoom(100, 200, 300, 400, false);
*/
async zoom(x1: number, y1: number, x2: number, y2: number, zoomDirection: boolean, duration: number = 1000): Promise<void> {
  // Calculate new coordinates for zoom in or out
  if (zoomDirection) {
      // Zoom in: bring the two points closer together
      x1 = x1 + 50;
      y1 = y1 + 50;
      x2 = x2 - 50;
      y2 = y2 - 50;
  } else {
      // Zoom out: move the two points apart
      x1 = x1 - 50;
      y1 = y1 - 50;
      x2 = x2 + 50;
      y2 = y2 + 50;
  }

  // Execute the swipe command to simulate a pinch zoom gesture
  await this.execCommand(`adb -s ${this.deviceId} shell input swipe ${x1} ${y1} ${x2} ${y2} ${duration}`);
}
    // Fonction utilitaire pour ajouter un délai entre les actions (pour le double-tap)
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
      private async execCommand(command: string): Promise<ADBResponse> {
        return await ADBShell(command)
   }
}
