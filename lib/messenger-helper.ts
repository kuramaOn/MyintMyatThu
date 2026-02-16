// Helper functions for opening Messenger from PWA

export function openMessengerWithMessage(username: string, message: string) {
  const encodedMessage = encodeURIComponent(message);
  
  // Detect platform
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isMobile = isIOS || isAndroid;
  
  // Try different methods based on platform
  if (isMobile) {
    // Mobile: Try app deep link first, then fallback to web
    tryOpenMessengerMobile(username, encodedMessage, isIOS);
  } else {
    // Desktop: Open web Messenger
    tryOpenMessengerDesktop(username, encodedMessage);
  }
}

function tryOpenMessengerMobile(username: string, encodedMessage: string, isIOS: boolean) {
  // For iOS and Android, try to open the native Messenger app
  const appUrl = `fb-messenger://user/${username}?text=${encodedMessage}`;
  const webUrl = `https://www.messenger.com/t/${username}?text=${encodedMessage}`;
  const mMeUrl = `https://m.me/${username}?text=${encodedMessage}`;
  
  // Create a hidden iframe to try the app URL
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  document.body.appendChild(iframe);
  
  // Try to open the app
  iframe.src = appUrl;
  
  // If app doesn't open within 2 seconds, open web version
  const timeout = setTimeout(() => {
    document.body.removeChild(iframe);
    
    // Try m.me first (works best on mobile)
    const messengerWindow = window.open(mMeUrl, '_blank');
    
    // If that doesn't work, try messenger.com
    if (!messengerWindow || messengerWindow.closed) {
      window.open(webUrl, '_blank');
    }
  }, 2000);
  
  // Clean up if app opened successfully
  window.addEventListener('blur', () => {
    clearTimeout(timeout);
    setTimeout(() => {
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
    }, 1000);
  }, { once: true });
}

function tryOpenMessengerDesktop(username: string, encodedMessage: string) {
  // Desktop: Use messenger.com (better than m.me on desktop)
  const messengerUrl = `https://www.messenger.com/t/${username}?text=${encodedMessage}`;
  const mMeUrl = `https://m.me/${username}?text=${encodedMessage}`;
  
  // Try messenger.com first
  const messengerWindow = window.open(messengerUrl, '_blank', 'noopener,noreferrer');
  
  // Fallback to m.me if messenger.com blocked
  if (!messengerWindow || messengerWindow.closed) {
    window.open(mMeUrl, '_blank', 'noopener,noreferrer');
  }
}
