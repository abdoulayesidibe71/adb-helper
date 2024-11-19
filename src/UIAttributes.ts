import ADB from './ABD';
import { SharedCacheManager } from './CacheManager';

export interface UIHierarchy {
  checkable?: boolean;
  checked?: boolean;
  clickable?: boolean;
  enabled?: boolean;
  focusable?: boolean;
  focused?: boolean;
  scrollable?: boolean;
  "long-clickable"?: boolean;
  password?: boolean;
  selected?: boolean;
}

/**
 * Class responsible for handling various screen interactions on an Android device via ADB.
 * This class includes methods to check if element is clickable, selected, focusable and others.
 * 
 * @extends ADB
 * 
 * @note While this class can be used independently, it is primarily designed to be used within the context of the ADBHelper class.
 * It is instantiated and managed as part of the ADBHelper for easier management of Android UI attribute.
 * 
 * @param {deviceId} string  The unique identifier for the Android device.
 * 
 * @example
 * // Using UIAttributes independently:
 * const {UIAttributes} = require('adb-helper')
 * let deviceId = "XXXXXXXXXXXX";
 * const uiAttributes = new UIAttributes(deviceId);
 * await uiAttributes.isCheckable();
 * 
 * @example
 * // Using UIAttributes within ADBHelper:
 * const {ADBHelper} = require('adb-helper')
 * const adbHelper = new ADBHelper("device123");
 * await adbHelper.uiAttributes.isCheckable(;
 */
export class UIAttributes extends ADB {
  private deviceId: string;
  constructor(deviceId: string) {
    super()
    this.deviceId = deviceId;
  }

  /**
   * Generic method to check if a specific attribute exists and is set to `true` on a given UI element.
   * @param attribute The attribute name to check (e.g., 'clickable', 'enabled', etc.).
   * @param element The UI element to check. If not provided, the method uses the cached element.
   * @returns `true` if the attribute exists and is set to `true`, `false` if the attribute exists and is set to `false`, or `null` if the element is not found or the attribute does not exist.
   * @example
   * // Check if the element is clickable
   * const {ADBHelper} = require('adb-helper')
   * const adbHelper = new ADBHelper("device123");
   * const isClickable = adbHelper.uiAttributes.isClickable();
   */
  private checkAttribute(attribute: "checkable" |
    "checked" |
    "clickable" |
    "enabled" |
    "focusable" |
    "focused" |
    "scrollable" |
    "long-clickable" |
    "password" |
    "selected", element?: UIHierarchy): boolean | null {
    if (SharedCacheManager.getCachedElementValue == null || SharedCacheManager.getCachedElementValue == undefined && element == null || element == undefined) {
      console.log("No element found in cache.");
      return null; // Cache is empty
    }
    const elementToCheck = element || SharedCacheManager.getCachedElementValue as UIHierarchy;

    if (!elementToCheck) {
      console.log("No element found in cache.");
      return null; // Cache is empty
    }

    if (elementToCheck[attribute] !== undefined) {
      return elementToCheck[attribute] === true;
    }

    console.log(`The attribute "${attribute}" does not exist on the element.`);
    return null;
  }

  /**
   * Checks if the given UI element is checkable.
   * @param element The UI element to check. If not provided, the method uses the cached element.
   * @returns `true` if the element is checkable, `false` if it is not, or `null` if the attribute is not available.
   * @example
   * // Check if the element is checkable
   * const {ADBHelper} = require('adb-helper')
  * const adbHelper = new ADBHelper("device123");
   * const isCheckable = adbHelper.uiAttributes.isCheckable();
   */
  isCheckable(element?: UIHierarchy): boolean | null {
    return this.checkAttribute('checkable', element);
  }

  /**
   * Checks if the given UI element is checked.
   * @param element The UI element to check. If not provided, the method uses the cached element.
   * @returns `true` if the element is checked, `false` if it is not, or `null` if the attribute is not available.
   * @example
   * // Check if the element is checked
   * const {ADBHelper} = require('adb-helper')
   * const adbHelper = new ADBHelper("device123");
   * const isChecked = adbHelper.uiAttributes.checkChecked();
   */
  checkChecked(element?: UIHierarchy): boolean | null {
    return this.checkAttribute('checked', element);
  }

  /**
   * Checks if the given UI element is clickable.
   * @param element The UI element to check. If not provided, the method uses the cached element.
   * @returns `true` if the element is clickable, `false` if it is not, or `null` if the attribute is not available.
   * @example
   * // Check if the element is clickable
   * const {ADBHelper} = require('adb-helper')
   * const adbHelper = new ADBHelper("device123");
   * const isClickable = adbHelper.uiAttributes.isClickable();
   */
  isClickable(element?: UIHierarchy): boolean | null {
    return this.checkAttribute('clickable', element);
  }

  /**
   * Checks if the given UI element is enabled.
   * @param element The UI element to check. If not provided, the method uses the cached element.
   * @returns `true` if the element is enabled, `false` if it is not, or `null` if the attribute is not available.
   * @example
   * // Check if the element is enabled
   * const {ADBHelper} = require('adb-helper')
   * const adbHelper = new ADBHelper("device123");
   * const isEnabled = adbHelper.uiAttributes.isEnabled();
   */
  isEnabled(element?: UIHierarchy): boolean | null {
    return this.checkAttribute('enabled', element);
  }

  /**
   * Checks if the given UI element is focusable.
   * @param element The UI element to check. If not provided, the method uses the cached element.
   * @returns `true` if the element is focusable, `false` if it is not, or `null` if the attribute is not available.
   * @example
   * // Check if the element is focusable
   * const {ADBHelper} = require('adb-helper')
   * const adbHelper = new ADBHelper("device123");
   * const isFocusable = adbHelper.uiAttributes.isFocusable();
   */
  isFocusable(element?: UIHierarchy): boolean | null {
    return this.checkAttribute('focusable', element);
  }

  /**
   * Checks if the given UI element is currently focused.
   * @param element The UI element to check. If not provided, the method uses the cached element.
   * @returns `true` if the element is focused, `false` if it is not, or `null` if the attribute is not available.
   * @example
   * // Check if the element is focused
   * const {ADBHelper} = require('adb-helper')
   * const adbHelper = new ADBHelper("device123");
   * const isFocused = adbHelper.uiAttributes.isFocused();
   */
  isFocused(element?: UIHierarchy): boolean | null {
    return this.checkAttribute('focused', element);
  }

  /**
   * Checks if the given UI element is scrollable.
   * @param element The UI element to check. If not provided, the method uses the cached element.
   * @returns `true` if the element is scrollable, `false` if it is not, or `null` if the attribute is not available.
   * @example
   * // Check if the element is scrollable
   * const {ADBHelper} = require('adb-helper')
   * const adbHelper = new ADBHelper("device123");
   * const isScrollable = adbHelper.uiAttributes.isScrollable();
   */
  isScrollable(element?: UIHierarchy): boolean | null {
    return this.checkAttribute('scrollable', element);
  }

  /**
   * Checks if the given UI element is long-clickable.
   * @param element The UI element to check. If not provided, the method uses the cached element.
   * @returns `true` if the element is long-clickable, `false` if it is not, or `null` if the attribute is not available.
   * @example
   * // Check if the element is long-clickable
   * const {ADBHelper} = require('adb-helper')
   * const adbHelper = new ADBHelper("device123");
   * const isLongClickable = adbHelper.uiAttributes.isLongClickable();
   */
  isLongClickable(element?: UIHierarchy): boolean | null {
    return this.checkAttribute('long-clickable', element);
  }

  /**
   * Checks if the given UI element is a password field.
   * @param element The UI element to check. If not provided, the method uses the cached element.
   * @returns `true` if the element is a password field, `false` if it is not, or `null` if the attribute is not available.
   * @example
   * // Check if the element is a password field
   * const {ADBHelper} = require('adb-helper')
   * const adbHelper = new ADBHelper("device123");
   * const isPassword = adbHelper.uiAttributes.isPassword();
   */
  isPassword(element?: UIHierarchy): boolean | null {
    return this.checkAttribute('password', element);
  }

  /**
   * Checks if the given UI element is selected.
   * @param element The UI element to check. If not provided, the method uses the cached element.
   * @returns `true` if the element is selected, `false` if it is not, or `null` if the attribute is not available.
   * @example
   * // Check if the element is selected
   * const {ADBHelper} = require('adb-helper')
   * const adbHelper = new ADBHelper("device123");
   * const isSelected = adbHelper.uiAttributes.isSelected();
   */
  isSelected(element?: UIHierarchy): boolean | null {
    return this.checkAttribute('selected', element);
  }
}
