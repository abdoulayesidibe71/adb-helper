import CacheManagement from './CacheManagement';
import { ADBResponse } from './types';
import {
  ADBShell,
  getBatteryStatusString,
} from './utils';

/**
 * Class to manage various device operations via ADB commands.
 * 
 * This class provides methods for controlling and interacting with Android devices,
 * such as enabling/disabling airplane mode, performing factory resets, capturing system logs,
 * managing device volumes, and checking system settings like developer options and USB debugging and others.
 * It extends the `CacheManagement` class for cache handling capabilities.
 * 
 * @extends CacheManagement
 * 
 * @note Although this class can be used independently, it is primarily designed to be used as part of the ADBHelper class. 
 * When used within ADBHelper, it is instantiated and managed as part of the broader Android device control.
 * 
 * @param {string} deviceId The unique identifier for the Android device.
 * 
 * @example
 * // Using DeviceControl independently:
 * let deviceId = "XXXXXXXXXXXX";
 * const deviceControl = new DeviceControl(deviceId);
 * const isDevelopmentEnabled = await deviceControl.checkDevelopmentSettings();
 * console.log(isDevelopmentEnabled);  // Logs true if development options are enabled
 * 
 * @example
 * // Using DeviceControl within ADBHelper:
 * const adbHelper = new ADBHelper("device123");
 * const isDevelopmentEnabled = await adbHelper.deviceControl.checkDevelopmentSettings();
 * console.log(isDevelopmentEnabled);  // Logs true if development options are enabled
 */
export class DeviceControl extends CacheManagement {
    private deviceId: string;

    constructor(deviceId: string) {
        super();
        this.deviceId = deviceId;
    }

    /**
     * Simulates pressing the "Back" button on the device.
     * 
     * This method sends a command to the device to simulate the action of pressing 
     * the physical or virtual "Back" button, typically used for navigating backward 
     * in the app or closing the current activity or screen.
     * 
     * @returns {Promise<void>} A promise that resolves when the "Back" button has 
     * been successfully pressed or rejects if an error occurs during execution.
     * 
     * @throws {Error} If an error occurs while executing the command or interacting 
     * with the device.
     */
    async pressBack(): Promise<void> {
        try {
            await this.execCommand(`adb -s ${this.deviceId} shell input keyevent 4`);
        } catch (error) {
            console.error("Error while pressing the Back button:", error);
            throw error;
        }
    }

    /**
     * Simulates pressing the "Home" button on the device.
     * 
     * This method sends a command to the device to simulate the action of pressing 
     * the physical or virtual "Home" button, typically used to navigate to the home screen 
     * or return to the device's main launcher.
     * 
     * @returns {Promise<void>} A promise that resolves when the "Home" button has 
     * been successfully pressed or rejects if an error occurs during execution.
     * 
     * @throws {Error} If an error occurs while executing the command or interacting 
     * with the device.
     */
    async pressHome(): Promise<void> {
        try {
            await this.execCommand(`adb -s ${this.deviceId} shell input keyevent 3`);
        } catch (error) {
            console.error("Error while pressing the Home button:", error);
            throw error;
        }
    }

    /**
     * Simulates pressing the "Recent Apps" button on the device.
     * 
     * This method sends a command to the device to simulate the action of pressing 
     * the "Recent Apps" button, which typically shows the list of recently used applications 
     * or opens the multitasking view on the device.
     * 
     * @returns {Promise<void>} A promise that resolves when the "Recent Apps" button 
     * has been successfully pressed or rejects if an error occurs during execution.
     * 
     * @throws {Error} If an error occurs while executing the command or interacting 
     * with the device.
     */
    async pressRecentApps(): Promise<void> {
        try {
            await this.execCommand(`adb -s ${this.deviceId} shell input keyevent 187`);
            console.log("Recent Apps button pressed.");
        } catch (error) {
            console.error("Error while pressing the Recent Apps button:", error);
            throw error;
        }
    }

    /**
     * Checks the status of the connected device.
     * 
     * This method checks whether the device identified by the `deviceId` is properly connected 
     * and recognized by the adb tool. It sends a command to list the connected devices and verifies 
     * if the current device is present in the list.
     * 
     * @returns {Promise<string>} A promise that resolves with a string message indicating 
     * the device status (e.g., "Device detected") or throws an error if the device is not detected.
     * 
     * @throws {Error} If there is an issue executing the command or if the device is not detected.
     */
    async checkDevice(): Promise<string> {
        try {
            const status = await this.execCommand('adb devices');
            if (status.includes(this.deviceId)) {
                console.log("Device detected.", status);
                return status;
            } else {
                console.error("Device not detected.");
                throw new Error("Device not detected");
            }
        } catch (error) {
            console.error("Error while checking the device:", error);
            throw error;
        }
    }

    /**
     * Restarts the connected device.
     * 
     * This method sends a reboot command to the connected device identified by the `deviceId`.
     * It uses the `adb reboot` command to restart the device.
     * 
     * @returns {Promise<void>} A promise that resolves when the reboot command is successfully executed.
     * 
     * @throws {Error} If there is an issue executing the command or if the device cannot be rebooted.
     */
    async rebootDevice(): Promise<void> {
        try {
            await this.execCommand(`adb -s ${this.deviceId} reboot`);
            console.log("Device restarted.");
        } catch (error) {
            console.error("Error while rebooting the device:", error);
            throw error;
        }
    }

    /**
     * Changes the device's screen brightness.
     * 
     * This method allows you to set the screen brightness of the connected device. The brightness value
     * must be between 0 and 255 (0 to turn off the screen, 255 for maximum brightness).
     * 
     * @param {number} brightness The brightness value to set, between 0 and 255.
     * 
     * @returns {Promise<void>} A promise that resolves when the command is executed successfully.
     * 
     * @throws {Error} If the brightness value is outside the valid range (0 to 255) or if the command fails.
     * 
     * @example
     * // Set the brightness to 255 (maximum brightness)
     * import ADBHelper from 'ADBHelper';
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.deviceControl.setBrightness(255);
     */
    async setBrightness(brightness: number): Promise<void> {
        try {
            // Validate the brightness value
            if (brightness < 0 || brightness > 255) {
                throw new Error("Brightness value must be between 0 and 255.");
            }

            // Command to set the screen brightness
            await this.execCommand(`adb -s ${this.deviceId} shell settings put system screen_brightness ${brightness}`);
            console.log(`Brightness set to: ${brightness}`);
        } catch (error) {
            console.error("Error while changing brightness:", error);
            throw error;
        }
    }

    /**
     * Enables or disables the device's auto-rotation.
     * 
     * This method allows you to enable or disable the auto-rotation feature of the connected device. 
     * When enabled, the screen orientation will automatically adjust based on the device's position.
     * 
     * @param {boolean} enable `true` to enable auto-rotation, `false` to disable it.
     * 
     * @returns {Promise<void>} A promise that resolves when the command is successfully executed.
     * 
     * @throws {Error} If the command fails or the device cannot process the command.
     * 
     * @example
     * // Enable auto-rotation
     * import ADBHelper from 'ADBHelper';
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.deviceControl.setAutoRotation(true);
     * 
     * @example
     * // Disable auto-rotation
     * import ADBHelper from 'ADBHelper';
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.deviceControl.setAutoRotation(false);
     */
    async setAutoRotation(enable: boolean): Promise<void> {
        try {
            const value = enable ? 1 : 0; // 1 to enable, 0 to disable

            // Command to enable or disable auto-rotation
            await this.execCommand(`adb -s ${this.deviceId} shell settings put system accelerometer_rotation ${value}`);

            const status = enable ? "enabled" : "disabled";
            console.log(`Auto-rotation ${status}.`);
        } catch (error) {
            console.error("Error while changing auto-rotation:", error);
            throw error;
        }
    }



    /**
     * Enables USB debugging via ADB (part of the Developer Mode).
     * 
     * This method enables the USB debugging feature on the connected device. 
     * It is required for establishing a connection between the device and ADB for debugging purposes.
     * 
     * @returns {Promise<void>} A promise that resolves when USB debugging is successfully enabled.
     * 
     * @throws {Error} If the command fails or the device cannot process the command.
     * 
     * @example
     * // Example of enabling USB debugging
     * import ADBHelper from 'ADBHelper';
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.deviceControl.enableUSBDebugging();
     */
    async enableUSBDebugging(): Promise<void> {
        try {
            // Enable USB debugging via ADB
            await this.execCommand(`adb -s ${this.deviceId} shell settings put global development_settings_enabled 1`);
            await this.execCommand(`adb -s ${this.deviceId} shell settings put global adb_enabled 1`);
            console.log("USB debugging enabled.");
        } catch (error) {
            console.error("Error enabling USB debugging:", error);
            throw error;
        }
    }


    /**
     * Disables Developer Mode options such as USB debugging.
     * 
     * This method disables USB debugging and other developer options on the connected device. 
     * It is used to turn off the developer settings once they are no longer needed.
     * 
     * @returns {Promise<void>} A promise that resolves when USB debugging is successfully disabled.
     * 
     * @throws {Error} If the command fails or the device cannot process the command.
     * 
     * @example
     * // Example of disabling developer mode
     * import ADBHelper from 'ADBHelper';
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.deviceControl.disableDeveloperMode();
     */
    async disableDeveloperMode(): Promise<void> {
        try {
            // Disable USB debugging
            await this.execCommand(`adb -s ${this.deviceId} shell settings put global adb_enabled 0`);
            console.log("USB debugging disabled.");
        } catch (error) {
            console.error("Error disabling developer mode:", error);
            throw error;
        }
    }

    /**
     * Checks the currently running Android version on the device.
     * 
     * This method retrieves the Android version of the connected device using ADB. 
     * It returns the version string which can be used to determine the device's OS version.
     * 
     * @returns {Promise<string>} A promise that resolves with the Android version string.
     * 
     * @throws {Error} If the command fails or the device cannot provide the version.
     * 
     * @example
     * // Example of checking Android version
     * import ADBHelper from 'ADBHelper';
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * const androidVersion = await adbHelper.deviceControl.checkAndroidVersion();
     * console.log(`Android Version: ${androidVersion}`);
     */
    async checkAndroidVersion(): Promise<string> {
        try {
            // Run the ADB command to get the Android version
            const result = await this.execCommand(`adb -s ${this.deviceId} shell getprop ro.build.version.release`);

            // The result should be the Android version
            console.log(`Android Version: ${result.trim()}`);
            return result.trim();
        } catch (error) {
            console.error("Error retrieving Android version:", error);
            throw error;
        }
    }

    /**
     * Checks the battery status (battery level and charging status) of the device.
     * 
     * This method retrieves the battery level, charging status, and the power source (USB, AC, or Wireless) of the connected Android device.
     * It parses the data returned by the ADB command and returns an object containing the battery level, status, and charging source.
     * 
     * @returns {Promise<{ level: number, status: string, plugged: string }>} A promise that resolves with an object containing the battery level, status, and charging source.
     * 
     * @throws {Error} If the ADB command fails or the battery status cannot be retrieved.
     * 
     * @example
     * // Example of checking battery status
     * import ADBHelper from 'ADBHelper';
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * const batteryStatus = await adbHelper.deviceControl.getBatteryStatus();
     * console.log(`Battery Level: ${batteryStatus.level}%`);
     * console.log(`Battery Status: ${batteryStatus.status}`);
     * console.log(`Charging via: ${batteryStatus.plugged}`);
     */
    async getBatteryStatus(): Promise<{ level: number, status: string, plugged: string }> {
        try {
            // Run the ADB command to get battery information
            const result = await this.execCommand(`adb -s ${this.deviceId} shell dumpsys battery`);

            // Parse the results to extract the battery level
            const levelMatch = result.match(/level:\s*(\d+)/);
            const statusMatch = result.match(/status:\s*(\d+)/);

            // Detect the charging type (USB, AC, Wireless)
            const usbPoweredMatch = result.match(/USB powered:\s*(true|false)/);
            const acPoweredMatch = result.match(/AC powered:\s*(true|false)/);
            const wirelessPoweredMatch = result.match(/Wireless powered:\s*(true|false)/);

            const level = levelMatch ? parseInt(levelMatch[1]) : 0;
            const status = statusMatch ? getBatteryStatusString(parseInt(statusMatch[1])) : 'Unknown';

            let plugged = 'Not plugged';
            if (usbPoweredMatch && usbPoweredMatch[1] === 'true') {
                plugged = 'USB';
            } else if (acPoweredMatch && acPoweredMatch[1] === 'true') {
                plugged = 'AC';
            } else if (wirelessPoweredMatch && wirelessPoweredMatch[1] === 'true') {
                plugged = 'Wireless';
            }

            console.log(`Battery Level: ${level}%`);
            console.log(`Battery Status: ${status}`);
            console.log(`Device Charging via: ${plugged}`);

            return { level, status, plugged };
        } catch (error) {
            console.error("Error retrieving battery status:", error);
            throw error;
        }
    }

    /**
     * Enables or disables mobile data on the device.
     * 
     * This method toggles the mobile data connection on an Android device by using ADB commands. 
     * It accepts a boolean value to either enable or disable mobile data.
     * 
     * @param {boolean} enable - A boolean value to indicate whether to enable (`true`) or disable (`false`) mobile data.
     * 
     * @returns {Promise<void>} A promise that resolves when the mobile data status is toggled.
     * 
     * @throws {Error} If the ADB command fails to execute.
     * 
     * @example
     * // Example of toggling mobile data
     * import ADBHelper from 'ADBHelper';
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.deviceControl.toggleMobileData(true);  // Enable mobile data
     * await adbHelper.deviceControl.toggleMobileData(false); // Disable mobile data
     */
    async toggleMobileData(enable: boolean): Promise<void> {
        try {
            const command = enable
                ? `adb -s ${this.deviceId} shell svc data enable`
                : `adb -s ${this.deviceId} shell svc data disable`;

            // Run the command to enable or disable mobile data
            await this.execCommand(command);

            console.log(`Mobile data ${enable ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error("Error toggling mobile data:", error);
            throw error;
        }
    }


    /**
     * Enables or disables automatic synchronization on the device.
     * 
     * This method toggles the automatic synchronization setting on an Android device using ADB commands.
     * It accepts a boolean value to either enable or disable the synchronization.
     * 
     * @param {boolean} enable - A boolean value indicating whether to enable (`true`) or disable (`false`) automatic synchronization.
     * 
     * @returns {Promise<void>} A promise that resolves when the synchronization setting is toggled.
     * 
     * @throws {Error} If the ADB command fails to execute.
     * 
     * @example
     * // Example of toggling automatic synchronization
     * import ADBHelper from 'ADBHelper';
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.deviceControl.toggleSync(true);  // Enable automatic synchronization
     * await adbHelper.deviceControl.toggleSync(false); // Disable automatic synchronization
     */
    async toggleSync(enable: boolean): Promise<void> {
        try {
            const command = enable
                ? `adb -s ${this.deviceId} shell settings put global auto_sync 1`
                : `adb -s ${this.deviceId} shell settings put global auto_sync 0`;

            // Run the command to enable or disable sync
            await this.execCommand(command);

            console.log(`Automatic synchronization ${enable ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error("Error toggling automatic synchronization:", error);
            throw error;
        }
    }

    /**
     * Enables or disables GPS location on the device.
     * 
     * This method toggles the GPS (location services) on an Android device using ADB commands.
     * It accepts a boolean value to either enable or disable the GPS functionality.
     * 
     * @param {boolean} enable - A boolean value indicating whether to enable (`true`) or disable (`false`) GPS.
     * 
     * @returns {Promise<void>} A promise that resolves when the GPS setting is toggled.
     * 
     * @throws {Error} If the ADB command fails to execute.
     * 
     * @example
     * // Example of toggling GPS (Location Services)
     * import ADBHelper from 'ADBHelper';
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.deviceControl.toggleGPS(true);  // Enable GPS
     * await adbHelper.deviceControl.toggleGPS(false); // Disable GPS
     */
    async toggleGPS(enable: boolean): Promise<void> {
        try {
            const command = enable
                ? `adb -s ${this.deviceId} shell settings put secure location_mode 3`
                : `adb -s ${this.deviceId} shell settings put secure location_mode 0`;

            // Run the command to enable or disable GPS
            await this.execCommand(command);

            console.log(`GPS ${enable ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error("Error toggling GPS:", error);
            throw error;
        }
    }


    /**
     * Enables or disables Wi-Fi on the device.
     * 
     * This method toggles the Wi-Fi on an Android device using ADB commands.
     * It accepts a boolean value to either enable or disable the Wi-Fi functionality.
     * 
     * @param {boolean} enable - A boolean value indicating whether to enable (`true`) or disable (`false`) Wi-Fi.
     * 
     * @returns {Promise<void>} A promise that resolves when the Wi-Fi setting is toggled.
     * 
     * @throws {Error} If the ADB command fails to execute.
     * 
     * @example
     * // Example of toggling Wi-Fi
     * import ADBHelper from 'ADBHelper';
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.deviceControl.toggleWiFi(true);  // Enable Wi-Fi
     * await adbHelper.deviceControl.toggleWiFi(false); // Disable Wi-Fi
     */
    async toggleWiFi(enable: boolean): Promise<void> {
        try {
            const command = enable
                ? `adb -s ${this.deviceId} shell svc wifi enable`
                : `adb -s ${this.deviceId} shell svc wifi disable`;

            // Run the command to enable or disable Wi-Fi
            await this.execCommand(command);

            console.log(`Wi-Fi ${enable ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error("Error toggling Wi-Fi:", error);
            throw error;
        }
    }

    /**
     * Enables or disables Bluetooth on the device.
     * 
     * This method toggles the Bluetooth functionality on an Android device using ADB commands.
     * It accepts a boolean value to either enable or disable Bluetooth.
     * 
     * @param {boolean} enable - A boolean value indicating whether to enable (`true`) or disable (`false`) Bluetooth.
     * 
     * @returns {Promise<void>} A promise that resolves when the Bluetooth setting is toggled.
     * 
     * @throws {Error} If the ADB command fails to execute.
     * 
     * @example
     * // Example of toggling Bluetooth
     * import ADBHelper from 'ADBHelper';
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.deviceControl.toggleBluetooth(true);  // Enable Bluetooth
     * await adbHelper.deviceControl.toggleBluetooth(false); // Disable Bluetooth
     */
    async toggleBluetooth(enable: boolean): Promise<void> {
        try {
            const command = enable
                ? `adb -s ${this.deviceId} shell am start -a android.bluetooth.adapter.action.REQUEST_ENABLE`
                : `adb -s ${this.deviceId} shell am start -a android.bluetooth.adapter.action.REQUEST_DISABLE`;

            // Run the command to enable or disable Bluetooth
            await this.execCommand(command);

            console.log(`Bluetooth ${enable ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error("Error toggling Bluetooth:", error);
            throw error;
        }
    }

    /**
     * Enables or disables airplane mode on the device.
     * 
     * This method toggles the airplane mode on an Android device using ADB commands.
     * It accepts a boolean value to either enable or disable airplane mode.
     * 
     * @param {boolean} enable - A boolean value indicating whether to enable (`true`) or disable (`false`) airplane mode.
     * 
     * @returns {Promise<void>} A promise that resolves when the airplane mode setting is toggled.
     * 
     * @throws {Error} If the ADB command fails to execute.
     * 
     * @example
     * // Example of toggling airplane mode
     * import ADBHelper from 'ADBHelper';
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.deviceControl.toggleAirplaneMode(true);  // Enable airplane mode
     * await adbHelper.deviceControl.toggleAirplaneMode(false); // Disable airplane mode
     */
    async toggleAirplaneMode(enable: boolean): Promise<void> {
        try {
            const command = enable
                ? `adb -s ${this.deviceId} shell settings put global airplane_mode_on 1`
                : `adb -s ${this.deviceId} shell settings put global airplane_mode_on 0`;

            // Execute the command to enable or disable airplane mode
            await this.execCommand(command);

            console.log(`Airplane mode ${enable ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error("Error toggling airplane mode:", error);
            throw error;
        }
    }


    /**
     * Performs a factory reset on the device, erasing all data.
     * 
     * This method resets the device to its factory settings, effectively wiping all data.
     * It uses the ADB `MASTER_CLEAR` intent to trigger the factory reset process.
     * 
     * @returns {Promise<void>} A promise that resolves when the device is reset to factory settings.
     * 
     * @throws {Error} If the ADB command fails to execute.
     * 
     * @example
     * // Example of performing a factory reset
     * import ADBHelper from 'ADBHelper';
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.deviceControl.factoryReset();  // Perform factory reset
     */
    async factoryReset(): Promise<void> {
        try {
            // Command to perform a factory reset (wipes all data)
            await this.execCommand(`adb -s ${this.deviceId} shell am broadcast -a android.intent.action.MASTER_CLEAR`);
            console.log("Device reset to factory settings.");
        } catch (error) {
            console.error("Error during device factory reset:", error);
            throw error;
        }
    }

    /**
     * Wipes the user data on the device.
     * 
     * This method erases the user data on the device using the ADB recovery command.
     * It only clears the user data without affecting system settings or installed apps.
     * 
     * @returns {Promise<void>} A promise that resolves when the user data is wiped.
     * 
     * @throws {Error} If the ADB command fails to execute.
     * 
     * @example
     * // Example of wiping user data
     * import ADBHelper from 'ADBHelper';
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.deviceControl.wipeUserData();  // Wipe user data
     */
    async wipeUserData(): Promise<void> {
        try {
            // Command to wipe user data
            await this.execCommand(`adb -s ${this.deviceId} shell recovery --wipe_data`);
            console.log("User data wiped.");
        } catch (error) {
            console.error("Error wiping user data:", error);
            throw error;
        }
    }

    /**
     * Reboots the device into recovery mode.
     * 
     * This method reboots the device into recovery mode, which is typically used for maintenance tasks like updating the device or performing factory resets.
     * It uses the ADB `reboot recovery` command to restart the device in recovery mode.
     * 
     * @returns {Promise<void>} A promise that resolves when the device has successfully rebooted into recovery mode.
     * 
     * @throws {Error} If the ADB command fails to execute.
     * 
     * @example
     * // Example of rebooting into recovery mode
     * import ADBHelper from 'ADBHelper';
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.deviceControl.rebootIntoRecovery();  // Reboot into recovery mode
     */
    async rebootIntoRecovery(): Promise<void> {
        try {
            // Command to reboot the device into recovery mode
            await this.execCommand(`adb -s ${this.deviceId} reboot recovery`);
            console.log("Device rebooted into recovery mode.");
        } catch (error) {
            console.error("Error rebooting into recovery mode:", error);
            throw error;
        }
    }

    /**
  * Changes the system language and region on the device.
  * 
  * This method sets the system language and region (locale) using the ADB `setprop` command for language and country.
  * After the properties are set, it broadcasts the `LOCALE_CHANGED` intent to apply the changes.
  * 
  * @param language The language code (e.g., "en", "fr") to set on the device.
  * @param region The region code (e.g., "US", "FR") to set on the device.
  * 
  * @returns {Promise<void>} A promise that resolves when the language and region are successfully changed.
  * 
  * @throws {Error} If any of the ADB commands fail to execute.
  * 
  * @example
  * // Example of changing language and region
  * import ADBHelper from 'ADBHelper';
  * let adbHelper = new ADBHelper('XXXXXXXXX');
  * await adbHelper.deviceControl.changeLanguage('fr', 'FR');  // Change language to French and region to France
  */
    async changeLanguage(language: string, region: string): Promise<void> {
        try {
            // Command to change the system language and region
            await this.execCommand(`adb -s ${this.deviceId} shell setprop persist.sys.language ${language}`);
            await this.execCommand(`adb -s ${this.deviceId} shell setprop persist.sys.country ${region}`);
            await this.execCommand(`adb -s ${this.deviceId} shell am broadcast -a android.intent.action.LOCALE_CHANGED`);
            console.log(`Language changed to ${language}-${region}`);
        } catch (error) {
            console.error("Error changing system language:", error);
            throw error;
        }
    }

    /**
     * Captures the system logs from the device and saves them to a file.
     * 
     * This method collects the system logs using the ADB `logcat -d` command, which dumps the logs from the device.
     * The logs are printed to the console and saved to a file named `system_log.txt`.
     * 
     * @returns {Promise<void>} A promise that resolves when the system log is successfully captured.
     * 
     * @throws {Error} If the ADB command fails to execute.
     * 
     * @example
     * // Example of capturing the system log
     * import ADBHelper from 'ADBHelper';
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.deviceControl.captureSystemLog();  // Capture the system log
     */
    async captureSystemLog(): Promise<void> {
        try {
            // Command to capture the full system log
            const result = await this.execCommand(`adb -s ${this.deviceId} logcat -d`);

            // Print the logs to the console
            console.log("Full system log captured:\n", result);

            // Optionally save the logs to a file
            const fs = require('fs');
            fs.writeFileSync('system_log.txt', result);
            console.log("System log saved to 'system_log.txt'.");
        } catch (error) {
            console.error("Error capturing system log:", error);
            throw error;
        }
    }


    /**
  * Sets the media volume on the device.
  * 
  * This method adjusts the media volume on the device by executing an ADB command to set the volume level.
  * The volume level must be an integer between 0 (mute) and 15 (maximum volume).
  * 
  * @param volumeLevel The desired media volume level (0-15).
  * 
  * @returns {Promise<void>} A promise that resolves when the volume is successfully set.
  * 
  * @throws {Error} If the ADB command fails to execute.
  * 
  * @example
  * // Example of setting media volume to level 5
  * import ADBHelper from 'ADBHelper';
  * let adbHelper = new ADBHelper('XXXXXXXXX');
  * await adbHelper.deviceControl.setMediaVolume(5);  // Set media volume to level 5
  */
    async setMediaVolume(volumeLevel: number): Promise<void> {
        try {
            // volumeLevel must be an integer between 0 (mute) and 15 (maximum volume)
            const result = await this.execCommand(`adb -s ${this.deviceId} shell media volume --set ${volumeLevel}`);
            console.log(`Media volume set to ${volumeLevel}`);
        } catch (error) {
            console.error("Error setting media volume:", error);
            throw error;
        }
    }

    /**
     * Sets the ringtone volume on the device.
     * 
     * This method adjusts the ringtone volume on the device by executing an ADB command.
     * The volume level must be an integer between 0 (mute) and 15 (maximum volume).
     * 
     * @param volumeLevel The desired ringtone volume level (0-15).
     * 
     * @returns {Promise<void>} A promise that resolves when the volume is successfully set.
     * 
     * @throws {Error} If the ADB command fails to execute.
     * 
     * @example
     * // Example of setting ringtone volume to level 8
     * import ADBHelper from 'ADBHelper';
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.deviceControl.setRingtoneVolume(8);  // Set ringtone volume to level 8
     */
    async setRingtoneVolume(volumeLevel: number): Promise<void> {
        try {
            // volumeLevel must be an integer between 0 (mute) and 15 (maximum volume)
            const result = await this.execCommand(`adb -s ${this.deviceId} shell settings put system volume_ring ${volumeLevel}`);
            console.log(`Ringtone volume set to ${volumeLevel}`);
        } catch (error) {
            console.error("Error setting ringtone volume:", error);
            throw error;
        }
    }

    /**
     * Sets the notification volume on the device.
     * 
     * This method adjusts the notification volume on the device by executing an ADB command.
     * The volume level must be an integer between 0 (mute) and 15 (maximum volume).
     * 
     * @param volumeLevel The desired notification volume level (0-15).
     * 
     * @returns {Promise<void>} A promise that resolves when the volume is successfully set.
     * 
     * @throws {Error} If the ADB command fails to execute.
     * 
     * @example
     * // Example of setting notification volume to level 7
     * import ADBHelper from 'ADBHelper';
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.deviceControl.setNotificationVolume(7);  // Set notification volume to level 7
     */
    async setNotificationVolume(volumeLevel: number): Promise<void> {
        try {
            // volumeLevel must be an integer between 0 (mute) and 15 (maximum volume)
            const result = await this.execCommand(`adb -s ${this.deviceId} shell settings put system volume_notification ${volumeLevel}`);
            console.log(`Notification volume set to ${volumeLevel}`);
        } catch (error) {
            console.error("Error setting notification volume:", error);
            throw error;
        }
    }

    /**
     * Enables silent mode on the device.
     * 
     * This method activates silent mode on the device using the ADB command.
     * It broadcasts the intent to mute audio.
     * 
     * @returns {Promise<void>} A promise that resolves when silent mode is successfully activated.
     * 
     * @throws {Error} If the ADB command fails to execute.
     * 
     * @example
     * // Example of enabling silent mode
     * import ADBHelper from 'ADBHelper';
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.deviceControl.enableSilentMode();  // Enable silent mode
     */
    async enableSilentMode(): Promise<void> {
        try {
            // Command to activate silent mode
            const result = await this.execCommand(`adb -s ${this.deviceId} shell am broadcast -a android.intent.action.MUTE_AUDIO`);
            console.log("Silent mode enabled");
        } catch (error) {
            console.error("Error enabling silent mode:", error);
            throw error;
        }
    }

    /**
     * Disables silent mode on the device.
     * 
     * This method deactivates silent mode on the device using the ADB command.
     * It broadcasts the intent to unmute audio.
     * 
     * @returns {Promise<void>} A promise that resolves when silent mode is successfully deactivated.
     * 
     * @throws {Error} If the ADB command fails to execute.
     * 
     * @example
     * // Example of disabling silent mode
     * import ADBHelper from 'ADBHelper';
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.deviceControl.disableSilentMode();  // Disable silent mode
     */
    async disableSilentMode(): Promise<void> {
        try {
            // Command to deactivate silent mode
            const result = await this.execCommand(`adb -s ${this.deviceId} shell am broadcast -a android.intent.action.UNMUTE_AUDIO`);
            console.log("Silent mode disabled");
        } catch (error) {
            console.error("Error disabling silent mode:", error);
            throw error;
        }
    }

    /**
     * Enables the "Do Not Disturb" mode on the device.
     * 
     * This method activates the "Do Not Disturb" mode by setting the global `zen_mode` to 1 using the ADB command.
     * 
     * @returns {Promise<void>} A promise that resolves when "Do Not Disturb" mode is successfully enabled.
     * 
     * @throws {Error} If the ADB command fails to execute.
     * 
     * @example
     * // Example of enabling Do Not Disturb mode
     * import ADBHelper from 'ADBHelper';
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.deviceControl.enableDoNotDisturb();  // Enable Do Not Disturb mode
     */
    async enableDoNotDisturb(): Promise<void> {
        try {
            // Command to activate Do Not Disturb mode
            const result = await this.execCommand(`adb -s ${this.deviceId} shell settings put global zen_mode 1`);
            console.log("Do Not Disturb mode enabled");
        } catch (error) {
            console.error("Error enabling Do Not Disturb mode:", error);
            throw error;
        }
    }

    /**
     * Disables the "Do Not Disturb" mode on the device.
     * 
     * This method deactivates the "Do Not Disturb" mode by setting the global `zen_mode` to 0 using the ADB command.
     * 
     * @returns {Promise<void>} A promise that resolves when "Do Not Disturb" mode is successfully disabled.
     * 
     * @throws {Error} If the ADB command fails to execute.
     * 
     * @example
     * // Example of disabling Do Not Disturb mode
     * import ADBHelper from 'ADBHelper';
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.deviceControl.disableDoNotDisturb();  // Disable Do Not Disturb mode
     */
    async disableDoNotDisturb(): Promise<void> {
        try {
            // Command to deactivate Do Not Disturb mode
            const result = await this.execCommand(`adb -s ${this.deviceId} shell settings put global zen_mode 0`);
            console.log("Do Not Disturb mode disabled");
        } catch (error) {
            console.error("Error disabling Do Not Disturb mode:", error);
            throw error;
        }
    }

    /**
     * Sets the system time on the device.
     * 
     * This method sets the system time on the device using the ADB `date -s` command. The date should be provided in the format "YYYY-MM-DD HH:MM:SS".
     * 
     * @param date The date and time to set on the device, in the format "YYYY-MM-DD HH:MM:SS".
     * 
     * @returns {Promise<void>} A promise that resolves when the system time is successfully set.
     * 
     * @throws {Error} If the ADB command fails to execute.
     * 
     * @example
     * // Example of setting the system time to "2024-11-16 15:30:00"
     * import ADBHelper from 'ADBHelper';
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.deviceControl.setSystemTime("2024-11-16 15:30:00");  // Set system time
     */
    async setSystemTime(date: string): Promise<void> {
        try {
            // `date` should be in the format "YYYY-MM-DD HH:MM:SS"
            const result = await this.execCommand(`adb -s ${this.deviceId} shell date -s "${date}"`);
            console.log(`System time set to ${date}`);
        } catch (error) {
            console.error("Error setting system time:", error);
            throw error;
        }
    }

    /**
     * Sets the system time zone on the device.
     * 
     * This method sets the time zone on the device using the ADB `setprop` command. Time zone should be provided as a string like "GMT+0".
     * 
     * @param timeZone The time zone to set on the device (e.g., "GMT+0", "Asia/Kolkata").
     * 
     * @returns {Promise<void>} A promise that resolves when the time zone is successfully set.
     * 
     * @throws {Error} If the ADB command fails to execute.
     * 
     * @example
     * // Example of setting the system time zone to "Asia/Kolkata"
     * import ADBHelper from 'ADBHelper';
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.deviceControl.setTimeZone("Asia/Kolkata");  // Set system time zone
     */
    async setTimeZone(timeZone: string): Promise<void> {
        try {
            // Set the system time zone
            const result = await this.execCommand(`adb -s ${this.deviceId} shell setprop persist.sys.timezone ${timeZone}`);
            console.log(`System time zone set to ${timeZone}`);
        } catch (error) {
            console.error("Error setting time zone:", error);
            throw error;
        }
    }

    /**
     * Enables automatic time synchronization on the device.
     * 
     * This method enables the automatic synchronization of time from an NTP server.
     * 
     * @returns {Promise<void>} A promise that resolves when auto time sync is successfully enabled.
     * 
     * @throws {Error} If the ADB command fails to execute.
     * 
     * @example
     * // Example of enabling auto time sync
     * import ADBHelper from 'ADBHelper';
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.deviceControl.enableAutoTimeSync();  // Enable automatic time sync
     */
    async enableAutoTimeSync(): Promise<void> {
        try {
            // Command to enable automatic time synchronization
            const result = await this.execCommand(`adb -s ${this.deviceId} shell settings put global auto_time 1`);
            console.log("Auto time synchronization enabled");
        } catch (error) {
            console.error("Error enabling auto time sync:", error);
            throw error;
        }
    }


    /**
  * Checks if developer options are enabled on the device.
  * 
  * This method executes an ADB command to retrieve the value of the `development_settings_enabled` global setting.
  * It returns `true` if developer options are enabled, otherwise it returns `false`.
  * 
  * @returns {Promise<boolean>} A promise that resolves to `true` if developer options are enabled, otherwise `false`.
  * 
  * @throws {Error} If the ADB command fails to execute.
  * 
  * @example
  * // Example of checking if developer options are enabled
  * import ADBHelper from 'ADBHelper';
  * let adbHelper = new ADBHelper('XXXXXXXXX');
  * const isDevelopmentEnabled = await adbHelper.deviceControl.checkDevelopmentSettings();
  * console.log(isDevelopmentEnabled);  // Logs true if developer options are enabled
  */
    async checkDevelopmentSettings(): Promise<boolean> {
        try {
            // Check if developer options are enabled
            const result = await this.execCommand('adb shell settings get global development_settings_enabled');
            return result.trim() === '1';
        } catch (error) {
            console.error("Error checking development settings:", error);
            throw error;
        }
    }

    /**
     * Checks if USB debugging is enabled on the device.
     * 
     * This method executes an ADB command to retrieve the value of the `adb_enabled` global setting.
     * It returns `true` if USB debugging is enabled, otherwise it returns `false`.
     * 
     * @returns {Promise<boolean>} A promise that resolves to `true` if USB debugging is enabled, otherwise `false`.
     * 
     * @throws {Error} If the ADB command fails to execute.
     * 
     * @example
     * // Example of checking if USB debugging is enabled
     * import ADBHelper from 'ADBHelper';
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * const isAdbEnabled = await adbHelper.deviceControl.checkAdbSettings();
     * console.log(isAdbEnabled);  // Logs true if USB debugging is enabled
     */
    async checkAdbSettings(): Promise<boolean> {
        try {
            // Check if USB debugging is enabled
            const result = await this.execCommand('adb shell settings get global adb_enabled');
            return result.trim() === '1';
        } catch (error) {
            console.error("Error checking ADB settings:", error);
            throw error;
        }
    }


    /**
     * Executes an ADB shell command.
     * 
     * This method sends the given command to the ADB shell and returns the response.
     * 
     * @param {string} command The ADB shell command to execute.
     * 
     * @returns {Promise<ADBResponse>} A promise that resolves with the response from the ADB shell.
     */
    private async execCommand(command: string): Promise<ADBResponse> {
        return await ADBShell(command);
    }
}
