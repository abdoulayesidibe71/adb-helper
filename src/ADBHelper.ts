import ADB from './ABD';
import { AppManagement } from './AppManagement';
import { DeviceControl } from './DeviceControl';
import Screen from './Screen';
import { ScreenInteractions } from './ScreenInteractions';
import { UIAttributes } from './UIAttributes';

/**
 * ADBHelper class provides an abstraction layer to interact with an Android device
 * via ADB (Android Debug Bridge). It includes various helpers to manage apps, control devices,
 * interact with screens, and access UI elements.
 * 
 * @class ADBHelper
 * @extends ADB
 * @example
 * const adbHelper = new ADBHelper("device123");
 * adbHelper.deviceControl.checkDevice(); // Control the device
 * adbHelper.appManagement.getCurrentScreenActivity(); // List app activities
 * adbHelper.screenInteractions.swipe(0, 0, 100, 100, 500); // Perform screen swipe
 * 
 * @property {DeviceControl} deviceControl Instance of the DeviceControl class, used to control the device.
 * @property {AppManagement} appManagement Instance of the AppManagement class, used for app-related operations.
 * @property {ScreenInteractions} screenInteractions Instance of the ScreenInteractions class, used for screen actions.
 * @property {Screen} screen Instance of the Screen class, used for managing screen operations.
 * @property {UIAttributes} uiAttributes Instance of the UIAttributes class, used to interact with UI elements.
 */
export default class ADBHelper extends ADB {
  protected deviceId: string;
  public deviceControl: DeviceControl;
  public appManagement: AppManagement;
  public screenInteractions: ScreenInteractions;
  public screen: Screen;
  public uiAttributes: UIAttributes;

  /**
   * Creates an instance of ADBHelper.
   * 
   * @param {string} deviceId The unique identifier for the Android device.
   * @constructor
   */
  constructor(deviceId: string) {
    super();
    this.deviceId = deviceId;
    this.deviceControl = new DeviceControl(deviceId);
    this.appManagement = new AppManagement(deviceId);
    this.screenInteractions = new ScreenInteractions(deviceId);
    this.screen = new Screen(deviceId);
    this.uiAttributes = new UIAttributes(deviceId);
  }
}
