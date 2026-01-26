// QR Code Detector
let isQrEnabled = false;
let tooltip = null;
let currentHoveredImg = null;

// Initialize settings
function initQrDetector() {
    chrome.storage.local.get(['qrDetectionEnabled'], (result) => {
        isQrEnabled = result.qrDetectionEnabled !== false; // Default to true if not set, or change to false based on preference
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.qrDetectionEnabled) {
            isQrEnabled = changes.qrDetectionEnabled.newValue;
        }
    });
}

initQrDetector();

// Tooltip State
let hideTimer = null;

// Tooltip Management
function createTooltip() {
    if (tooltip) return tooltip;

    tooltip = document.createElement('div');
    tooltip.className = 'lb-qr-tooltip';
    tooltip.style.display = 'none';

    // Prevent tooltip from disappearing when hovering over it
    tooltip.addEventListener('mouseenter', () => {
        if (hideTimer) clearTimeout(hideTimer);
    });

    tooltip.addEventListener('mouseleave', () => {
        // When leaving tooltip, start timer to hide
        hideTimer = setTimeout(() => {
            if (currentHoveredImg && currentHoveredImg.matches(':hover')) return;
            hideTooltip();
        }, 500);
    });

    document.body.appendChild(tooltip);
    return tooltip;
}

function showTooltip(text, x, y) {
    const tip = createTooltip();

    // Sanitize text slightly for display
    const safeText = text.replace(/[<>]/g, '');
    const logoSrc = chrome.runtime.getURL('assets/icons/icon48.png');

    // Check system preference for theme (or use extension storage if we want to sync)
    // For now, let's use system preference to match 'popup' feeling on the web page context
    // or we can read from storage. Let's read from storage to be consistent with extension settings.

    // We need to fetch theme sync or default to system
    // Since this is sync, let's default to dark for now or check system media query
    const isSystemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    // We can also try to read from storage asynchronously but tooltip creation is synchronous-ish here.
    // Let's just use a default and update it if we can, or just use system preference for the content script UI.
    // User requested "choice of the user", which implies the extension setting.
    // We'll trust the checked 'theme' from storage if available, else system.

    chrome.storage.local.get(['theme'], (res) => {
        const theme = res.theme || (isSystemDark ? 'dark' : 'light');
        tip.setAttribute('data-theme', theme);
    });

    tip.innerHTML = `
        <div class="lb-qr-tooltip-content">
            <div class="lb-qr-header">
                <img src="${logoSrc}" class="lb-qr-logo" alt="">
                <span class="lb-qr-title">Link Detected</span>
            </div>
            
            <button class="lb-qr-btn lb-qr-btn-primary lb-qr-btn-boost" id="lb-qr-boost" style="margin-bottom: 4px;">
                <img src="${logoSrc}" style="width:14px; height:14px; filter: brightness(0) invert(1);" alt="">
                Copy Boosted Link
            </button>

            <div class="lb-qr-actions">
                <button class="lb-qr-btn lb-qr-btn-secondary" id="lb-qr-visit">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    Visit
                </button>
                <button class="lb-qr-btn lb-qr-btn-secondary" id="lb-qr-copy">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    Copy
                </button>
            </div>
            <div class="lb-qr-link" title="${safeText.replace(/"/g, '&quot;')}">${safeText}</div>
        </div>
    `;

    // Add event listeners
    const boostBtn = tip.querySelector('#lb-qr-boost');
    const visitBtn = tip.querySelector('#lb-qr-visit');
    const copyBtn = tip.querySelector('#lb-qr-copy');

    boostBtn.onclick = (e) => {
        e.stopPropagation();
        const originalContent = boostBtn.innerHTML;
        boostBtn.textContent = 'Boosting...';

        chrome.runtime.sendMessage({
            action: 'BOOST_LINK',
            url: text,
            title: "QR Code" // Maybe use current page title or "QR Code"
        }, (response) => {
            if (response && response.success) {
                // Background handles copy & toast, but we can update button locally too
                boostBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Boosted!
                `;
                boostBtn.classList.add('success-state');
                setTimeout(() => {
                    boostBtn.innerHTML = originalContent;
                    boostBtn.classList.remove('success-state');
                }, 2000);
            } else {
                boostBtn.textContent = 'Error';
                setTimeout(() => boostBtn.innerHTML = originalContent, 2000);
            }
        });
    };

    visitBtn.onclick = (e) => {
        e.stopPropagation();
        window.open(text, '_blank');
        hideTooltip();
    };

    copyBtn.onclick = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text).then(() => {
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Copied!
            `;
            copyBtn.classList.add('success-state');
            setTimeout(() => {
                copyBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    Copy
                `;
                copyBtn.classList.remove('success-state');
            }, 2000);
        });
    };

    // Position
    tip.style.left = `${x}px`;
    tip.style.top = `${y}px`;
    tip.style.display = 'block';

    // Adjust if off-screen
    const rect = tip.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
        tip.style.left = `${window.innerWidth - rect.width - 10}px`;
    }
    if (rect.bottom > window.innerHeight) {
        tip.style.top = `${y - rect.height - 10}px`;
    }
}

function hideTooltip() {
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

// Image Processing
const processedImages = new WeakMap(); // Cache results: img element -> text or null

async function scanImageForQr(img) {
    // Debug log
    if (typeof jsQR === 'undefined') {
        console.error('Link Booster: jsQR library not found!');
        return null;
    }

    if (processedImages.has(img)) {
        return processedImages.get(img);
    }

    // Skip if image is too small or hidden
    if (img.width < 50 || img.height < 50 || img.style.display === 'none' || img.style.visibility === 'hidden') {
        processedImages.set(img, null);
        return null;
    }

    try {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        // Draw image to canvas
        // Note: This will fail with a SecurityError if the image is cross-origin and no CORS headers are present.
        context.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        // Use jsQR
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
            console.log('Link Booster: QR Code Detected!', code.data);
            processedImages.set(img, code.data);
            return code.data;
        } else {
            // console.log('Link Booster: No QR found in image.');
        }
    } catch (e) {
        // Fallback: Try fetching via background script (CORS bypass)
        // Only try this if it likely failed due to CORS or if we haven't tried yet

        // Avoid infinite loops or re-fetching same failed img too often? 
        // We use the same cache (processedImages) but maybe we need a 'pending' state?
        // For now, let's try-catch the background fetch

        console.log("Link Booster: Direct scan failed (likely CORS), trying background fetch...", img.src);

        try {
            const dataUrl = await new Promise((resolve) => {
                chrome.runtime.sendMessage({ action: 'FETCH_IMAGE_FOR_QR', url: img.src }, (response) => {
                    if (response && response.success) {
                        resolve(response.dataUrl);
                    } else {
                        resolve(null);
                    }
                });
            });

            if (dataUrl) {
                const fetchedImg = new Image();
                fetchedImg.onload = () => {
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = fetchedImg.width;
                    canvas.height = fetchedImg.height;
                    context.drawImage(fetchedImg, 0, 0);
                    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height);
                    if (code) {
                        console.log('Link Booster: QR Code Detected via Background!', code.data);
                        // We can't update the cache synchronously here easily for the *original* caller
                        // But we can trigger the tooltip manually or update cache for next hover
                        processedImages.set(img, code.data);

                        // If user is still hovering, show it!
                        if (currentHoveredImg === img) {
                            const rect = img.getBoundingClientRect();
                            const x = rect.left + window.scrollX + (rect.width / 2) - 150;
                            const y = rect.bottom + window.scrollY + 10;
                            showTooltip(code.data, Math.max(10, x), y);
                        }
                    } else {
                        processedImages.set(img, null);
                    }
                };
                fetchedImg.src = dataUrl;
                // Wait for onload? this scanImageForQr is async, so we can await a promise wrapper around onload
                await new Promise(r => fetchedImg.onload = r);
                // Return result if found in cache now
                return processedImages.get(img);
            }
        } catch (bgErr) {
            console.error('Link Booster: Background fetch failed too', bgErr);
        }
    }

    processedImages.set(img, null);
    return null;
}

// Event Listeners
document.addEventListener('mouseover', async (e) => {
    if (e.target.tagName === 'IMG') {
        if (hideTimer) clearTimeout(hideTimer); // Cancel pending hide if we re-entered an image

        if (!isQrEnabled) {
            // console.log('Link Booster: Hovered IMG but QR detection disabled.');
            return;
        }

        currentHoveredImg = e.target;

        // Wait minor delay to be sure user is intending to hover? Maybe not for now.
        const qrData = await scanImageForQr(e.target);

        if (qrData && currentHoveredImg === e.target) {
            // Position tooltip relative to mouse or image?
            // Image bottom-left or simply near mouse cursor
            const rect = e.target.getBoundingClientRect();
            // Show at bottom center of image, adjusted for scroll
            const x = rect.left + window.scrollX + (rect.width / 2) - 150; // Centered (approx 300px width)
            const y = rect.bottom + window.scrollY + 10;

            showTooltip(qrData, Math.max(10, x), y);
        }
    }
});

// Hide valid tooltip if mouse leaves image AND doesn't enter tooltip
document.addEventListener('mouseout', (e) => {
    if (e.target.tagName === 'IMG' || (tooltip && tooltip.contains(e.target))) {
        // Clear any existing timer to avoid double-firing
        if (hideTimer) clearTimeout(hideTimer);

        // Give a generous grace period to enter tooltip or re-enter image
        hideTimer = setTimeout(() => {
            // Check if we are hovering the tooltip OR the original image
            if (tooltip && tooltip.matches(':hover')) return;
            if (currentHoveredImg && currentHoveredImg.matches(':hover')) return;

            hideTooltip();
            currentHoveredImg = null;
        }, 600);
    }
});
