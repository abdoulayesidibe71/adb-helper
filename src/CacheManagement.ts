import { UIHierarchy } from './types';

export default class CacheManagement {
    protected cachedScreenHierarchy: UIHierarchy[] | null = null; // Stocker la hiérarchie
    protected cachedElement: UIHierarchy | null = null; // Stocker l'élément trouvé
    protected cachedScreenResolution: { width: number; height: number } | null = null; // Cache pour la résolution
    protected currentActivity: string | null = null;

/**
 * Getter for the screen hierarchy cache.
 * 
 * This method returns the cached screen hierarchy, which is a list of UIHierarchy objects.
 * 
 * @returns {UIHierarchy[] | null} The cached screen hierarchy, or null if no data is cached.
 */
protected get cachedScreenHierarchyValue(): UIHierarchy[] | null {
    return this.cachedScreenHierarchy;
}

/**
 * Setter for the screen hierarchy cache.
 * 
 * This method sets the cached screen hierarchy with a list of UIHierarchy objects.
 * 
 * @param {UIHierarchy[] | null} value The new value to set for the cached screen hierarchy, or null to clear it.
 */
protected set cachedScreenHierarchyValue(value: UIHierarchy[] | null) {
    this.cachedScreenHierarchy = value;
}

/**
 * Getter for the cached element.
 * 
 * This method returns the cached element, which is a single UIHierarchy object.
 * 
 * @returns {UIHierarchy | null} The cached UIHierarchy element, or null if no element is cached.
 */
protected get cachedElementValue(): UIHierarchy | null {
    return this.cachedElement;
}

/**
 * Setter for the cached element.
 * 
 * This method sets the cached element with a UIHierarchy object.
 * 
 * @param {UIHierarchy | null} value The new value to set for the cached element, or null to clear it.
 */
protected set cachedElementValue(value: UIHierarchy | null) {
    this.cachedElement = value;
}

/**
 * Getter for the current activity.
 * 
 * This method returns the current activity as a string.
 * 
 * @returns {string | null} The current activity, or null if no activity is set.
 */
protected get currentActivityValue(): string | null {
    return this.currentActivity;
}

/**
 * Setter for the current activity.
 * 
 * This method sets the current activity with a string value.
 * 
 * @param {string | null} value The new value to set for the current activity, or null to clear it.
 */
protected set currentActivityValue(value: string | null) {
    this.currentActivity = value;
}

}
