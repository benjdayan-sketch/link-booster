// Store shortcut in variable to avoid async storage calls on every keypress
let currentShortcut = { key: 'C', altKey: true, shiftKey: true, ctrlKey: false, metaKey: false };
let isExtensionContextValid = true;

// Safely initialize
function initContentScript() {
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id || !chrome.storage || !chrome.storage.local) {
        isExtensionContextValid = false;
        return;
    }

    try {
        chrome.storage.local.get(['shortcutKey'], (result) => {
            if (chrome.runtime.lastError) return;
            if (result.shortcutKey) currentShortcut = result.shortcutKey;
        });

        chrome.storage.onChanged.addListener((changes, namespace) => {
            if (namespace === 'local' && changes.shortcutKey) {
                currentShortcut = changes.shortcutKey.newValue;
            }
        });
    } catch (e) {
        isExtensionContextValid = false;
    }
}

initContentScript();


document.addEventListener('keydown', (e) => {
    if (!isExtensionContextValid) return;

    try {
        // Ignore input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
            return;
        }

        // Re-check ID availability
        if (!chrome.runtime?.id) {
            isExtensionContextValid = false;
            return;
        }

        const shortcut = currentShortcut;

        // Check key (case insensitive)
        const codeMatch = e.code === `Key${shortcut.key}` || e.code === shortcut.key; // Support 'KeyC' and just 'C' (rare)
        const keyMatch = e.key.toUpperCase() === shortcut.key.toUpperCase();

        if (codeMatch || keyMatch) {
            // Check modifiers strictly
            if (e.altKey === (shortcut.altKey || false) &&
                e.shiftKey === (shortcut.shiftKey || false) &&
                e.ctrlKey === (shortcut.ctrlKey || false) &&
                e.metaKey === (shortcut.metaKey || false)) {

                // Match! Send to background
                try {
                    chrome.runtime.sendMessage({ action: "shortcutTriggered" });
                } catch (sendError) {
                    console.log("Link Booster: Connection lost (reloading page might help).");
                    isExtensionContextValid = false;
                }
            }
        }
    } catch (err) {
        // Extension context invalidated
        isExtensionContextValid = false;
    }
});
