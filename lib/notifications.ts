// Notification utility functions for admin panel

/**
 * Request permission for browser notifications
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.log("Browser doesn't support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

/**
 * Show browser notification
 */
export function showNotification(title: string, options?: NotificationOptions) {
  if (!("Notification" in window)) {
    console.log("Browser doesn't support notifications");
    return;
  }

  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      ...options,
    });

    // Auto-close after 10 seconds
    setTimeout(() => notification.close(), 10000);

    return notification;
  }
}

/**
 * Play notification sound
 */
export function playNotificationSound() {
  try {
    // Use custom notification sound
    const audio = new Audio("/notification.mp3");
    audio.volume = 0.7; // Set volume to 70%
    audio.play().catch((error) => {
      console.error("Error playing notification sound:", error);
      // Fallback to generated beep if audio file fails
      playFallbackBeep();
    });
  } catch (error) {
    console.error("Error playing notification sound:", error);
    // Fallback to generated beep
    playFallbackBeep();
  }
}

/**
 * Fallback beep sound using Web Audio API
 */
function playFallbackBeep() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.error("Error playing fallback beep:", error);
  }
}

/**
 * Check if notifications are supported
 */
export function isNotificationSupported(): boolean {
  return "Notification" in window;
}

/**
 * Get notification permission status
 */
export function getNotificationPermission(): NotificationPermission | null {
  if (!("Notification" in window)) {
    return null;
  }
  return Notification.permission;
}
