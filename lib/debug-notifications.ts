// Debug helper for notification issues in PWA

export function debugNotificationSetup() {
  const checks = {
    serviceWorkerSupported: 'serviceWorker' in navigator,
    notificationSupported: 'Notification' in window,
    notificationPermission: typeof Notification !== 'undefined' ? Notification.permission : 'unsupported',
    isPWA: window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone,
    userAgent: navigator.userAgent,
  };

  console.log('🔍 Notification Debug Info:', checks);
  
  // Check SSE connection
  if (typeof EventSource !== 'undefined') {
    console.log('✅ EventSource (SSE) supported');
  } else {
    console.log('❌ EventSource (SSE) NOT supported');
  }

  return checks;
}

export function testNotificationSound() {
  console.log('🔊 Testing notification sound...');
  try {
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.7;
    audio.play()
      .then(() => console.log('✅ Sound played successfully'))
      .catch((error) => console.error('❌ Sound play failed:', error));
  } catch (error) {
    console.error('❌ Sound test failed:', error);
  }
}
