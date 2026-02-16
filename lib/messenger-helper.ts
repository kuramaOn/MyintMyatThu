// Helper functions for opening Messenger from PWA

export function openMessengerWithMessage(username: string, message: string) {
  const encodedMessage = encodeURIComponent(message);
  
  // Detect platform
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isMobile = isIOS || isAndroid;
  
  // Check if running as PWA (installed app)
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                (window.navigator as any).standalone === true;
  
  console.log('Opening Messenger:', { isIOS, isAndroid, isMobile, isPWA, username });
  
  // Try different methods based on platform
  if (isMobile) {
    // Mobile: Try app deep link first, then fallback to web
    tryOpenMessengerMobile(username, encodedMessage, isIOS, isPWA);
  } else {
    // Desktop: Open web Messenger
    tryOpenMessengerDesktop(username, encodedMessage);
  }
}

function tryOpenMessengerMobile(username: string, encodedMessage: string, isIOS: boolean, isPWA: boolean) {
  // Different URL schemes for iOS and Android
  const fbMessengerScheme = `fb-messenger://user/${username}?text=${encodedMessage}`;
  const messengerScheme = `messenger://user/${username}?text=${encodedMessage}`;
  const mMeUrl = `https://m.me/${username}?text=${encodedMessage}`;
  const webUrl = `https://www.messenger.com/t/${username}?text=${encodedMessage}`;
  
  // Detect Android
  const isAndroid = /Android/.test(navigator.userAgent);
  
  console.log('Attempting to open Messenger app...');
  
  if (isIOS) {
    // iOS: Try multiple methods
    if (isPWA) {
      // In PWA, use window.open with deep link
      console.log('PWA on iOS: Trying deep link via window.open');
      const opened = window.open(fbMessengerScheme, '_blank');
      
      // Fallback to web if app didn't open
      setTimeout(() => {
        if (!opened || opened.closed) {
          console.log('Deep link failed, opening m.me');
          window.open(mMeUrl, '_blank');
        }
      }, 500);
    } else {
      // In browser, try iframe trick then fallback
      console.log('Browser on iOS: Trying iframe method');
      tryIOSDeepLink(fbMessengerScheme, mMeUrl);
    }
  } else if (isAndroid) {
    // Android: Try intent URL for better app detection
    const intentUrl = `intent://user/${username}?text=${encodedMessage}#Intent;scheme=fb-messenger;package=com.facebook.orca;end`;
    
    console.log('Android: Trying intent URL');
    
    // Try opening with intent
    window.location.href = intentUrl;
    
    // Fallback to m.me after short delay
    setTimeout(() => {
      console.log('Intent may have failed, trying m.me as backup');
      const opened = window.open(mMeUrl, '_blank');
      if (!opened || opened.closed) {
        window.open(webUrl, '_blank');
      }
    }, 1500);
  } else {
    // Other mobile platforms - use m.me
    console.log('Other mobile: Opening m.me');
    window.open(mMeUrl, '_blank');
  }
}

function tryIOSDeepLink(appUrl: string, fallbackUrl: string) {
  // Create a hidden iframe to try the app URL
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.style.width = '0';
  iframe.style.height = '0';
  document.body.appendChild(iframe);
  
  let appOpened = false;
  
  // Try to open the app
  try {
    iframe.src = appUrl;
    console.log('iOS deep link attempted via iframe');
  } catch (e) {
    console.error('Error opening deep link:', e);
  }
  
  // If app doesn't open within 1.5 seconds, open web version
  const timeout = setTimeout(() => {
    if (!appOpened) {
      console.log('App did not open, using fallback URL');
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
      window.open(fallbackUrl, '_blank');
    }
  }, 1500);
  
  // Clean up if app opened successfully
  const handleBlur = () => {
    appOpened = true;
    clearTimeout(timeout);
    console.log('App appears to have opened (window blur detected)');
    setTimeout(() => {
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
    }, 1000);
  };
  
  window.addEventListener('blur', handleBlur, { once: true });
  
  // Additional cleanup after 5 seconds
  setTimeout(() => {
    window.removeEventListener('blur', handleBlur);
    if (iframe.parentNode) {
      document.body.removeChild(iframe);
    }
  }, 5000);
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
