// Quick Service Worker Fix Script
// Run this in your browser console to fix CORS issues caused by old service workers

(async function fixServiceWorkerIssue() {
    console.log('🔧 Starting Service Worker cleanup...');

    try {
        // 1. Unregister all service workers
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            console.log(`Found ${registrations.length} service workers`);

            for (const registration of registrations) {
                console.log(`Unregistering: ${registration.scope}`);
                await registration.unregister();
            }
            console.log('✅ All service workers unregistered');
        }

        // 2. Clear all caches
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            console.log(`Found ${cacheNames.length} caches`);

            for (const cacheName of cacheNames) {
                console.log(`Deleting cache: ${cacheName}`);
                await caches.delete(cacheName);
            }
            console.log('✅ All caches cleared');
        }

        // 3. Clear storage
        localStorage.clear();
        sessionStorage.clear();
        console.log('✅ Storage cleared');

        console.log('🎉 Service Worker cleanup complete!');
        console.log('💡 Please reload the page to test API calls');

        // Test API connection
        console.log('🌐 Testing API connection...');
        try {
            const response = await fetch('http://localhost:3001/api/health');
            if (response.ok) {
                const data = await response.json();
                console.log('✅ API connection successful:', data);
                console.log('🎊 CORS issue should be fixed!');
            } else {
                console.log('⚠️ API responded with:', response.status);
            }
        } catch (error) {
            console.log('❌ API test failed:', error.message);
            console.log('💡 This might be normal if the backend is not running');
        }

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    }
})();

// Usage instructions
console.log(`
🔧 Service Worker Fix Instructions:
1. Copy and paste this entire script into your browser console
2. Press Enter to run it
3. Reload your app page
4. The CORS errors should be resolved

Alternative: Visit http://localhost:3000/unregister-sw.html for a GUI tool
`);