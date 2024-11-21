import * as fs from 'fs';

import ADB from './ABD';
import { SharedCacheManager } from './CacheManager';

/**
 * Class to manage various application-related functionalities, such as interacting with apps via ADB, 
 * managing UI elements, and checking UI element attributes.
 * 
 * This class provides methods to get current screen opened activity, open an application, list installed app on android, clear application data, install or uninstall an application and others.
 * It uses ADB commands to communicate with Android devices and also caches UI element data for quick reference.
 * 
 * 
 * @note Although this class can be used independently, it is primarily designed to be used as part of the ADBHelper class. 
 * When used within ADBHelper, it is instantiated and managed as part of the broader Android device application management.
 * 
 * @param {string} deviceId The unique identifier for the Android device.
 * 
 * @example
 * // Using AppManagement independently:
 * let deviceId = "XXXXXXXXXXXXX";
 * const appManager = new AppManagement(deviceId);
 * await appManager.openApp('com.example.app');
 * const currentScreenActivity = await appManager.getCurrentScreenActivity('');
 * 
 * @example
 * // Using AppManagement within ADBHelper:
 * const adbHelper = new ADBHelper("device123");
 * await adbHelper.appManagement.openApp('com.example.app');
 * const activities = await adbHelper.appManagement.getCurrentScreenActivity('');
 */
export class AppManagement extends ADB{
    protected deviceId: string;
    constructor(deviceId: string) {
        super()
        this.deviceId = deviceId;
    }


    /**
     * Gets the currently displayed activity on the device.
     * 
     * This method executes an ADB command to retrieve information about the current activities on the device.
     * It extracts the name of the activity currently in the foreground and returns it.
     * 
     * @returns {Promise<string>} A promise that resolves to the name of the activity currently in the foreground.
     * 
     * @throws {Error} If there is an issue retrieving the current activity or if no activity is found.
     * 
     * @example
     * // Example of getting the current screen activity
     * const {ADBHelper} = require('adb-helper');
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * const currentActivity = await adbHelper.appManagement.getCurrentScreenActivity();
     * console.log(currentActivity);  // Logs the current activity in the foreground
     */
    async getCurrentScreenActivity(): Promise<string> {
        try {
            // Execute the ADB command to retrieve the current activity info
            const result = await this.execCommand(`adb -s ${this.deviceId} shell dumpsys activity activities`);

            // Search for the line containing the activity in the foreground
            const match = result.match(/mCurrentFocus=Window{[^}]+ u0 ([^}]+)}/);

            if (match && match[1]) {
                const currentActivity = match[1];
                console.log(`Current activity: ${currentActivity}`);

                // Save the result to a file for verification (optional)
                // const fs = fs;
                fs.writeFileSync("C:\\My Project\\adb-helper\\current_activity.txt", result, 'utf8');

                console.log(currentActivity);
                SharedCacheManager.setCurrentActivityValue = currentActivity
                return currentActivity;
            } else {
                throw new Error('No current activity found.');
            }
        } catch (error) {
            console.error('Error retrieving current activity:', error);
            throw error;
        }
    }


    /**
     * Opens an application using the package name.
     * 
     * This method executes an ADB command to open the specified application on the device using its package name.
     * 
     * @param {string} packageName The package name of the application to be opened.
     * 
     * @returns {Promise<void>} A promise that resolves when the application is successfully opened.
     * 
     * @throws {Error} If there is an issue opening the application.
     * 
     * @example
     * // Example of opening an app by its package name
     * const {ADBHelper} = require('adb-helper');
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.appManagement.openApp('com.example.app');
     * console.log('App opened successfully.');
     */
    async openApp(packageName: string): Promise<void> {
        try {
            // Command to launch the application using its package name
            await this.execCommand(`adb -s ${this.deviceId} shell monkey -p ${packageName} -c android.intent.category.LAUNCHER 1`);
            console.log(`Application ${packageName} launched successfully.`);
        } catch (error) {
            console.error(`Error opening application ${packageName}:`, error);
            throw error;
        }
    }

    /**
     * Lists installed applications on the device with optional filters.
     * 
     * This method executes an ADB command to list installed applications based on the specified filter.
     * 
     * @param {('enabled' | 'disabled' | 'system' | 'user' | string)} [filterType] The type of filter to apply:
     *                        'enabled' : enabled apps,
     *                        'disabled' : disabled apps,
     *                        'system' : system apps,
     *                        'user' : user-installed apps,
     *                        or a specific package name to filter by.
     * 
     * @returns {Promise<string[]>} A promise that resolves to an array containing the package names of installed apps matching the filter.
     * 
     * @throws {Error} If there is an issue retrieving the list of installed apps.
     * 
     * @example
     * // Example of listing user-installed apps
     * const {ADBHelper} = require('adb-helper');
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * const apps = await adbHelper.appManagement.getInstalledApps('user');
     * console.log('User-installed apps:', apps);
     */
    async getInstalledApps(filterType?: 'enabled' | 'disabled' | 'system' | 'user' | string): Promise<string[]> {
        try {
            // Build the command based on the filter
            let command = `adb -s ${this.deviceId} shell pm list packages`;

            if (filterType === 'enabled') {
                command += ' -e';  // List enabled apps
            } else if (filterType === 'disabled') {
                command += ' -d';  // List disabled apps
            } else if (filterType === 'system') {
                command += ' -s';  // List system apps
            } else if (filterType === 'user') {
                command += ' -3';  // List user-installed apps
            } else if (filterType) {
                command += ` | grep ${filterType}`;  // Custom filter (e.g., package name)
            }

            // Execute the command
            const result = await this.execCommand(command);

            // Process the output to get the package names
            const packages = result.split('\n').map(line => line.replace('package:', '').trim());

            console.log(`Installed apps (${filterType || 'all'}):`, packages);
            return packages;
        } catch (error) {
            console.error("Error retrieving installed apps:", error);
            throw error;
        }
    }

    /**
     * Clears data of a specified app.
     * 
     * This method executes an ADB command to clear the data of a specified app, which will reset the app's settings, cache, and files.
     * 
     * @param {string} packageName The package name of the app whose data is to be cleared.
     * 
     * @returns {Promise<void>} A promise that resolves when the app data is cleared.
     * 
     * @throws {Error} If there is an issue clearing the app data.
     * 
     * @example
     * // Example of clearing app data
     * const {ADBHelper} = require('adb-helper');
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.appManagement.clearAppData('com.example.app');
     * console.log('App data cleared.');
     */
    async clearAppData(packageName: string): Promise<void> {
        try {
            // Clear the app data
            await this.execCommand(`adb -s ${this.deviceId} shell pm clear ${packageName}`);
            console.log(`Data for app ${packageName} cleared.`);
        } catch (error) {
            console.error("Error clearing app data:", error);
            throw error;
        }
    }


    /**
     * Installs an APK file on the device with optional configurations.
     * 
     * This method executes an ADB command to install an APK file on the device with customizable options.
     * 
     * @param {string} apkPath The path to the APK file to be installed.
     * @param {Object} options Optional configuration for the installation.
     * @param {boolean} [options.replace] Whether to replace an existing app (default is false).
     * @param {boolean} [options.allowDowngrade] Whether to allow downgrading the app version (default is false).
     * @param {boolean} [options.grantPermissions] Whether to automatically grant app permissions (default is false).
     * @param {boolean} [options.installToSD] Whether to install the app to the SD card (default is false).
     * 
     * @returns {Promise<void>} A promise that resolves when the app is installed successfully.
     * 
     * @throws {Error} If there is an issue installing the app.
     * 
     * @example
     * // Example of installing an APK with options
     * const {ADBHelper} = require('adb-helper');
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.appManagement.installApp('/path/to/app.apk', { replace: true, grantPermissions: true });
     * console.log('App installed successfully.');
     */
    async installApp(apkPath: string, options: { replace?: boolean, allowDowngrade?: boolean, grantPermissions?: boolean, installToSD?: boolean }): Promise<void> {
        try {
            // Build the ADB command with the selected options
            let command = `adb -s ${this.deviceId} install`;

            if (options.replace) {
                command += " -r"; // Replace existing app
            }

            if (options.allowDowngrade) {
                command += " -d"; // Allow downgrades
            }

            if (options.grantPermissions) {
                command += " -g"; // Grant permissions automatically
            }

            if (options.installToSD) {
                command += " -s"; // Install to SD card
            }

            command += ` ${apkPath}`; // Add the APK file path

            // Execute the installation command
            await this.execCommand(command);
            console.log(`App installed successfully: ${apkPath}`);
        } catch (error) {
            console.error("Error installing app:", error);
            throw error;
        }
    }

    /**
     * Uninstalls a specified app from the device with optional data retention.
     * 
     * This method executes an ADB command to uninstall an app, and optionally keep its data.
     * 
     * @param {string} packageName The package name of the app to uninstall.
     * @param {Object} options Optional configuration for the uninstallation.
     * @param {boolean} [options.keepData] Whether to retain app data after uninstallation (default is false).
     * 
     * @returns {Promise<void>} A promise that resolves when the app is uninstalled successfully.
     * 
     * @throws {Error} If there is an issue uninstalling the app.
     * 
     * @example
     * // Example of uninstalling an app with data retention
     * const {ADBHelper} = require('adb-helper');
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.appManagement.uninstallApp('com.example.app', { keepData: true });
     * console.log('App uninstalled successfully.');
     */
    async uninstallApp(packageName: string, options: { keepData?: boolean }): Promise<void> {
        try {
            let command = `adb -s ${this.deviceId} uninstall ${packageName}`;

            if (options.keepData) {
                command += " -k"; // Keep app data
            }

            await this.execCommand(command);
            console.log(`App ${packageName} uninstalled successfully.`);
        } catch (error) {
            console.error("Error uninstalling app:", error);
            throw error;
        }
    }

    /**
     * Disables a specified app on the device.
     * 
     * This method executes an ADB command to disable an app, making it inactive but not uninstalling it.
     * 
     * @param {string} packageName The package name of the app to disable.
     * 
     * @returns {Promise<void>} A promise that resolves when the app is disabled successfully.
     * 
     * @throws {Error} If there is an issue disabling the app.
     * 
     * @example
     * // Example of disabling an app
     * const {ADBHelper} = require('adb-helper');
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.appManagement.disableApp('com.example.app');
     * console.log('App disabled successfully.');
     */
    async disableApp(packageName: string): Promise<void> {
        try {
            const command = `adb -s ${this.deviceId} shell pm disable-user --user 0 ${packageName}`;
            await this.execCommand(command);
            console.log(`App ${packageName} disabled successfully.`);
        } catch (error) {
            console.error("Error disabling app:", error);
            throw error;
        }
    }

    /**
     * Enables a previously disabled app on the device.
     * 
     * This method executes an ADB command to enable an app that was previously disabled.
     * 
     * @param {string} packageName The package name of the app to enable.
     * 
     * @returns {Promise<void>} A promise that resolves when the app is enabled successfully.
     * 
     * @throws {Error} If there is an issue enabling the app.
     * 
     * @example
     * // Example of enabling a disabled app
     * const {ADBHelper} = require('adb-helper');
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.appManagement.enableApp('com.example.app');
     * console.log('App enabled successfully.');
     */
    async enableApp(packageName: string): Promise<void> {
        try {
            const command = `adb -s ${this.deviceId} shell pm enable ${packageName}`;
            await this.execCommand(command);
            console.log(`App ${packageName} enabled successfully.`);
        } catch (error) {
            console.error("Error enabling app:", error);
            throw error;
        }
    }







    /**
     * Retrieves the granted permissions of a specified app.
     * 
     * This method executes an ADB command to retrieve the list of permissions granted to a specified app.
     * 
     * @param {string} packageName The package name of the app whose granted permissions are to be retrieved.
     * 
     * @returns {Promise<string[]>} A promise that resolves to an array containing granted permissions.
     * 
     * @throws {Error} If there is an issue retrieving the granted permissions.
     * 
     * @example
     * // Example of retrieving granted permissions for an app
     * const {ADBHelper} = require('adb-helper');
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * const grantedPermissions = await adbHelper.appManagement.getGrantedPermissions('com.example.app');
     * console.log('Granted permissions:', grantedPermissions);
     */
    async getGrantedPermissions(packageName: string): Promise<string[]> {
        try {
            const command = `adb -s ${this.deviceId} shell dumpsys package ${packageName}`;
            const result = await this.execCommand(command);

            const grantedPermissions = result.split('\n')
                .filter(line => line.includes('granted=true'))
                .map(line => line.trim());

            console.log("Granted permissions:", grantedPermissions);
            return grantedPermissions;
        } catch (error) {
            console.error("Error retrieving granted permissions:", error);
            throw error;
        }
    }

    /**
     * Retrieves permissions of a specified app based on the specified status.
     * 
     * This method executes an ADB command to retrieve all, granted, or denied permissions for a specified app.
     * 
     * @param {string} packageName The package name of the app whose permissions are to be retrieved.
     * @param {'all' | 'granted' | 'denied'} [status='all'] The status of permissions to retrieve:
     *                  'all' : All permissions,
     *                  'granted' : Granted permissions,
     *                  'denied' : Denied permissions.
     * 
     * @returns {Promise<string[]>} A promise that resolves to an array containing the permissions matching the specified status.
     * 
     * @throws {Error} If there is an issue retrieving the permissions.
     * 
     * @example
     * // Example of retrieving all permissions for an app
     * const {ADBHelper} = require('adb-helper');
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * const allPermissions = await adbHelper.appManagement.getAppPermissions('com.example.app', 'all');
     * console.log('All permissions:', allPermissions);
     */
    async getAppPermissions(packageName: string, status: 'all' | 'granted' | 'denied' = "all"): Promise<string[]> {
        try {
            const command = `adb -s ${this.deviceId} shell dumpsys package ${packageName}`;
            const result = await this.execCommand(command);

            let permissions: string[] = [];

            // Extraire les permissions demandées ("requested permissions") et installées ("install permissions")
            const requestedPermissionsMatch = result.match(/requested permissions:(\s+.+)+/g);
            const installPermissionsMatch = result.match(/install permissions:(\s+.+)+/g);

            let requestedPermissions = requestedPermissionsMatch
                ? requestedPermissionsMatch[0].split('\n').slice(1).map(line => line.trim())
                : [];
            let installPermissions = installPermissionsMatch
                ? installPermissionsMatch[0].split('\n').slice(1).map(line => line.trim())
                : [];

            if (status === 'all') {
                permissions = [...requestedPermissions, ...installPermissions];
            } else if (status === 'granted') {
                permissions = installPermissions.filter(line => line.includes('granted=true')).map(line => line.split(':')[0].trim());
            } else if (status === 'denied') {
                permissions = installPermissions.filter(line => line.includes('granted=false')).map(line => line.split(':')[0].trim());
            }

            console.log(`${status.charAt(0).toUpperCase() + status.slice(1)} permissions:`, permissions);
            return permissions;
        } catch (error) {
            console.error("Error retrieving permissions:", error);
            throw error;
        }
    }


    /**
     * Grants a specified permission to an app.
     * 
     * This method executes an ADB command to grant a specified permission to an app.
     * 
     * @param {string} packageName The package name of the app to which the permission is to be granted.
     * @param {string} permission The permission to grant.
     * 
     * @returns {Promise<void>} A promise that resolves when the permission is granted.
     * 
     * @throws {Error} If there is an issue granting the permission.
     * 
     * @example
     * // Example of granting a permission to an app
     * const {ADBHelper} = require('adb-helper');
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.appManagement.grantPermission('com.example.app', 'android.permission.CAMERA');
     * console.log('Permission granted.');
     */
    async grantPermission(packageName: string, permission: string): Promise<void> {
        try {
            const command = `adb shell pm grant ${packageName} ${permission}`;
            await this.execCommand(command);
            console.log(`Granted permission: ${permission}`);
        } catch (error) {
            console.error(`Error granting permission: ${error}`);
            throw error;
        }
    }

    /**
     * Revokes a specified permission from an app.
     * 
     * This method executes an ADB command to revoke a specified permission from an app.
     * 
     * @param {string} packageName The package name of the app from which the permission is to be revoked.
     * @param {string} permission The permission to revoke.
     * 
     * @returns {Promise<void>} A promise that resolves when the permission is revoked.
     * 
     * @throws {Error} If there is an issue revoking the permission.
     * 
     * @example
     * // Example of revoking a permission from an app
     * const {ADBHelper} = require('adb-helper');
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.appManagement.revokePermission('com.example.app', 'android.permission.CAMERA');
     * console.log('Permission revoked.');
     */
    async revokePermission(packageName: string, permission: string): Promise<void> {
        try {
            const command = `adb shell pm revoke ${packageName} ${permission}`;
            await this.execCommand(command);
            console.log(`Revoked permission: ${permission}`);
        } catch (error) {
            console.error(`Error revoking permission: ${error}`);
            throw error;
        }
    }

    /**
     * Checks if a specified app is installed on the device.
     * 
     * This method executes an ADB command to list installed packages and checks if the specified app's package name is present.
     * 
     * @param {string} packageName The package name of the app to check for installation.
     * 
     * @returns {Promise<boolean>} A promise that resolves to a boolean indicating if the app is installed.
     * 
     * @throws {Error} If there is an issue checking the installation status.
     * 
     * @example
     * // Example of checking if an app is installed
     * const {ADBHelper} = require('adb-helper');
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * const isInstalled = await adbHelper.appManagement.isAppInstalled('com.example.app');
     * console.log('App installed:', isInstalled);
     */
    async isAppInstalled(packageName: string): Promise<boolean> {
        try {
            const result = await this.execCommand(`adb shell pm list packages`);
            const isInstalled = result.includes(`package:${packageName}`);

            console.log(isInstalled ? `The app ${packageName} is installed.` : `The app ${packageName} is not installed.`);
            return isInstalled;
        } catch (error) {
            console.error(`Error checking app installation: ${error}`);
            throw error;
        }
    }

    /**
     * Force stops a specified app.
     * 
     * This method executes an ADB command to force stop an app using its package name.
     * 
     * @param {string} packageName The package name of the app to force stop.
     * 
     * @returns {Promise<void>} A promise that resolves when the app is successfully stopped.
     * 
     * @throws {Error} If there is an issue stopping the app.
     * 
     * @example
     * // Example of force stopping an app
     * const {ADBHelper} = require('adb-helper');
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.appManagement.forceStopApp('com.example.app');
     * console.log('App force stopped.');
     */
    async forceStopApp(packageName: string): Promise<void> {
        try {
            await this.execCommand(`adb shell am force-stop ${packageName}`);
            console.log(`The app ${packageName} has been successfully stopped.`);
        } catch (error) {
            console.error(`Error force stopping app ${packageName}:`, error);
            throw error;
        }
    }


    /**
     * Launches a URL in the default browser or a specific app on the device.
     * 
     * This method executes an ADB command to open a specified URL on the device. 
     * It also allows specifying an app package to open the URL in that app.
     * 
     * @param {string} url The URL to open.
     * @param {string} [packageName] The package name of the app to handle the URL (optional).
     * 
     * @returns {Promise<void>} A promise that resolves when the URL is successfully opened.
     * 
     * @throws {Error} If there is an issue opening the URL.
     * 
     * @example
     * // Example of launching a URL in the default browser
     * const {ADBHelper} = require('adb-helper');
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.appManagement.launchURL('https://example.com');
     * console.log('URL launched.');
     * 
     * // Example of launching a URL in WhatsApp
     * await adbHelper.appManagement.launchURL('https://web.whatsapp.com/send/?phone=221771370101&text=Hello', 'com.whatsapp');
     */
    async launchURL(url: string, packageName?: string): Promise<void> {
        try {
            // Ensure the URL is properly escaped for the shell
            const escapedUrl = encodeURI(url);

            // Construct the ADB command
            let command = `adb shell am start -a android.intent.action.VIEW -d "${escapedUrl}"`;

            // If a specific package is provided, modify the command to use that package
            if (packageName) {
                command = `adb shell am start -n ${packageName}/.MainActivity -a android.intent.action.VIEW -d "${escapedUrl}"`;
            }

            // Execute the command
            await this.execCommand(command);
            console.log(`The URL ${url} has been successfully opened.`);
        } catch (error) {
            console.error(`Error opening URL ${url}:`, error);
            throw error;
        }
    }


    /**
     * Launches an app's activity with specified extras.
     * 
     * This method executes an ADB command to launch a specified activity within an app, passing additional key-value data.
     * 
     * @param {string} packageName The package name of the app.
     * @param {string} activityName The name of the activity to launch within the app.
     * @param {{ [key: string]: any }} extras A key-value object of extras to pass to the activity.
     * 
     * @returns {Promise<void>} A promise that resolves when the activity is launched.
     * 
     * @throws {Error} If there is an issue launching the activity with extras.
     * 
     * @example
     * // Example of launching an activity with extras
     * const {ADBHelper} = require('adb-helper');
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.appManagement.launchActivityWithExtras('com.example.app', '.MainActivity', { key1: 'value1', key2: 'value2' });
     * console.log('Activity launched with extras.');
     */
    async launchActivityWithExtras(packageName: string, activityName: string, extras: { [key: string]: any }): Promise<void> {
        try {
            let extrasString = '';
            for (const [key, value] of Object.entries(extras)) {
                extrasString += `--es ${key} "${value}" `;
            }

            await this.execCommand(`adb shell am start -n ${packageName}/${activityName} ${extrasString}`);
            console.log(`Activity ${activityName} launched with extras.`);
        } catch (error) {
            console.error(`Error launching activity ${activityName} with extras:`, error);
            throw error;
        }
    }

    /**
     * Disables notifications for a specified app.
     * 
     * This method executes an ADB command to disable notifications for an app.
     * 
     * @param {string} packageName The package name of the app for which to disable notifications.
     * 
     * @returns {Promise<void>} A promise that resolves when notifications are disabled.
     * 
     * @throws {Error} If there is an issue disabling notifications.
     * 
     * @example
     * // Example of disabling notifications for an app
     * const {ADBHelper} = require('adb-helper');
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.appManagement.disableAppNotifications('com.example.app');
     * console.log('Notifications disabled.');
     */
    async disableAppNotifications(packageName: string): Promise<void> {
        try {
            await this.execCommand(`adb shell pm set-app-notification-level ${packageName} 0`);
            console.log(`Notifications have been disabled for app: ${packageName}`);
        } catch (error) {
            console.error(`Error disabling notifications for app ${packageName}:`, error);
        }
    }

    /**
     * Enables notifications for a specified app.
     * 
     * This method executes an ADB command to enable notifications for an app.
     * 
     * @param {string} packageName The package name of the app for which to enable notifications.
     * 
     * @returns {Promise<void>} A promise that resolves when notifications are enabled.
     * 
     * @throws {Error} If there is an issue enabling notifications.
     * 
     * @example
     * // Example of enabling notifications for an app
     * const {ADBHelper} = require('adb-helper');
     * let adbHelper = new ADBHelper('XXXXXXXXX');
     * await adbHelper.appManagement.enableAppNotifications('com.example.app');
     * console.log('Notifications enabled.');
     */
    async enableAppNotifications(packageName: string): Promise<void> {
        try {
            await this.execCommand(`adb shell pm set-app-notification-level ${packageName} 1`);
            console.log(`Notifications have been enabled for app: ${packageName}`);
        } catch (error) {
            console.error(`Error enabling notifications for app ${packageName}:`, error);
        }
    }

    /**
     * Modify a parameter in the SharedPreferences of an application
     * @param packageName The package name of the application
     * @param key The key of the parameter to modify
     * @param value The value to set for the parameter
     */
    async modifySharedPreferences(packageName: string, key: string, value: string): Promise<void> {
        try {
            const sharedPreferencesPath = `/data/data/${packageName}/shared_prefs/${packageName}_preferences.xml`;
            const setValueCommand = `adb shell 'echo "<map><entry key=\\"${key}\\" value=\\"${value}\\"/></map>" > ${sharedPreferencesPath}'`;

            // Execute the command to modify the SharedPreferences
            await this.execCommand(setValueCommand);
            console.log(`The value of ${key} has been modified in the shared preferences of ${packageName}`);
        } catch (error) {
            console.error(`Error modifying the shared preferences of the application ${packageName}:`, error);
        }
    }

    /**
     * Send an Intent to activate a feature in the app
     * @param intentAction The action of the Intent to send
     */
    async sendIntentToApp(intentAction: string): Promise<void> {
        try {
            // Send an Intent to activate a specific feature in the app
            await this.execCommand(`adb shell am broadcast -a ${intentAction}`);
            console.log(`Intent ${intentAction} sent successfully.`);
        } catch (error) {
            console.error(`Error sending the Intent ${intentAction}:`, error);
        }
    }

    /**
     * List the activities of a given application via ADB
     * @param packageName The package name of the application
     */
    async listAppActivities(packageName: string): Promise<string[]> {
        try {
            // Execute the adb command to get package information
            const result = await this.execCommand(`adb shell dumpsys package ${packageName}`);

            // Extract all lines containing activities
            const activities = result.split("\n").filter(line => line.includes("activity"));

            console.log(result)
            console.log(`Activities of the application ${packageName}:`);

            // Display each activity
            activities.forEach(activity => {
                console.log(activity.trim());
            });

            return activities
        } catch (error) {

            console.error(`Error retrieving activities for the application ${packageName}:`, error);
            return [];
        }
    }

    /**
     * List the processes running on the Android device.
     */
    async listProcesses(): Promise<string | null> {
        try {
            // Execute the adb command to list the running processes
            const result = await this.execCommand("adb shell ps -A");

            console.log("List of running processes:");

            // Display the retrieved processes
            console.log(result);
            return result
        } catch (error) {
            console.error("Error retrieving the list of running processes:", error);
            throw error
        }
    }
}
