document.addEventListener('DOMContentLoaded', () => {
    const decodedToggle = document.getElementById('decoded-toggle');
    const cleanToggle = document.getElementById('clean-toggle');
    const socialToggle = document.getElementById('social-toggle');
    const utmToggle = document.getElementById('utm-toggle');
    const shortenToggle = document.getElementById('shorten-toggle');
    const utmAccordion = document.getElementById('utm-accordion');
    const themeToggle = document.getElementById('theme-toggle');

    // UTM Inputs
    const utmInputs = {
        source: document.getElementById('utm-source'),
        medium: document.getElementById('utm-medium'),
        campaign: document.getElementById('utm-campaign'),
        id: document.getElementById('utm-id'),
        term: document.getElementById('utm-term'),
        content: document.getElementById('utm-content')
    };

    const presetSelector = document.getElementById('preset-selector');
    const savePresetBtn = document.getElementById('save-preset-btn');

    const copyBtn = document.getElementById('copy-btn');
    const statusMsg = document.getElementById('status-msg');
    const shortcutInput = document.getElementById('shortcut-input');
    let qr; // Store SVG/QR instance globally for download

    // Theme UI Updater (Shared)
    const updateThemeUI = (isDark) => {
        document.body.classList.toggle('dark-mode', isDark);

        const themeIcon = document.getElementById('theme-toggle');
        if (themeIcon) {
            if (isDark) {
                // Sun
                themeIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
            } else {
                // Moon
                themeIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
            }
        }

        const logoImg = document.querySelector('.header img');
        if (logoImg) {
            logoImg.src = isDark ? 'assets/link-booster-logo-dark.png' : 'assets/link-booster-logo-clean.png';
        }
    };

    // Load settings
    chrome.storage.local.get(['decodedMode', 'cleanMode', 'socialMode', 'utmMode', 'shortenMode', 'utmParams', 'shortcutKey', 'theme', 'qrSettings'], (result) => {
        // Theme
        const isDark = (result.theme !== undefined) ? (result.theme === 'dark') : true; // Default to dark
        updateThemeUI(isDark);

        // Toggles
        decodedToggle.checked = result.decodedMode !== undefined ? result.decodedMode : true;
        cleanToggle.checked = result.cleanMode || false;
        socialToggle.checked = result.socialMode || false;
        utmToggle.checked = result.utmMode || false;
        shortenToggle.checked = result.shortenMode || false;

        // UTM Params
        if (result.utmParams) {
            if (result.utmParams.source) utmInputs.source.value = result.utmParams.source;
            if (result.utmParams.medium) utmInputs.medium.value = result.utmParams.medium;
            if (result.utmParams.campaign) utmInputs.campaign.value = result.utmParams.campaign;
            if (result.utmParams.id) utmInputs.id.value = result.utmParams.id;
            if (result.utmParams.term) utmInputs.term.value = result.utmParams.term;
            if (result.utmParams.content) utmInputs.content.value = result.utmParams.content;
        }

        // Initialize Accordion State
        if (utmToggle.checked) {
            utmAccordion.classList.add('open');
        }

        // Load shortcut
        if (result.shortcutKey) {
            const parts = [];
            if (result.shortcutKey.ctrlKey) parts.push("Ctrl");
            if (result.shortcutKey.altKey) parts.push("Alt");
            if (result.shortcutKey.shiftKey) parts.push("Shift");
            if (result.shortcutKey.metaKey) parts.push("Cmd");
            parts.push(result.shortcutKey.key.toUpperCase());
            shortcutInput.value = parts.join("+");
        }

        // Settings loaded.
        // Wait a small moment to ensure layout is settled before fading in
        setTimeout(() => {
            document.body.classList.remove('preload');
            const settingsDiv = document.querySelector('.settings');
            if (settingsDiv) settingsDiv.classList.add('visible');

            // Enable animations ONLY NOW
            const sliders = document.querySelectorAll('.slider');
            sliders.forEach(s => s.classList.add('animated'));
        }, 100);

        // Global QR Settings
        window.qrSettings = result.qrSettings || {
            foreground: "#000000",
            background: "#ffffff",
            noLogo: false,
            logoDataUrl: null
        };
    });

    // Save settings (Toggles)
    const saveSettings = () => {
        chrome.storage.local.set({
            decodedMode: decodedToggle.checked,
            cleanMode: cleanToggle.checked,
            socialMode: socialToggle.checked,
            utmMode: utmToggle.checked,
            shortenMode: shortenToggle.checked
        });
    };

    decodedToggle.addEventListener('change', saveSettings);
    cleanToggle.addEventListener('change', saveSettings);
    socialToggle.addEventListener('change', saveSettings);
    shortenToggle.addEventListener('change', saveSettings);

    if (themeToggle) {
        // Click Handler
        themeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark-mode');
            const nextState = !isDark;
            // UI update happens via storage listener if we want sync, OR we update immediately for responsiveness
            // Let's update immediately AND save.
            updateThemeUI(nextState);
            chrome.storage.local.set({ theme: nextState ? 'dark' : 'light' });
        });
    }

    // Storage Listener for external theme changes
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.theme) {
            const isDark = changes.theme.newValue === 'dark';
            updateThemeUI(isDark);
        }
    });

    // UTM Toggle & Save Logic
    utmToggle.addEventListener('change', () => {
        saveSettings();
        if (utmToggle.checked) {
            utmAccordion.classList.add('open');
            // Give focus to first empty input? optional
        } else {
            utmAccordion.classList.remove('open');
        }
    });

    // Save UTM Inputs (Auto-save)
    const saveUtmParams = () => {
        const params = {
            source: utmInputs.source.value.trim(),
            medium: utmInputs.medium.value.trim(),
            campaign: utmInputs.campaign.value.trim(),
            id: utmInputs.id.value.trim(),
            term: utmInputs.term.value.trim(),
            content: utmInputs.content.value.trim()
        };
        chrome.storage.local.set({ utmParams: params });
    };

    Object.values(utmInputs).forEach(input => {
        input.addEventListener('input', saveUtmParams);
    });

    // Shortcut Recorder logic
    shortcutInput.addEventListener('click', () => {
        shortcutInput.focus();
        shortcutInput.select(); // Highlight text to indicate override
    });

    shortcutInput.addEventListener('focus', () => {
        shortcutInput.select();
    });

    shortcutInput.addEventListener('keydown', (e) => {
        // ... (existing helper) ...
        e.preventDefault();
        e.stopPropagation();

        // Ignore standalone modifier presses
        if (["Control", "Alt", "Shift", "Meta"].includes(e.key)) return;

        const key = e.key.length === 1 ? e.key.toUpperCase() : e.code.replace("Key", "");

        const shortcut = {
            key: key,
            altKey: e.altKey,
            shiftKey: e.shiftKey,
            ctrlKey: e.ctrlKey,
            metaKey: e.metaKey
        };

        // Save
        chrome.storage.local.set({ shortcutKey: shortcut });

        // Update Display
        const parts = [];
        if (shortcut.ctrlKey) parts.push("Ctrl");
        if (shortcut.altKey) parts.push("Alt");
        if (shortcut.shiftKey) parts.push("Shift");
        if (shortcut.metaKey) parts.push("Cmd");
        parts.push(key);
        shortcutInput.value = parts.join("+");
    });

    // Option: Open History
    const historyBtn = document.getElementById('history-btn');
    if (historyBtn) {
        historyBtn.addEventListener('click', () => {
            if (chrome.runtime.openOptionsPage) {
                chrome.runtime.openOptionsPage();
            } else {
                window.open(chrome.runtime.getURL('options.html'));
            }
        });
    }

    // Option: Open Analytics
    const analyticsBtn = document.getElementById('analytics-btn');
    if (analyticsBtn) {
        analyticsBtn.addEventListener('click', () => {
            window.open(chrome.runtime.getURL('dashboard.html'));
        });
    }

    // Option: Open Learn
    const learnLink = document.getElementById('learn-utm-link');
    if (learnLink) {
        learnLink.addEventListener('click', (e) => {
            e.preventDefault();
            chrome.tabs.create({ url: "options.html#learn" });
        });
    }

    // Helper: CleanUrl
    const cleanUrl = (url) => {
        try {
            const urlObj = new URL(url);
            const trackingParams = [
                "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
                "fbclid", "gclid", "ref", "source", "igshid", "yclid", "_ga"
            ];
            trackingParams.forEach(param => urlObj.searchParams.delete(param));
            return urlObj.toString();
        } catch (e) {
            return url;
        }
    };

    // Helper: Append UTMs
    const appendUtm = (url, params) => {
        if (!params) return url;
        try {
            const urlObj = new URL(url);
            if (params.source) urlObj.searchParams.set("utm_source", params.source);
            if (params.medium) urlObj.searchParams.set("utm_medium", params.medium);
            if (params.campaign) urlObj.searchParams.set("utm_campaign", params.campaign);
            if (params.term) urlObj.searchParams.set("utm_term", params.term);
            if (params.content) urlObj.searchParams.set("utm_content", params.content);
            return urlObj.toString();
        } catch (e) {
            return url;
        }
    };

    // Helper: Add to History
    const addToHistory = (record) => {
        chrome.storage.local.get(['linkHistory'], (result) => {
            const history = result.linkHistory || [];
            history.push(record);
            if (history.length > 50) history.shift();
            chrome.storage.local.set({ linkHistory: history });
        });
    };

    // Helper: Extract meaningful alias from URL or Title
    const extractSlug = (url, title) => {
        try {
            const candidates = [];

            // 1. Path Segment (e.g. /product/cool-shoes -> cool-shoes)
            try {
                const path = new URL(url).pathname;
                const decodedPath = decodeURIComponent(path);
                const segments = decodedPath.split('/').filter(s => s && s !== 'index.html');
                if (segments.length > 0) {
                    candidates.push(segments[segments.length - 1]);
                }
            } catch (e) { }

            // 2. Title (e.g. "Cool Shoes | Brand" -> "cool-shoes")
            if (title) {
                const shortTitle = title.split(/ [|\-–—:] /)[0].trim();
                candidates.push(shortTitle);
            }

            for (let raw of candidates) {
                if (!raw) continue;
                let slug = raw.toString().replace(/\.[^/.]+$/, ""); // Rm extension
                slug = slug.toLowerCase();
                slug = slug.replace(/[^a-z0-9]/g, "-"); // Sanitize
                slug = slug.replace(/-+/g, "-").replace(/^-|-$/g, ""); // Clean dashes

                if (slug.length >= 3) {
                    if (slug.length > 30) slug = slug.substring(0, 30);
                    return slug;
                }
            }
            return null;
        } catch (e) { return null; }
    };

    // Helper: Shorten URL (TinyURL)
    const shortenUrl = async (url, title = "") => {
        try {
            let apiUrl = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`;

            // Attempt Auto-Alias
            const slug = extractSlug(url, title);
            if (slug) {
                // Add random suffix to improve success rate (e.g. "my-page-xy7z")
                const suffix = Math.random().toString(36).substring(2, 6);
                apiUrl += `&alias=${slug}-${suffix}`;
            }

            console.log("Fetching TinyURL:", apiUrl);
            let response = await fetch(apiUrl);
            let text = response.ok ? await response.text() : "";

            if (response.ok && text.startsWith("http")) {
                console.log("Shortened:", text);
                return text;
            }

            // Retry without alias if failed
            if (slug) {
                console.log("Alias taken/failed, retrying standard...");
                const padding = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
                if (padding.ok) return await padding.text();
            }

            return url;
        } catch (e) {
            console.error("Shortener Fetch Error:", e);
            return url;
        }
    };

    // Helper: Get Final Processed Link
    const getFinalLink = async () => {
        return new Promise((resolve) => {
            chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
                if (!tabs[0]) return resolve(null);

                const sToggle = document.getElementById('shorten-toggle');
                const config = {
                    decoded: decodedToggle.checked,
                    clean: cleanToggle.checked,
                    social: socialToggle.checked,
                    utm: utmToggle.checked,
                    shorten: sToggle ? sToggle.checked : false
                };

                let textToCopy = tabs[0].url;

                // Clean
                if (config.clean) {
                    textToCopy = cleanUrl(textToCopy);
                }

                // Append UTMs
                let utmData = null;
                if (config.utm) {
                    const params = {
                        source: utmInputs.source.value.trim(),
                        medium: utmInputs.medium.value.trim(),
                        campaign: utmInputs.campaign.value.trim(),
                        term: utmInputs.term.value.trim(),
                        content: utmInputs.content.value.trim()
                    };
                    utmData = params;
                    textToCopy = appendUtm(textToCopy, params);
                }

                // Shorten OR Decode
                if (config.shorten) {
                    statusMsg.textContent = "Shortening...";
                    const originalUrl = textToCopy;
                    textToCopy = await shortenUrl(textToCopy, tabs[0].title);

                    if (textToCopy === originalUrl) {
                        console.error("Shortener returned original URL");
                        statusMsg.textContent = "Shorten Failed! Using original...";
                    }
                } else if (config.decoded) {
                    textToCopy = decodeURIComponent(textToCopy);
                }

                resolve({
                    finalUrl: textToCopy,
                    originalUrl: tabs[0].url,
                    title: tabs[0].title,
                    tabId: tabs[0].id,
                    config: config,
                    utmData: utmData
                });
            });
        });
    };

    // Copy Action
    copyBtn.addEventListener('click', async () => {
        statusMsg.textContent = "Processing...";
        const result = await getFinalLink();
        if (!result) return;

        navigator.clipboard.writeText(result.finalUrl)
            .then(() => {
                statusMsg.textContent = "Copied!";

                // Tell Background to show UI
                chrome.runtime.sendMessage({
                    action: "copyFromPopup",
                    tabId: result.tabId,
                    url: result.finalUrl,
                    decoded: false,
                    clean: false,
                    social: result.config.social,
                    suppressCopy: true,
                    title: result.title,
                    originalUrl: result.originalUrl
                });

                // Save to History
                if (result.config.utm || result.config.shorten) {
                    addToHistory({
                        timestamp: Date.now(),
                        title: result.title,
                        originalUrl: result.originalUrl,
                        finalUrl: result.finalUrl,
                        utm: result.config.utm ? result.utmData : null,
                        shortened: result.config.shorten
                    });
                }

                setTimeout(() => window.close(), 1000);
            })
            .catch(err => {
                console.error("Copy Error", err);
                statusMsg.textContent = "Error";
            });
    });

    // QR Action
    const qrBtn = document.getElementById('qr-btn');
    const qrOverlay = document.getElementById('qr-overlay');
    const closeQr = document.getElementById('close-qr');
    const qrcodeContainer = document.getElementById('qrcode');
    const qrUrl = document.getElementById('qr-url');

    qrBtn.addEventListener('click', async () => {
        statusMsg.textContent = "Generating...";
        const result = await getFinalLink();
        if (!result) return;

        qrcodeContainer.innerHTML = "";
        try {
            // Ensure URL is properly encoded for the QR code (so it's recognized as a link)
            // even if the user selected "Decoded" mode.
            const qrText = new URL(result.finalUrl).toString();

            // Apply Settings
            const set = window.qrSettings || {};
            const fg = set.foreground || "#000000";
            const bg = set.background || "#ffffff";

            qr = new QRCode(qrcodeContainer, {
                text: qrText,
                width: 180,
                height: 180,
                colorDark: fg,
                colorLight: bg,
                correctLevel: QRCode.CorrectLevel.L
            });

            // Update Logo Overlay
            const qrLogo = document.querySelector('.qr-logo');
            if (qrLogo) {
                if (set.noLogo) {
                    qrLogo.style.display = 'none';
                } else {
                    qrLogo.style.display = 'block';
                    if (set.logoDataUrl) {
                        qrLogo.src = set.logoDataUrl;
                    } else {
                        qrLogo.src = "assets/icons/icon48.png";
                    }
                    // Apply styles dynamically if needed, but CSS handles centering.
                    // The border color in CSS determines the box look. 
                    // To match options page perfectly we might want to change bg of logo to match QR bg?
                    qrLogo.style.backgroundColor = bg;
                }
            }

            // We need to update the <img> tag if qrcode.js generated one for fallback
            // But since we are not modifying the canvas anymore, standard generation is enough.
            // We just ensure the logo overlay is visible via CSS.

            qrUrl.textContent = result.finalUrl; // Keep display text as user preference (e.g. decoded)
            qrOverlay.style.display = 'flex';
            statusMsg.textContent = "";

            // Save to History for QR as well
            addToHistory({
                timestamp: Date.now(),
                title: result.title,
                originalUrl: result.originalUrl,
                finalUrl: result.finalUrl,
                utm: result.config.utm ? result.utmData : null,
                shortened: result.config.shorten,
                type: 'qr'
            });

        } catch (e) {
            console.error(e);
            statusMsg.textContent = "QR Error";
        }
    });

    closeQr.addEventListener('click', () => {
        qrOverlay.style.display = 'none';
        statusMsg.textContent = "";
    });

    // --- Presets Logic ---

    const loadPresets = () => {
        chrome.storage.local.get(['utmPresets'], (result) => {
            const presets = result.utmPresets || [];
            presetSelector.innerHTML = '<option value="">Select Preset...</option>';
            presets.forEach((p, index) => {
                const opt = document.createElement('option');
                opt.value = index;
                opt.textContent = p.name;
                presetSelector.appendChild(opt);
            });
        });
    };

    // Modal Elements
    const presetModal = document.getElementById('preset-modal');
    const presetNameInput = document.getElementById('preset-name-input');
    const cancelPresetBtn = document.getElementById('cancel-preset');
    const confirmPresetBtn = document.getElementById('confirm-preset');
    const deletePresetBtn = document.getElementById('delete-preset-btn');

    savePresetBtn.addEventListener('click', () => {
        const source = utmInputs.source.value.trim();
        const medium = utmInputs.medium.value.trim();
        const campaign = utmInputs.campaign.value.trim();

        if (!source && !medium && !campaign) {
            showStatus("Enter UTM params first!", "error");
            return;
        }

        // Show Modal
        presetNameInput.value = "";
        presetModal.style.display = 'flex';
        presetNameInput.focus();
    });

    const closePresetModal = () => {
        presetModal.style.display = 'none';
    };

    cancelPresetBtn.addEventListener('click', closePresetModal);

    confirmPresetBtn.addEventListener('click', () => {
        const name = presetNameInput.value.trim();
        if (!name) {
            alert("Please enter a name");
            return;
        }

        chrome.storage.local.get(['utmPresets'], (result) => {
            const presets = result.utmPresets || [];
            presets.push({
                name,
                source: utmInputs.source.value.trim(),
                medium: utmInputs.medium.value.trim(),
                campaign: utmInputs.campaign.value.trim(),
                term: utmInputs.term.value.trim(),
                content: utmInputs.content.value.trim()
            });
            chrome.storage.local.set({ utmPresets: presets }, () => {
                loadPresets();
                showStatus("Preset saved!");
                closePresetModal();
            });
        });
    });

    // Close on bg click
    presetModal.addEventListener('click', (e) => {
        if (e.target === presetModal) closePresetModal();
    });

    presetSelector.addEventListener('change', () => {
        const index = presetSelector.value;
        if (index === "") {
            // Hide delete button if no preset selected
            if (deletePresetBtn) deletePresetBtn.style.display = 'none';
            return;
        }

        // Show delete button
        if (deletePresetBtn) {
            deletePresetBtn.style.display = 'flex';
            deletePresetBtn.style.color = '#ff7675'; // Ensure specific style
            deletePresetBtn.style.borderColor = '#fab1a0';
        }

        chrome.storage.local.get(['utmPresets'], (result) => {
            const presets = result.utmPresets || [];
            const p = presets[index];
            if (p) {
                utmInputs.source.value = p.source || "";
                utmInputs.medium.value = p.medium || "";
                utmInputs.campaign.value = p.campaign || "";
                utmInputs.term.value = p.term || "";
                utmInputs.content.value = p.content || "";
                saveInputs(); // Save to storage as current selection
                showStatus("Preset loaded");
            }
        });
    });

    // Confirm Modal Logic
    const confirmModal = document.getElementById('confirm-modal');
    const cancelConfirmBtn = document.getElementById('cancel-confirm');
    const okConfirmBtn = document.getElementById('ok-confirm');

    const closeConfirmModal = () => {
        if (confirmModal) confirmModal.style.display = 'none';
    };

    if (cancelConfirmBtn) cancelConfirmBtn.addEventListener('click', closeConfirmModal);
    if (confirmModal) confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) closeConfirmModal();
    });

    if (okConfirmBtn) {
        okConfirmBtn.addEventListener('click', () => {
            const index = presetSelector.value;
            if (index === "") { closeConfirmModal(); return; }

            chrome.storage.local.get(['utmPresets'], (result) => {
                const presets = result.utmPresets || [];
                presets.splice(index, 1); // Remove
                chrome.storage.local.set({ utmPresets: presets }, () => {
                    loadPresets();
                    if (deletePresetBtn) deletePresetBtn.style.display = 'none';
                    showStatus("Preset deleted");
                    closeConfirmModal();
                });
            });
        });
    }

    if (deletePresetBtn) {
        deletePresetBtn.addEventListener('click', () => {
            const index = presetSelector.value;
            if (index === "") return;
            if (confirmModal) confirmModal.style.display = 'flex';
        });
    }

    loadPresets();

    // Manual Decoder
    const manualDecodeBtn = document.getElementById('manual-decode-btn');
    const decoderInput = document.getElementById('decoder-input');

    if (manualDecodeBtn && decoderInput) {
        manualDecodeBtn.addEventListener('click', () => {
            const text = decoderInput.value.trim();
            if (!text) {
                showStatus('Paste a link first', 'error');
                return;
            }

            try {
                // Do a clean URL if possible? The user said "decode".
                // We'll simplisticly decode.
                const decoded = decodeURIComponent(text);
                if (decoded === text) {
                    showStatus('Link is already decoded');
                } else {
                    decoderInput.value = decoded;
                    showStatus('Decoded!');
                }
            } catch (e) {
                showStatus('Decoding failed', 'error');
            }
        });
    }

    // Helper: Download Image
    function downloadImage(dataUrl, filename) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Download PNG
    document.getElementById('download-png').addEventListener('click', () => {
        const canvas = qrcodeContainer.querySelector('canvas');
        if (!canvas) return;

        const set = window.qrSettings || {};
        const bg = set.background || "#ffffff";

        // Create a new canvas to composite QR + Logo for download
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = canvas.width;
        finalCanvas.height = canvas.height;
        const ctx = finalCanvas.getContext('2d');

        // Draw QR
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        ctx.drawImage(canvas, 0, 0);

        const finishPng = () => {
            downloadImage(finalCanvas.toDataURL("image/png"), "qr-code.png");
        };

        // Draw Logo
        if (!set.noLogo) {
            const logoImg = new Image();
            logoImg.onload = () => {
                const logoSize = 48; // Standard size from CSS
                const x = (finalCanvas.width - logoSize) / 2;
                const y = (finalCanvas.height - logoSize) / 2;

                // Draw bg for logo
                ctx.fillStyle = bg;
                // Match CSS border radius look roughly (rect)
                ctx.fillRect(x, y, logoSize, logoSize);

                // Draw cyan border (Stroke)
                ctx.strokeStyle = "#25D6D7";
                ctx.lineWidth = 3;
                ctx.strokeRect(x, y, logoSize, logoSize);

                // Draw Logo Image
                const padding = 6;
                ctx.drawImage(logoImg, x + padding, y + padding, logoSize - (padding * 2), logoSize - (padding * 2));

                finishPng();
            };
            logoImg.onerror = finishPng;
            logoImg.src = set.logoDataUrl || "assets/icons/icon48.png";
        } else {
            finishPng();
        }
    });

    // Download SVG
    document.getElementById('download-svg').addEventListener('click', () => {
        if (!qr || !qr._oQRCode || !qr._oQRCode.modules) {
            alert("Could not generate SVG");
            return;
        }

        const set = window.qrSettings || {};
        const fg = set.foreground || "#000000";
        const bg = set.background || "#ffffff";

        const modules = qr._oQRCode.modules;
        const modCount = qr._oQRCode.moduleCount;
        const size = 180;
        const tileSize = size / modCount;

        let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
        svgContent += `<rect width="100%" height="100%" fill="${bg}"/>`;

        for (let r = 0; r < modCount; r++) {
            for (let c = 0; c < modCount; c++) {
                if (modules[r][c]) {
                    svgContent += `<rect x="${c * tileSize}" y="${r * tileSize}" width="${tileSize}" height="${tileSize}" fill="${fg}"/>`;
                }
            }
        }

        const finishSvg = (logoB64) => {
            // Add Logo overlay (Centered)
            if (logoB64 && !set.noLogo) {
                const logoSize = 48;
                const xy = (size - logoSize) / 2;

                // White Box background
                svgContent += `<rect x="${xy}" y="${xy}" width="${logoSize}" height="${logoSize}" fill="${bg}" stroke="#25D6D7" stroke-width="3" rx="10" />`;

                const padding = 6;
                const innerSize = logoSize - (padding * 2);
                const innerXY = xy + padding;

                svgContent += `<image href="${logoB64}" x="${innerXY}" y="${innerXY}" height="${innerSize}" width="${innerSize}"/>`;
            }

            svgContent += `</svg>`;
            const blobSvg = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
            const url = URL.createObjectURL(blobSvg);
            downloadImage(url, "qr-code.svg");
        };

        if (!set.noLogo) {
            const logoSrc = set.logoDataUrl || "assets/icons/icon48.png";
            if (logoSrc.startsWith('data:')) {
                finishSvg(logoSrc);
            } else {
                fetch(logoSrc)
                    .then(res => res.blob())
                    .then(blob => {
                        const reader = new FileReader();
                        reader.onloadend = () => finishSvg(reader.result);
                        reader.readAsDataURL(blob);
                    })
                    .catch(() => finishSvg(null));
            }
        } else {
            finishSvg(null);
        }
    });
    // --- Restore Helpers ---

    const showStatus = (msg, type = 'normal') => {
        const s = document.getElementById('status-msg');
        if (s) {
            s.textContent = msg;
            s.style.color = type === 'error' ? '#ff7675' : '#636e72';
            setTimeout(() => {
                s.textContent = "";
                s.style.color = '#636e72';
            }, 2000);
        }
    };

    const saveInputs = () => {
        chrome.storage.local.set({
            decoded: decodedToggle.checked,
            clean: cleanToggle.checked,
            social: socialToggle.checked,
            utm: utmToggle.checked,
            shorten: document.getElementById('shorten-toggle').checked,
            utmParams: {
                source: utmInputs.source.value,
                medium: utmInputs.medium.value,
                campaign: utmInputs.campaign.value,
                term: utmInputs.term.value,
                content: utmInputs.content.value
            }
        });
    };

    const loadSettings = () => {
        chrome.storage.local.get(['decoded', 'clean', 'social', 'utm', 'shorten', 'utmParams'], (result) => {
            if (result.decoded !== undefined) decodedToggle.checked = result.decoded;
            if (result.clean !== undefined) cleanToggle.checked = result.clean;
            if (result.social !== undefined) socialToggle.checked = result.social;
            if (result.utm !== undefined) utmToggle.checked = result.utm;
            if (result.shorten !== undefined) document.getElementById('shorten-toggle').checked = result.shorten;

            if (result.utm && utmAccordion) utmAccordion.classList.add('open');

            if (result.utmParams) {
                utmInputs.source.value = result.utmParams.source || "";
                utmInputs.medium.value = result.utmParams.medium || "";
                utmInputs.campaign.value = result.utmParams.campaign || "";
                utmInputs.term.value = result.utmParams.term || "";
                utmInputs.content.value = result.utmParams.content || "";
            }
        });
    };

    // Auto-save listeners
    [decodedToggle, cleanToggle, socialToggle, utmToggle, document.getElementById('shorten-toggle')].forEach(t => {
        if (t) t.addEventListener('change', () => {
            saveInputs();
            if (t === utmToggle && utmAccordion) {
                if (t.checked) utmAccordion.classList.add('open');
                else utmAccordion.classList.remove('open');
            }
        });
    });

    Object.values(utmInputs).forEach(input => {
        if (input) input.addEventListener('input', saveInputs);
    });

    // Initial Load
    loadSettings();
});
