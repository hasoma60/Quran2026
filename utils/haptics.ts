/**
 * Haptic feedback utilities for mobile devices
 * Provides tactile feedback for user interactions
 */

// Check if vibration is supported
const isVibrationSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

// Check if reduced motion is preferred
const isReducedMotion = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Trigger a light haptic feedback
 * Used for subtle interactions like button presses
 */
export function hapticLight(): void {
    if (!isVibrationSupported || isReducedMotion()) return;
    navigator.vibrate(10);
}

/**
 * Trigger a medium haptic feedback
 * Used for more significant interactions like toggles
 */
export function hapticMedium(): void {
    if (!isVibrationSupported || isReducedMotion()) return;
    navigator.vibrate(20);
}

/**
 * Trigger a heavy haptic feedback
 * Used for important actions like confirmations
 */
export function hapticHeavy(): void {
    if (!isVibrationSupported || isReducedMotion()) return;
    navigator.vibrate([30, 50, 30]);
}

/**
 * Trigger a success haptic pattern
 * Used for successful operations
 */
export function hapticSuccess(): void {
    if (!isVibrationSupported || isReducedMotion()) return;
    navigator.vibrate([10, 30, 10]);
}

/**
 * Trigger an error haptic pattern
 * Used for errors or warnings
 */
export function hapticError(): void {
    if (!isVibrationSupported || isReducedMotion()) return;
    navigator.vibrate([50, 30, 50]);
}

/**
 * Trigger a selection change haptic
 * Used when selecting items
 */
export function hapticSelection(): void {
    if (!isVibrationSupported || isReducedMotion()) return;
    navigator.vibrate(5);
}

/**
 * Trigger an impact haptic
 * Used for physical-feeling interactions
 */
export function hapticImpact(): void {
    if (!isVibrationSupported || isReducedMotion()) return;
    navigator.vibrate(15);
}
