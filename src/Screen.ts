import * as fs from 'fs';
import { parseStringPromise } from 'xml2js';

import CacheManagement from './CacheManagement';
import {
  ADBResponse,
  UIHierarchy,
} from './types';
import { ADBShell } from './utils';

/**
 * Class that extends CacheManagement to manage various screen-related operations for Android devices.
 * This class includes methods for get screen hierarchy, find element on screen, get screen resolution and other actions related to screen.
 * It utilizes ADB commands to interact with Android devices and allows for easy management of screen-related tasks.
 * 
 * @extends CacheManagement
 * 
 * @note While this class can be used independently, it is primarily designed to be used as part of the ADBHelper class. 
 * When used within ADBHelper, it is instantiated and managed as part of the broader Android device screen.
 * 
 * @example
 * // Using Screen independently:
 * const screenManager = new Screen('XXXXXXXXX');
 * await screenManager.getScreenResolution('');
 * 
 * @example
 * // Using Screen within ADBHelper:
 * const adbHelper = new ADBHelper("device123");
 * await adbHelper.screen.getScreenResolution('');
 */
export default class Screen extends CacheManagement {
    private deviceId: string;
    constructor(deviceId: string) {
        super()
        this.deviceId = deviceId
    }

    /**
     * Retrieves the screen hierarchy.
     * 
     * This method fetches the UI hierarchy from the connected device, parses it, and returns the hierarchy in the specified format (JSON or XML).
     * If the hierarchy is already cached, it returns the cached value.
     * 
     * @param {('JSON' | 'XML')} outputFormat The format of the output ('JSON' or 'XML'). Defaults to 'JSON'.
     * @param {string} [outputFilePath] Optional file path where the hierarchy should be saved.
     * @returns {Promise<UIHierarchy[] | string>} A promise that resolves to the screen hierarchy in the specified format.
     * 
     * @example
     * const screenHierarchy = await adbHelper.screen.getScreenHierarchy('JSON');
     * console.log(screenHierarchy);
     */
    async getScreenHierarchy(
        outputFormat: 'JSON' | 'XML' = 'JSON',
        outputFilePath?: string
    ): Promise<UIHierarchy[] | string> {
        if (this.cachedScreenHierarchyValue) {
            console.log("Using cached screen hierarchy");
            return this.cachedScreenHierarchyValue;
        }

        const hierarchyXML = await this.execCommand(`adb -s ${this.deviceId} exec-out uiautomator dump /dev/tty`);

        if (outputFormat === 'XML') {
            if (outputFilePath) {
                fs.writeFileSync(outputFilePath, hierarchyXML, 'utf8');
            }
            return hierarchyXML;
        }

        const elements: UIHierarchy[] = [];
        const hierarchyJSON = await parseStringPromise(hierarchyXML);

        function extractNodes(node: any): void {
            if (node['$']) {
                const element: UIHierarchy = {};
                for (const [key, value] of Object.entries(node['$'])) {
                    element[key] = value === "false" ? false : value === "true" ? true : value;
                }
                elements.push(element);
            }

            if (node.node) {
                for (const childNode of node.node) {
                    extractNodes(childNode);
                }
            }
        }

        extractNodes(hierarchyJSON.hierarchy);

        if (outputFilePath) {
            fs.writeFileSync(outputFilePath, JSON.stringify(elements, null, 2), 'utf8');
        }

        this.cachedScreenHierarchyValue = elements;
        return elements;
    }

    /**
     * Finds an element in the screen hierarchy based on the provided conditions.
     * 
     * This method searches for an element matching the conditions in the screen hierarchy. If an element is found, it returns it. If multiple elements match, it returns all matching elements.
     * 
     * @param {Partial<UIHierarchy>} conditions The conditions to match for finding the element.
     * @param {UIHierarchy[]} [screenHierarchyJSON] Optional, a custom screen hierarchy to search through.
     * @param {string[]} [attributes] Optional, a list of attributes to return from the matched elements.
     * @returns {Promise<UIHierarchy | UIHierarchy[] | null>} A promise that resolves to the matched element(s), or null if no match is found.
     * 
     * @example
     * const conditions = { resourceId: "com.example:id/button" };
     * const element = await adbHelper.screen.findElement(conditions);
     * console.log(element);
     */
    async findElement(
        conditions: Partial<UIHierarchy>,
        screenHierarchyJSON?: UIHierarchy[],
        attributes?: string[]
    ): Promise<UIHierarchy | UIHierarchy[] | null> {
        if (this.cachedElementValue) {
            console.log("Using cached element");
            return this.cachedElementValue;
        }

        const elements = screenHierarchyJSON || (await this.getScreenHierarchy('JSON') as UIHierarchy[]);

        const isMatching = (element: UIHierarchy) => {
            for (const [key, value] of Object.entries(conditions)) {
                if (element[key] !== value) {
                    return false;
                }
            }
            return true;
        };

        const matchedElements = elements.filter(isMatching);

        if (matchedElements.length === 0) {
            console.log("No elements found matching the specified conditions.");
            return null;
        }

        const applyAttributesFilter = (element: UIHierarchy) => {
            if (attributes) {
                const filteredElement: UIHierarchy = {};
                attributes.forEach(attr => {
                    if (element[attr]) {
                        filteredElement[attr] = element[attr];
                    }
                });
                return filteredElement;
            }
            return element;
        };

        const result = matchedElements.map(applyAttributesFilter);

        if (result.length === 1) {
            this.cachedElementValue = result[0];
            console.log("Element found:", result[0]);
            return result[0];
        }

        console.log(`Multiple elements found (${result.length}):`, result);
        return result;
    }

    /**
     * Retrieves the screen resolution of the connected device.
     * 
     * This method fetches the screen resolution (width and height) of the device via ADB. If the resolution is cached, it returns the cached value.
     * 
     * @returns {Promise<{ width: number; height: number } | null>} A promise that resolves to the screen resolution or null if it couldn't be fetched.
     * 
     * @example
     * const resolution = await adbHelper.screen.getScreenResolution();
     * console.log(resolution); // { width: 1080, height: 1920 }
     */
    async getScreenResolution(): Promise<{ width: number; height: number } | null> {
        if (this.cachedScreenResolution) {
            console.log("Using cached screen resolution");
            return this.cachedScreenResolution;
        }

        try {
            const resolutionString = await this.execCommand(`adb -s ${this.deviceId} shell wm size`);
            const match = resolutionString.match(/(\d+)x(\d+)/);
            if (match) {
                const width = parseInt(match[1], 10);
                const height = parseInt(match[2], 10);

                this.cachedScreenResolution = { width, height };
                console.log(`Screen resolution: ${width}x${height}`);
                return { width, height };
            } else {
                console.error("Failed to extract screen resolution.");
                return null;
            }
        } catch (error) {
            console.error("Error retrieving screen resolution:", error);
            return null;
        }
    }

    /**
     * Starts recording the device screen.
     * 
     * This method starts a screen recording on the connected device. The recording continues until it is stopped manually, unless a duration is specified.
     * 
     * @param {string} outputPath The path where the video file will be saved. Defaults to "/sdcard/screenrecord.mp4".
     * @param {number} [duration] Optional, the duration of the recording in seconds. If not provided, the recording is continuous.
     * @returns {Promise<void>} A promise that resolves when the screen recording has started.
     * 
     * @example
     * await adbHelper.screen.startScreenRecording("/sdcard/myvideo.mp4", 30);
     * console.log("Recording started.");
     */
    async startScreenRecording(outputPath: string = "/sdcard/screenrecord.mp4", duration?: number): Promise<void> {
        try {
            const durationOption = duration ? `--time-limit ${duration}` : "";
            const command = `adb -s ${this.deviceId} shell screenrecord ${durationOption} ${outputPath}`;
            console.log(`Recording started, video will be saved at: ${outputPath}`);
            await this.execCommand(command);
        } catch (error) {
            console.error("Error starting screen recording:", error);
            throw error;
        }
    }

    /**
     * Stops the screen recording and retrieves the video file.
     * 
     * This method stops the screen recording and pulls the recorded video file from the device to the local system.
     * 
     * @param {string} remotePath The path where the video file is stored on the device. Defaults to "/sdcard/screenrecord.mp4".
     * @param {string} localPath The local path where the video file will be saved. Defaults to "./screenrecord.mp4".
     * @returns {Promise<void>} A promise that resolves when the recording is stopped and the video file is retrieved.
     * 
     * @example
     * await adbHelper.screen.stopScreenRecording("/sdcard/myvideo.mp4", "./localvideo.mp4");
     * console.log("Recording stopped and video retrieved.");
     */
    async stopScreenRecording(remotePath: string = "/sdcard/screenrecord.mp4", localPath: string = "./screenrecord.mp4"): Promise<void> {
        try {
            console.log(`Stopping recording and retrieving video file from: ${remotePath}`);
            await this.execCommand(`adb -s ${this.deviceId} shell pkill -l SIGINT screenrecord`);
            await this.execCommand(`adb -s ${this.deviceId} pull ${remotePath} ${localPath}`);
            console.log(`Video file retrieved at: ${localPath}`);
        } catch (error) {
            console.error("Error stopping screen recording or retrieving video file:", error);
            throw error;
        }
    }

    /**
     * Enables dark mode on the Android device.
     * @returns A promise that resolves when dark mode is enabled.
     * @example
     * // Usage
     * await adbHelper.enableDarkMode();
     */
    async enableDarkMode(): Promise<void> {
        try {
            // Activates dark mode by setting the "ui_night_mode" parameter to 2
            await this.execCommand(`adb -s ${this.deviceId} shell settings put secure ui_night_mode 2`);
            console.log("Dark mode enabled.");
        } catch (error) {
            console.error("Error enabling dark mode:", error);
            throw error;
        }
    }

    /**
     * Disables dark mode, returning to light mode.
     * @returns A promise that resolves when light mode is enabled.
     * @example
     * // Usage
     * await adbHelper.disableDarkMode();
     */
    async disableDarkMode(): Promise<void> {
        try {
            // Disables dark mode by setting the "ui_night_mode" parameter to 1 (light mode)
            await this.execCommand(`adb -s ${this.deviceId} shell settings put secure ui_night_mode 1`);
            console.log("Light mode enabled.");
        } catch (error) {
            console.error("Error disabling dark mode:", error);
            throw error;
        }
    }

    /**
     * Configures the display to follow the system's display mode (dark or light depending on system settings).
     * @returns A promise that resolves when the display mode is set to follow system preferences.
     * @example
     * // Usage
     * await adbHelper.setSystemDefaultDisplayMode();
     */
    async setSystemDefaultDisplayMode(): Promise<void> {
        try {
            // Configures to follow the system's display mode (0 for default system mode)
            await this.execCommand(`adb -s ${this.deviceId} shell settings put secure ui_night_mode 0`);
            console.log("Display mode set to follow system preferences.");
        } catch (error) {
            console.error("Error setting system default display mode:", error);
            throw error;
        }
    }

    /**
     * Forces the screen orientation to landscape mode.
     * @returns A promise that resolves when the orientation is changed.
     * @example
     * // Usage
     * await adbHelper.setLandscapeMode();
     */
    async setLandscapeMode(): Promise<void> {
        try {
            // Forces screen orientation to landscape using ADB command
            await this.execCommand(`adb -s ${this.deviceId} shell settings put system accelerometer_rotation 0`);
            await this.execCommand(`adb -s ${this.deviceId} shell content insert --uri content://settings/system --bind name=screensaver --bind value=1`);
            console.log("Screen orientation set to landscape.");
        } catch (error) {
            console.error("Error setting landscape mode:", error);
            throw error;
        }
    }

    /**
     * Forces the screen orientation to portrait mode.
     * @returns A promise that resolves when the orientation is changed.
     * @example
     * // Usage
     * await adbHelper.setPortraitMode();
     */
    async setPortraitMode(): Promise<void> {
        try {
            // Forces screen orientation to portrait using ADB command
            await this.execCommand(`adb -s ${this.deviceId} shell settings put system accelerometer_rotation 0`);
            await this.execCommand(`adb -s ${this.deviceId} shell content insert --uri content://settings/system --bind name=screensaver --bind value=0`);
            console.log("Screen orientation set to portrait.");
        } catch (error) {
            console.error("Error setting portrait mode:", error);
            throw error;
        }
    }


    /**
 * Checks the screen status (active or inactive).
 * @returns A promise that resolves to 'active' if the screen is on, 'inactive' if the screen is off.
 * @example
 * // Usage
 * const status = await adbHelper.checkScreenStatus();
 * console.log(status); // 'active' or 'inactive'
 */
    async checkScreenStatus(): Promise<string | null> {
        try {
            // Executes the ADB command to get the screen status
            const result = await this.execCommand(`adb -s ${this.deviceId} shell dumpsys power`);
            console.log(result);
            // Search for the line that contains the screen status
            if (result) {
                return result;
            } else {
                console.log("Unable to determine screen status.");
                return null;
            }
        } catch (error) {
            console.error("Error checking screen status:", error);
            throw error;
        }
    }

    /**
     * Retrieves the current screen density of the device.
     * @returns A promise that resolves to the screen density.
     * @example
     * // Usage
     * const density = await adbHelper.getScreenDensity();
     * console.log(`Screen density: ${density}`);
     */
    async getScreenDensity(): Promise<number> {
        try {
            // Executes the ADB command to get the screen density
            const result = await this.execCommand(`adb -s ${this.deviceId} shell wm density`);

            // Extracts the density value (the number after "Physical density:")
            const density = parseInt(result.replace('Physical density:', '').trim());
            console.log(`Screen density: ${density}`);
            return density;
        } catch (error) {
            console.error("Error retrieving screen density:", error);
            throw error;
        }
    }

    /**
     * Modifies the screen density of the device.
     * @param density The new screen density (e.g., 160, 240, 320, 480, etc.).
     * @returns A promise that resolves when the screen density is modified.
     * @example
     * // Usage
     * await adbHelper.setScreenDensity(320); // Sets the screen density to 320
     */
    async setScreenDensity(density: number): Promise<void> {
        try {
            // Executes the ADB command to change the screen density
            await this.execCommand(`adb -s ${this.deviceId} shell wm density ${density}`);
            console.log(`Screen density changed to: ${density}`);

            // Reload the display (optional)
            await this.execCommand(`adb -s ${this.deviceId} shell wm size reset`);
        } catch (error) {
            console.error("Error changing screen density:", error);
            throw error;
        }
    }
    private async execCommand(command: string): Promise<ADBResponse> {
        return await ADBShell(command)
    }
}

