/**
 * PWA Install Helper
 * Handles app installation prompt and UI with improved error handling
 */

let deferredPrompt = null;

// Listen for the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing
    e.preventDefault();

    // Store the event for later use
    deferredPrompt = e;

    console.log('[PWA] Install prompt available');

    // Show install button if it exists
    showInstallButton();
});

// Show the install button
function showInstallButton() {
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
        installBtn.style.display = 'block';
        installBtn.addEventListener('click', installApp);
    }
}

// Trigger the install prompt
async function installApp() {
    if (!deferredPrompt) {
        console.log('[PWA] No install prompt available');
        return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`[PWA] User response: ${outcome}`);

    if (outcome === 'accepted') {
        console.log('[PWA] App installed successfully!');
        hideInstallButton();
        showToast('✅ G-Network installed! You can now use it like a native app.');
    }

    // Clear the deferredPrompt
    deferredPrompt = null;
}

// Hide the install button
function hideInstallButton() {
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
        installBtn.style.display = 'none';
    }
}

// Check if app is already installed
window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed');
    hideInstallButton();
    showToast('✅ G-Network installed! You can now use it like a native app.');
});

// Register service worker with improved error handling
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            // Try to register the service worker
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('[PWA] Service Worker registered:', registration.scope);

            // Handle updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker available
                            showUpdateNotification();
                        }
                    });
                }
            });

        } catch (error) {
            console.warn('[PWA] Service Worker registration failed:', error.message);
            // Gracefully degrade - app still works without service worker
            console.log('[PWA] App will work without offline capabilities');
        }
    });
} else {
    console.warn('[PWA] Service Workers not supported in this browser');
}

// Show update notification
function showUpdateNotification() {
    const updateBanner = document.createElement('div');
    updateBanner.id = 'update-banner';
    updateBanner.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--primary, #667eea);
      color: white;
      padding: 15px 25px;
      border-radius: 50px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 15px;
      animation: slideUp 0.3s ease-out;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    ">
      <span>🎉 New version available!</span>
      <button onclick="location.reload()" style="
        background: white;
        color: var(--primary, #667eea);
        border: none;
        padding: 8px 20px;
        border-radius: 20px;
        font-weight: bold;
        cursor: pointer;
        font-size: 14px;
      ">
        Update Now
      </button>
      <button onclick="this.closest('div').parentElement.remove()" style="
        background: transparent;
        color: white;
        border: none;
        font-size: 20px;
        cursor: pointer;
        padding: 0 5px;
      ">&times;</button>
    </div>
    <style>
      @keyframes slideUp {
        from { transform: translate(-50%, 100px); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
      }
    </style>
  `;
    document.body.appendChild(updateBanner);

    // Auto-remove after 30 seconds
    setTimeout(() => {
        const banner = document.getElementById('update-banner');
        if (banner) banner.remove();
    }, 30000);
}

// Utility: Show toast notification with improved styling
function showToast(message, duration = 3000, type = 'success') {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };

    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type] || colors.success};
    color: white;
    padding: 15px 25px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideInRight 0.3s ease-out;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    max-width: 350px;
  `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes fadeOut {
    to { opacity: 0; transform: translateY(-10px); }
  }
`;
document.head.appendChild(style);

// Export for use in components
export { installApp, deferredPrompt, showToast };
