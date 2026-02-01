document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('history-body');
    const emptyState = document.getElementById('empty-state');
    const tableContainer = document.querySelector('.table-container');
    const clearBtn = document.getElementById('clear-history');
    const exportBtn = document.getElementById('export-csv-btn');

    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const themeBtn = document.getElementById('theme-toggle-btn');

    // Theme Logic
    const applyTheme = (theme) => {
        const isDark = theme === 'dark';
        document.body.classList.toggle('dark-mode', isDark);

        // Update Logo
        const logoImg = document.querySelector('.logo-area img');
        if (logoImg) {
            logoImg.src = isDark ? 'assets/link-booster-logo-dark.png' : 'assets/link-booster-logo-clean.png';
        }

        if (themeBtn) {
            if (isDark) {
                // Sun Icon (Switch to Light)
                themeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
            } else {
                // Moon Icon (Switch to Dark)
                themeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
            }
        }
    };

    chrome.storage.local.get(['theme'], (result) => {
        applyTheme(result.theme || 'dark');
    });

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const current = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
            const next = current === 'dark' ? 'light' : 'dark';
            chrome.storage.local.set({ theme: next });
            applyTheme(next);
        });
    }

    // Navigation Logic
    const navItems = document.querySelectorAll('.nav-item[data-view]');
    const views = document.querySelectorAll('.view-section');
    const pageTitle = document.getElementById('page-title');

    const switchView = (viewName) => {
        // Update Nav
        let currentPageName = '';
        navItems.forEach(item => {
            if (item.dataset.view === viewName) {
                item.classList.add('active');
                currentPageName = item.textContent.trim();
            } else {
                item.classList.remove('active');
            }
        });

        // Update Title (Breadcrumb Style)
        if (pageTitle) {
            // Re-using the SVG icon path
            const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px; vertical-align: bottom;"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`;

            const settingsPart = `<span style="color:var(--header-text); font-weight:600; display:inline-flex; align-items:center;">${iconSvg} Settings</span>`;
            const separator = `<span style="color:var(--header-text); margin:0 8px; font-weight:600;">></span>`;
            const pagePart = `<span style="color:var(--primary-color); font-weight:600;">${currentPageName}</span>`;

            pageTitle.innerHTML = `${settingsPart} ${separator} ${pagePart}`;
        }

        // Update Views
        views.forEach(v => {
            v.style.display = v.id === `view-${viewName}` ? 'block' : 'none';
        });

        // Load data for specific views
        if (viewName === 'analytics') {
            loadAnalytics();
        }

        // Update URL Hash without scrolling
        if (history.replaceState) {
            history.replaceState(null, null, `#${viewName}`);
        } else {
            window.location.hash = viewName;
        }
    };

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = item.dataset.view;
            switchView(viewName);
        });
    });

    // Handle Deep Linking on Load
    const hash = window.location.hash;
    let initialView = hash.replace('#', '') || 'overview';

    // Detect Supabase Auth Redirects (access_token, error_description, etc.)
    if (hash.includes('access_token=') || hash.includes('refresh_token=') || hash.includes('error_description=')) {
        console.log("Supabase Auth Redirect detected");
        initialView = 'tracking';
        // We do NOT clear the hash here immediately, because Supabase client needs to read it.
        // The Supabase client initialized in initAuthLogic will pick this up.
    }

    if (document.getElementById(`view-${initialView}`)) {
        switchView(initialView);
    } else {
        switchView('overview');
    }

    // Overview Deep Links Handling
    document.querySelectorAll('.feature-action-link[data-goto]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetView = link.dataset.goto;
            switchView(targetView);
        });
    });

    // Handle Back/Forward Browser Buttons
    window.addEventListener('hashchange', () => {
        const view = window.location.hash.replace('#', '') || 'history';
        if (document.getElementById(`view-${view}`)) {
            switchView(view);
        }
    });

    let allHistory = [];

    // Filter and Sort Logic
    const renderTable = () => {
        let filtered = [...allHistory];

        // 1. Filter
        const query = searchInput.value.toLowerCase();
        if (query) {
            filtered = filtered.filter(item => {
                const searchStr = `
                    ${item.title || ''} 
                    ${item.finalUrl || ''} 
                    ${item.utm?.source || ''} 
                    ${item.utm?.campaign || ''}
                    ${item.utm?.medium || ''}
                `.toLowerCase();
                return searchStr.includes(query);
            });
        }

        // 2. Sort
        const sortMode = sortSelect.value;
        filtered.sort((a, b) => {
            if (sortMode === 'newest') return b.timestamp - a.timestamp;
            if (sortMode === 'oldest') return a.timestamp - b.timestamp;
            if (sortMode === 'az') return (a.title || '').localeCompare(b.title || '');
            if (sortMode === 'za') return (b.title || '').localeCompare(a.title || '');
            return 0;
        });

        // 3. Render
        if (filtered.length === 0) {
            tableContainer.style.display = 'none';
            // If we have history but filtered to 0, show "No results"? 
            // Or use empty state? Existing empty state says "No History Yet". 
            // Logic: if allHistory.length > 0 but filtered.length === 0, show "No matches".

            if (allHistory.length > 0) {
                // Ideally show a "No search results" message.
                // For now, I'll just clear the table body but keep container visible?
                // Or show empty state?
                // Let's hide container and show empty state but change text? 
                // Simple: Show table header but empty body with a message.

                tableContainer.style.display = 'block';
                tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px; color:#999;">No matching links found.</td></tr>';
                emptyState.style.display = 'none';
                return;
            }

            emptyState.style.display = 'block';
            return;
        }

        tableContainer.style.display = 'block';
        emptyState.style.display = 'none';
        tableBody.innerHTML = '';

        filtered.forEach(item => {
            const tr = document.createElement('tr');

            // Date format
            const date = new Date(item.timestamp).toLocaleString(undefined, {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            // Status Tags
            let statusTags = '';
            if (item.shortened) {
                statusTags += `<span class="status-label label-shortened">⚡ Shortened</span>`;
            }
            if (item.type === 'qr') {
                statusTags += `<span class="status-label label-qr"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px; vertical-align:text-bottom;"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>QR</span>`;
            }

            // UTM Values
            const source = item.utm && item.utm.source ? `<span class="tag">${escapeHtml(item.utm.source)}</span>` : '<span class="text-muted">-</span>';
            const medium = item.utm && item.utm.medium ? `<span class="tag">${escapeHtml(item.utm.medium)}</span>` : '<span class="text-muted">-</span>';
            const campaign = item.utm && item.utm.campaign ? `<span class="tag">${escapeHtml(item.utm.campaign)}</span>` : '<span class="text-muted">-</span>';
            const term = item.utm && item.utm.term ? `<span class="tag">${escapeHtml(item.utm.term)}</span>` : '<span class="text-muted">-</span>';
            const content = item.utm && item.utm.content ? `<span class="tag">${escapeHtml(item.utm.content)}</span>` : '<span class="text-muted">-</span>';

            // Icons
            const downloadIcon = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>`;
            const copyIcon = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;

            // Actions Column
            let actionsHtml = '';
            if (item.type === 'qr') {
                actionsHtml = `
                    <div style="display:flex; gap:4px; flex-direction:column;">
                        <button class="action-btn qr-dl-btn btn-qr" data-fmt="png" data-url="${escapeHtml(item.finalUrl)}" style="font-size:11px; padding:2px 6px;">
                            ${downloadIcon} PNG
                        </button>
                        <button class="action-btn qr-dl-btn btn-qr" data-fmt="svg" data-url="${escapeHtml(item.finalUrl)}" style="font-size:11px; padding:2px 6px;">
                            ${downloadIcon} SVG
                        </button>
                    </div>
                `;
            } else if (item.shortened) {
                actionsHtml = `
                    <div style="display:flex; gap:4px; flex-direction:column;">
                        <button class="action-btn copy-btn btn-shortened" data-url="${escapeHtml(item.finalUrl)}" style="font-size:11px; padding:2px 6px; width: 100%;">
                            ${copyIcon} Copy Shortened Link
                        </button>
                        <button class="action-btn copy-btn btn-original" data-url="${escapeHtml(getLongUrl(item))}" style="font-size:11px; padding:2px 6px; width: 100%;">
                            ${copyIcon} Copy Original Link
                        </button>
                    </div>
                `;
            } else {
                actionsHtml = `
                    <button class="action-btn copy-btn btn-default" data-url="${escapeHtml(item.finalUrl)}">
                        ${copyIcon} Copy Link
                    </button>
                `;
            }

            tr.innerHTML = `
                <td class="col-date">${date}</td>
                <td>
                    <div class="page-info">
                        <div class="page-title" title="${escapeHtml(item.title)}" ${isRtl(item.title) ? 'dir="rtl" style="text-align: right;"' : ''}>${escapeHtml(item.title || 'No Title')}</div>
                        <div class="url-row">
                            ${statusTags}
                            <a href="${item.finalUrl}" target="_blank" class="page-url" title="${item.finalUrl}">${item.finalUrl}</a>
                        </div>
                        ${item.shortened ? generateOriginalLinkHtml(item) : ''}
                    </div>
                </td>
                <td>${source}</td>
                <td>${medium}</td>
                <td>${campaign}</td>
                <td>${term}</td>
                <td>${content}</td>
                <td>${actionsHtml}</td>
            `;

            tableBody.appendChild(tr);
        });

        // Wire up listeners (same as before)
        setupRowListeners();
    };

    const fetchHistory = () => {
        chrome.storage.local.get(['linkHistory'], (result) => {
            allHistory = result.linkHistory || [];
            renderTable();
        });
    };

    // --- Presets Logic ---
    const presetsTableBody = document.getElementById('presets-body');
    const presetsEmptyState = document.getElementById('presets-empty-state');
    const presetsTableContainer = document.getElementById('presets-table-container');

    let allPresets = [];

    const renderPresetsTable = () => {
        if (allPresets.length === 0) {
            if (presetsTableContainer) presetsTableContainer.style.display = 'none';
            if (presetsEmptyState) presetsEmptyState.style.display = 'block';
            return;
        }

        if (presetsEmptyState) presetsEmptyState.style.display = 'none';
        if (presetsTableContainer) presetsTableContainer.style.display = 'block';
        if (presetsTableBody) presetsTableBody.innerHTML = '';

        allPresets.forEach((preset, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight:600; color:var(--header-text);">${escapeHtml(preset.name)}</td>
                <td><span class="tag">${escapeHtml(preset.source || '-')}</span></td>
                <td><span class="tag">${escapeHtml(preset.medium || '-')}</span></td>
                <td><span class="tag">${escapeHtml(preset.campaign || '-')}</span></td>
                <td><span class="tag">${escapeHtml(preset.id || '-')}</span></td>
                <td><span class="tag">${escapeHtml(preset.term || '-')}</span></td>
                <td><span class="tag">${escapeHtml(preset.content || '-')}</span></td>
                <td>
                    <button class="danger-btn delete-preset-btn" data-index="${index}" style="padding: 4px 10px; font-size: 13px;">Delete</button>
                </td>
            `;
            presetsTableBody.appendChild(tr);
        });

        // Wire up delete buttons
        document.querySelectorAll('.delete-preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                deletePreset(index);
            });
        });
    };

    const deletePreset = (index) => {
        if (confirm("Are you sure you want to delete this preset?")) {
            allPresets.splice(index, 1);
            chrome.storage.local.set({ utmPresets: allPresets }, () => {
                renderPresetsTable();
            });
        }
    };

    const fetchPresets = () => {
        chrome.storage.local.get(['utmPresets'], (result) => {
            allPresets = result.utmPresets || [];
            renderPresetsTable();
        });
    };

    // --- Preset Creation Logic ---
    const savePresetBtn = document.getElementById('save-preset-btn');
    const pName = document.getElementById('p-name');
    const pSource = document.getElementById('p-source');
    const pMedium = document.getElementById('p-medium');
    const pCampaign = document.getElementById('p-campaign');
    const pId = document.getElementById('p-id');
    const pTerm = document.getElementById('p-term');
    const pContent = document.getElementById('p-content');

    if (savePresetBtn) {
        savePresetBtn.addEventListener('click', () => {
            const name = pName.value.trim();
            if (!name) {
                alert('Please enter a preset name.');
                return;
            }

            const newPreset = {
                name: name,
                source: pSource.value.trim(),
                medium: pMedium.value.trim(),
                campaign: pCampaign.value.trim(),
                id: pId.value.trim(),
                term: pTerm.value.trim(),
                content: pContent.value.trim()
            };

            allPresets.push(newPreset);
            chrome.storage.local.set({ utmPresets: allPresets }, () => {
                renderPresetsTable();

                // Clear inputs
                pName.value = '';
                pSource.value = '';
                pMedium.value = '';
                pCampaign.value = '';
                pId.value = '';
                pTerm.value = '';
                pContent.value = '';

                // Optional: Show success toast or feedback
                const originalText = savePresetBtn.innerHTML;
                savePresetBtn.innerHTML = 'Saved!';
                setTimeout(() => {
                    savePresetBtn.innerHTML = originalText;
                }, 1500);
            });
        });
    }

    // Load Initial Data
    fetchHistory();
    fetchPresets();

    // Event Listeners for Filter/Sort
    searchInput.addEventListener('input', renderTable);
    sortSelect.addEventListener('change', renderTable);

    // Reuse existing listener setup
    function setupRowListeners() {
        // Wire up copy buttons
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const url = btn.dataset.url;
                navigator.clipboard.writeText(url).then(() => {
                    const originalText = btn.innerHTML;
                    btn.innerHTML = `<span>✅</span> Copied!`;
                    btn.classList.add('copy-success');
                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.classList.remove('copy-success');
                    }, 1500);
                });
            });
        });

        // Wire up QR Download buttons
        document.querySelectorAll('.qr-dl-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const url = btn.dataset.url;
                const fmt = btn.dataset.fmt;
                generateAndDownloadQr(url, fmt);
            });
        });
    }

    // Clear History
    clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your link history?')) {
            chrome.storage.local.set({ linkHistory: [] }, () => {
                fetchHistory();
            });
        }
    });

    // Export History
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (allHistory.length === 0) {
                alert("No history to export.");
                return;
            }

            // CSV Header
            const headers = ["Date", "Title", "Original URL", "Final URL", "Source", "Medium", "Campaign", "Term", "Content", "Shortened", "Type"];
            const rows = [];
            rows.push(headers.join(","));

            // Helper to escape CSV field
            const escapeCsv = (field) => {
                if (field === null || field === undefined) return "";
                const stringField = String(field);
                if (stringField.includes(",") || stringField.includes('"') || stringField.includes("\n")) {
                    return `"${stringField.replace(/"/g, '""')}"`;
                }
                return stringField;
            };

            allHistory.forEach(item => {
                const date = new Date(item.timestamp).toISOString();
                const row = [
                    date,
                    item.title,
                    item.originalUrl,
                    item.finalUrl,
                    item.utm?.source,
                    item.utm?.medium,
                    item.utm?.campaign,
                    item.utm?.term,
                    item.utm?.content,
                    item.shortened ? "Yes" : "No",
                    item.type
                ];
                rows.push(row.map(escapeCsv).join(","));
            });

            const csvContent = "\uFEFF" + rows.join("\n"); // Add BOM for Excel UTF-8
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            downloadDataUrl(URL.createObjectURL(blob), `link-booster-history-${new Date().toISOString().slice(0, 10)}.csv`);
        });
    }

    // Auto-refresh when storage changes
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local') {
            if (changes.linkHistory) fetchHistory();
            if (changes.theme) applyTheme(changes.theme.newValue);
        }
    });

    // Initial Load
    fetchHistory();

    // Helper: Detect RTL
    function isRtl(text) {
        if (!text) return false;
        // Hebrew, Arabic, Persian, etc.
        const rtlPattern = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
        return rtlPattern.test(text);
    }

    // Helper: Escape HTML
    function escapeHtml(text) {
        if (!text) return "";
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Helper: Reconstruct Long URL (Original + UTM)
    function getLongUrl(item) {
        try {
            let url = item.originalUrl || "";
            if (item.utm) {
                const urlObj = new URL(url);
                if (item.utm.source) urlObj.searchParams.set("utm_source", item.utm.source);
                if (item.utm.medium) urlObj.searchParams.set("utm_medium", item.utm.medium);
                if (item.utm.campaign) urlObj.searchParams.set("utm_campaign", item.utm.campaign);
                if (item.utm.term) urlObj.searchParams.set("utm_term", item.utm.term);
                if (item.utm.content) urlObj.searchParams.set("utm_content", item.utm.content);
                url = urlObj.toString();
            }
            return decodeURIComponent(url);
        } catch (e) { return item.originalUrl || ""; }
    }

    // Helper: Generate Original Link HTML
    function generateOriginalLinkHtml(item) {
        const url = getLongUrl(item);
        if (!url) return "";
        return `
            <div class="original-link-container">
                <span class="status-label label-original">Original</span>
                <a href="${escapeHtml(url)}" target="_blank" class="page-url-secondary" title="${escapeHtml(url)}">${escapeHtml(url)}</a>
            </div>
        `;
    }

    // --- QR Settings Logic ---
    const qrEnabledToggle = document.getElementById('qr-enabled-toggle');

    // Load QR Detection Setting
    chrome.storage.local.get(['qrDetectionEnabled'], (result) => {
        // Default true
        const isEnabled = result.qrDetectionEnabled !== false;
        if (qrEnabledToggle) qrEnabledToggle.checked = isEnabled;
    });

    if (qrEnabledToggle) {
        qrEnabledToggle.addEventListener('change', (e) => {
            const isEnabled = e.target.checked;
            chrome.storage.local.set({ qrDetectionEnabled: isEnabled });
        });
    }

    const qrColorDark = document.getElementById('qr-color-dark');
    const qrColorLight = document.getElementById('qr-color-light');
    const qrTextDark = document.getElementById('qr-text-dark');
    const qrTextLight = document.getElementById('qr-text-light');
    // New Logo BG inputs
    const qrLogoBgColor = document.getElementById('qr-logo-bg-color');
    const qrTextLogoBg = document.getElementById('qr-text-logo-bg');
    // New Logo Frame inputs
    const qrLogoFrameColor = document.getElementById('qr-logo-frame-color');
    const qrTextLogoFrame = document.getElementById('qr-text-logo-frame');

    const qrNoLogo = document.getElementById('qr-no-logo');
    const qrLogoPreview = document.getElementById('qr-logo-preview');
    const qrLogoInput = document.getElementById('qr-logo-input');
    const uploadLogoBtn = document.getElementById('upload-logo-btn');
    const resetLogoBtn = document.getElementById('reset-logo-btn');
    const saveQrSettingsBtn = document.getElementById('save-qr-settings');
    const qrSettingsPreview = document.getElementById('qr-settings-preview');

    let currentQrSettings = {
        foreground: "#000000",
        background: "#ffffff",
        logoBackgroundColor: "#ffffff", // Default match bg
        logoFrameColor: "#25D6D7", // Default cyan
        noLogo: false,
        logoDataUrl: null // null means default
    };

    const loadQrSettings = () => {
        chrome.storage.local.get(['qrSettings'], (result) => {
            if (result.qrSettings) {
                currentQrSettings = { ...currentQrSettings, ...result.qrSettings };
            }

            // Update UI
            if (qrColorDark) qrColorDark.value = currentQrSettings.foreground;
            if (qrTextDark) qrTextDark.value = currentQrSettings.foreground;

            if (qrColorLight) qrColorLight.value = currentQrSettings.background;
            if (qrTextLight) qrTextLight.value = currentQrSettings.background;

            if (qrLogoBgColor && currentQrSettings.logoBackgroundColor) {
                qrLogoBgColor.value = currentQrSettings.logoBackgroundColor;
                if (qrTextLogoBg) qrTextLogoBg.value = currentQrSettings.logoBackgroundColor;
            } else {
                // Fallback if undefined in storage
                if (qrLogoBgColor) qrLogoBgColor.value = currentQrSettings.background;
                if (qrTextLogoBg) qrTextLogoBg.value = currentQrSettings.background;
            }

            if (qrLogoFrameColor && currentQrSettings.logoFrameColor) {
                qrLogoFrameColor.value = currentQrSettings.logoFrameColor;
                if (qrTextLogoFrame) qrTextLogoFrame.value = currentQrSettings.logoFrameColor;
            } else {
                // Default to cyan if not set
                if (qrLogoFrameColor) qrLogoFrameColor.value = "#25D6D7";
                if (qrTextLogoFrame) qrTextLogoFrame.value = "#25D6D7";
            }

            if (qrNoLogo) qrNoLogo.checked = currentQrSettings.noLogo;

            if (currentQrSettings.logoDataUrl) {
                if (qrLogoPreview) qrLogoPreview.src = currentQrSettings.logoDataUrl;
            } else {
                if (qrLogoPreview) qrLogoPreview.src = "assets/icons/icon48.png";
            }

            renderQrPreview();
        });
    };

    // Helper: Add padding to logo
    const createPaddedLogo = (src, bgColor, frameColor, paddingPc = 0.15) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // Use a decent resolution
                const size = 512;
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');

                // Draw background
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, size, size);

                // Draw Frame if color provided (2px approx relative to final 55px ~ 18px here)
                if (frameColor) {
                    const lineWidth = 18;
                    ctx.strokeStyle = frameColor;
                    ctx.lineWidth = lineWidth;
                    // Stroke inside the box
                    ctx.strokeRect(lineWidth / 2, lineWidth / 2, size - lineWidth, size - lineWidth);
                }

                // Calculate logo dimensions maintaining aspect ratio
                const innerSize = size * (1 - paddingPc * 2);
                let w = img.width;
                let h = img.height;

                if (w > h) {
                    h = h * (innerSize / w);
                    w = innerSize;
                } else {
                    w = w * (innerSize / h);
                    h = innerSize;
                }

                // Center
                const x = (size - w) / 2;
                const y = (size - h) / 2;

                // High quality scaling
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                ctx.drawImage(img, x, y, w, h);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => resolve(src);
            img.src = src;
        });
    };

    const renderQrPreview = async () => {
        if (!qrSettingsPreview) return;
        qrSettingsPreview.innerHTML = "";

        const dummyLink = "https://example.com";

        const options = {
            text: dummyLink,
            width: 200,
            height: 200,
            colorDark: currentQrSettings.foreground,
            colorLight: currentQrSettings.background,
            correctLevel: QRCode.CorrectLevel.H,
            quietZone: 0,
            logoBackgroundTransparent: false, // We bake the bg into the image now for better control
            logoBackgroundColor: currentQrSettings.logoBackgroundColor || currentQrSettings.background // Just in case
        };

        if (!currentQrSettings.noLogo) {
            const rawLogo = currentQrSettings.logoDataUrl || "assets/icons/icon48.png";
            // Use specific logo background color for padding and frame
            const paddedLogo = await createPaddedLogo(rawLogo,
                currentQrSettings.logoBackgroundColor || currentQrSettings.background,
                currentQrSettings.logoFrameColor // Frame color
            );

            options.logo = paddedLogo;
            options.logoWidth = 55; // Slightly bigger (was ~44)
            options.logoHeight = 55;
        }

        new QRCode(qrSettingsPreview, options);
    };

    // Logo Frame Events
    if (qrLogoFrameColor) {
        qrLogoFrameColor.addEventListener('input', (e) => {
            currentQrSettings.logoFrameColor = e.target.value;
            if (qrTextLogoFrame) qrTextLogoFrame.value = e.target.value;
            renderQrPreview();
        });
    }
    if (qrTextLogoFrame) {
        qrTextLogoFrame.addEventListener('input', (e) => {
            let val = e.target.value;
            if (!val.startsWith('#')) val = '#' + val;
            if (isValidHex(val)) {
                currentQrSettings.logoFrameColor = val;
                if (qrLogoFrameColor) qrLogoFrameColor.value = val;
                renderQrPreview();
            }
        });
        qrTextLogoFrame.addEventListener('change', (e) => {
            let val = e.target.value;
            if (!val.startsWith('#')) val = '#' + val;
            if (isValidHex(val)) {
                e.target.value = val;
            } else {
                e.target.value = currentQrSettings.logoFrameColor;
            }
        });
    }

    if (uploadLogoBtn) {
        uploadLogoBtn.addEventListener('click', () => qrLogoInput.click());
    }

    if (qrLogoInput) {
        qrLogoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 100 * 1024) { // 100KB limit warning
                if (!confirm("This image is large (>100KB). It might slow down your storage. Continue?")) return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                // Determine dimensions to resize if needed? For now just save.
                // Or better, draw to canvas and resize to max 48x48 or 96x96?
                // Let's resize safely to 100x100 max to prevent massive strings.
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const maxSize = 512; // Increased for sharpness

                    if (width > height) {
                        if (width > maxSize) {
                            height *= maxSize / width;
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width *= maxSize / height;
                            height = maxSize;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/png');

                    currentQrSettings.logoDataUrl = dataUrl;
                    qrLogoPreview.src = dataUrl;
                    renderQrPreview();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    if (resetLogoBtn) {
        resetLogoBtn.addEventListener('click', () => {
            currentQrSettings.logoDataUrl = null;
            qrLogoPreview.src = "assets/icons/icon48.png";
            renderQrPreview();
        });
    }

    // Live Inputs - Sync Handlers
    const isValidHex = (hex) => /^#[0-9A-F]{6}$/i.test(hex);

    if (qrColorDark) {
        qrColorDark.addEventListener('input', (e) => {
            const val = e.target.value;
            currentQrSettings.foreground = val;
            if (qrTextDark) qrTextDark.value = val;
            renderQrPreview();
        });
    }
    if (qrTextDark) {
        qrTextDark.addEventListener('input', (e) => {
            let val = e.target.value;
            if (!val.startsWith('#')) val = '#' + val;
            if (isValidHex(val)) {
                currentQrSettings.foreground = val;
                if (qrColorDark) qrColorDark.value = val;
                renderQrPreview();
            }
        });
        // Auto-fix format on blur
        qrTextDark.addEventListener('change', (e) => {
            let val = e.target.value;
            if (!val.startsWith('#')) val = '#' + val;
            if (isValidHex(val)) {
                e.target.value = val;
            } else {
                // Reset to current valid setting if invalid
                e.target.value = currentQrSettings.foreground;
            }
        });
    }

    if (qrColorLight) {
        qrColorLight.addEventListener('input', (e) => {
            const val = e.target.value;
            currentQrSettings.background = val;
            if (qrTextLight) qrTextLight.value = val;
            renderQrPreview();
        });
    }
    if (qrTextLight) {
        qrTextLight.addEventListener('input', (e) => {
            let val = e.target.value;
            if (!val.startsWith('#')) val = '#' + val;
            if (isValidHex(val)) {
                currentQrSettings.background = val;
                if (qrColorLight) qrColorLight.value = val;
                renderQrPreview();
            }
        });
        qrTextLight.addEventListener('change', (e) => {
            let val = e.target.value;
            if (!val.startsWith('#')) val = '#' + val;
            if (isValidHex(val)) {
                e.target.value = val;
            } else {
                e.target.value = currentQrSettings.background;
            }
        });
    }

    // Logo Background Events
    if (qrLogoBgColor) {
        qrLogoBgColor.addEventListener('input', (e) => {
            const val = e.target.value;
            currentQrSettings.logoBackgroundColor = val;
            if (qrTextLogoBg) qrTextLogoBg.value = val;
            renderQrPreview();
        });
    }
    if (qrTextLogoBg) {
        qrTextLogoBg.addEventListener('input', (e) => {
            let val = e.target.value;
            if (!val.startsWith('#')) val = '#' + val;
            if (isValidHex(val)) {
                currentQrSettings.logoBackgroundColor = val;
                if (qrLogoBgColor) qrLogoBgColor.value = val;
                renderQrPreview();
            }
        });
        qrTextLogoBg.addEventListener('change', (e) => {
            let val = e.target.value;
            if (!val.startsWith('#')) val = '#' + val;
            if (isValidHex(val)) {
                e.target.value = val;
            } else {
                e.target.value = currentQrSettings.logoBackgroundColor;
            }
        });
    }

    if (qrNoLogo) qrNoLogo.addEventListener('change', (e) => {
        currentQrSettings.noLogo = e.target.checked;
        renderQrPreview();
    });

    if (saveQrSettingsBtn) {
        saveQrSettingsBtn.addEventListener('click', () => {
            chrome.storage.local.set({ qrSettings: currentQrSettings }, () => {
                const originalText = saveQrSettingsBtn.innerText;
                saveQrSettingsBtn.innerText = "Saved!";
                setTimeout(() => saveQrSettingsBtn.innerText = originalText, 1500);
            });
        });
    }

    // Init loads
    loadQrSettings();



    // Initial Load
    fetchHistory();
    loadAnalytics();


    // Helper: Generate and Download QR
    async function generateAndDownloadQr(url, fmt) {
        // Create hidden container
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.opacity = '0';
        container.style.top = '-9999px';
        document.body.appendChild(container);

        try {
            const qrText = new URL(url).toString();
            const fg = currentQrSettings.foreground || "#000000";
            const bg = currentQrSettings.background || "#ffffff";

            const options = {
                text: qrText,
                width: 300,
                height: 300,
                colorDark: fg,
                colorLight: bg,
                correctLevel: QRCode.CorrectLevel.H,
                quietZone: 1, // Slight padding for safety
                logoBackgroundTransparent: false,
                logoBackgroundColor: currentQrSettings.logoBackgroundColor || bg, // Use specific logo bg
                drawer: fmt === 'svg' ? 'svg' : 'canvas',
                onRenderingEnd: function (qrOptions, dataURL) {
                    if (fmt === 'svg') {
                        const svg = container.querySelector('svg');
                        if (svg) {
                            const serializer = new XMLSerializer();
                            let source = serializer.serializeToString(svg);
                            if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
                                source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
                            }
                            if (!source.match(/^<svg[^>]+xmlns:xlink="http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
                                source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
                            }
                            const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
                            const url = URL.createObjectURL(blob);
                            downloadDataUrl(url, "qr-code.svg");
                        }
                    } else {
                        // PNG
                        const canvas = container.querySelector('canvas');
                        if (canvas) {
                            downloadDataUrl(canvas.toDataURL("image/png"), "qr-code.png");
                        }
                    }

                    setTimeout(() => {
                        if (container.parentNode) document.body.removeChild(container);
                    }, 100);
                }
            };

            if (!currentQrSettings.noLogo) {
                const rawLogo = currentQrSettings.logoDataUrl || "assets/icons/icon48.png";
                // Use specific logo bg color and frame color
                const paddedLogo = await createPaddedLogo(rawLogo,
                    currentQrSettings.logoBackgroundColor || bg,
                    currentQrSettings.logoFrameColor
                );
                options.logo = paddedLogo;
                options.logoWidth = 80; // Bigger for 300px (approx 26%)
                options.logoHeight = 80;
            }

            new QRCode(container, options);

        } catch (e) {
            console.error(e);
            if (container.parentNode) document.body.removeChild(container);
        }
    }

    function downloadDataUrl(dataUrl, filename) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }



    async function loadAnalytics() {
        const { linkHistory = [] } = await chrome.storage.local.get(['linkHistory']);

        // Use ONLY real data - NO dummy data


        // Process Data
        const total = linkHistory.length;

        // Group by Date (Last 14 days)
        const dailyCounts = {};
        const today = new Date();
        for (let i = 13; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const key = d.toISOString().split('T')[0];
            dailyCounts[key] = 0;
        }

        // Count
        let weekCount = 0;
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);

        // UTM / Sources
        const sources = {};
        const contentStats = {
            utm: 0,
            qr: 0,
            shortened: 0
        };

        linkHistory.forEach(item => {
            const d = new Date(item.timestamp);
            const key = d.toISOString().split('T')[0];

            if (dailyCounts.hasOwnProperty(key)) {
                dailyCounts[key]++;
            }

            if (d >= weekAgo) {
                weekCount++;
            }

            if (item.utm && item.utm.source) {
                const s = item.utm.source.toLowerCase();
                sources[s] = (sources[s] || 0) + 1;
            } else {
                sources['(direct)'] = (sources['(direct)'] || 0) + 1;
            }

            // Non-exclusive Category Counting
            if (item.utm) contentStats.utm++;
            if (item.type === 'qr') contentStats.qr++;
            if (item.shortened) contentStats.shortened++;
        });

        // Update KPIs with empty state handling
        const kpiTotal = document.getElementById('kpi-total');
        const kpiWeek = document.getElementById('kpi-week');
        const kpiSource = document.getElementById('kpi-source');

        const compTotal = document.getElementById('compliment-total');
        const compWeek = document.getElementById('compliment-week');
        const compSource = document.getElementById('compliment-source');

        if (kpiTotal) {
            kpiTotal.textContent = total > 0 ? total.toLocaleString() : '—';
            kpiTotal.style.opacity = total > 0 ? '1' : '0.5';
        }
        if (kpiWeek) {
            kpiWeek.textContent = weekCount > 0 ? weekCount.toLocaleString() : '—';
            kpiWeek.style.opacity = weekCount > 0 ? '1' : '0.5';
        }

        const sortedSources = Object.entries(sources).sort((a, b) => b[1] - a[1]);
        const topSource = sortedSources.length > 0 && sortedSources[0][0] !== '(direct)' ? sortedSources[0][0] : '—';
        if (kpiSource) {
            kpiSource.textContent = topSource;
            kpiSource.style.opacity = topSource !== '—' ? '1' : '0.5';
        }

        // Set Compliments
        if (compTotal) {
            if (total === 0) compTotal.textContent = "Start your journey! 🚀";
            else if (total < 50) compTotal.textContent = "You are on the path to greatness! ✨";
            else if (total < 150) compTotal.textContent = "Your productivity is soaring! 📈";
            else compTotal.textContent = "Legendary status achieved! 🏆";
        }

        if (compWeek) {
            if (weekCount === 0) compWeek.textContent = "Waiting for the first boost... ⏳";
            else if (weekCount < 10) compWeek.textContent = "Building momentum! 👍";
            else if (weekCount < 40) compWeek.textContent = "You're a boosting machine! ⚡";
            else compWeek.textContent = "Absolutely unstoppable! 🔥";
        }

        if (compSource) {
            if (topSource === '-') {
                compSource.textContent = "No links boosted yet.";
            } else {
                const famous = ['google', 'facebook', 'facebook.com', 'google.com', 'linkedin', 'twitter', 'instagram', 'youtube', 'newsletter'];
                if (famous.includes(topSource.toLowerCase())) {
                    compSource.textContent = "Playing with the top guns! 🚀";
                } else {
                    compSource.textContent = "Interesting one... 🧐";
                }
            }
        }

        // Render Charts
        if (document.getElementById('activity-chart')) {
            renderBarChart('activity-chart', dailyCounts);
        }
        if (document.getElementById('source-chart')) {
            renderHorizontalBarChart('source-chart', sortedSources.slice(0, 5), total);
        }
        // content-chart
        if (document.getElementById('content-chart')) {
            const typeData = [
                ['UTM Enriched Links', contentStats.utm],
                ['QRs Generated', contentStats.qr],
                ['Shortened Links', contentStats.shortened]
            ].sort((a, b) => b[1] - a[1]);

            const activeData = typeData.filter(d => d[1] > 0);
            renderPieChart('content-chart', activeData);
        }
    }

    function renderBarChart(containerId, dataObj) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Enforce Layout
        container.classList.add('vertical');
        container.classList.remove('horizontal', 'pie');

        container.innerHTML = '';

        const entries = Object.entries(dataObj);
        if (entries.length === 0) return;

        const maxVal = Math.max(...entries.map(e => e[1])) || 1;

        entries.forEach(([dateStr, count]) => {
            const dateParts = dateStr.split('-');
            const label = `${dateParts[1]}/${dateParts[2]}`;
            const heightPct = (count / maxVal) * 100;

            const group = document.createElement('div');
            group.className = 'bar-group';
            group.innerHTML = `
                <div class="bar-tooltip">${count} links<br>${dateStr}</div>
                <div class="bar" style="height: ${heightPct}%;"></div>
                <div class="bar-label">${label}</div>
            `;
            container.appendChild(group);
        });
    }

    function renderHorizontalBarChart(containerId, sortedData, total) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Enforce Layout
        container.classList.add('horizontal');
        container.classList.remove('vertical', 'pie');

        container.innerHTML = '';

        if (sortedData.length === 0) {
            container.innerHTML = '<div style="color:var(--secondary-text); font-size:13px; text-align:center; margin-top:20px;">No data yet</div>';
            return;
        }

        const maxVal = Math.max(...sortedData.map(e => e[1])) || 1;

        sortedData.forEach(([label, count]) => {
            const pct = (count / maxVal) * 100;
            const row = document.createElement('div');
            row.className = 'hbar-row';
            row.innerHTML = `
                <div class="hbar-label" title="${label}">${label}</div>
                <div class="hbar-bg">
                    <div class="hbar-fill" style="width: ${pct}%"></div>
                </div>
                <div class="hbar-val">${count}</div>
            `;
            container.appendChild(row);
        });
    }

    function renderPieChart(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.classList.add('pie');
        container.innerHTML = '';

        if (data.length === 0) {
            container.innerHTML = '<div style="color:var(--secondary-text); font-size:13px;">No data yet</div>';
            return;
        }

        const total = data.reduce((sum, item) => sum + item[1], 0);

        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.justifyContent = 'center';
        wrapper.style.gap = '32px';
        wrapper.style.width = '100%';

        const size = 160;
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.setAttribute('viewBox', '-1 -1 2 2');
        svg.style.transform = 'rotate(-90deg)';

        const legend = document.createElement('div');
        legend.className = 'pie-legend-wrapper';

        let cumulativePercent = 0;
        const colors = ['#00d2d3', '#5f27cd', '#ff9f43', '#ee5253', '#2e86de'];

        data.forEach(([label, count], index) => {
            const percent = count / total;
            const startX = Math.cos(2 * Math.PI * cumulativePercent);
            const startY = Math.sin(2 * Math.PI * cumulativePercent);
            cumulativePercent += percent;
            const endX = Math.cos(2 * Math.PI * cumulativePercent);
            const endY = Math.sin(2 * Math.PI * cumulativePercent);

            const largeArcFlag = percent > 0.5 ? 1 : 0;
            let pathData;
            if (percent === 1) {
                pathData = `M 1 0 A 1 1 0 1 1 -1 0 A 1 1 0 1 1 1 0`;
            } else {
                pathData = [`M 0 0`, `L ${startX} ${startY}`, `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, `Z`].join(' ');
            }

            const color = colors[index % colors.length];
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute('d', pathData);
            path.setAttribute('fill', color);
            path.style.transition = 'opacity 0.2s';
            svg.appendChild(path);

            // New legend item structure
            const item = document.createElement('div');
            item.className = 'pie-legend-item';
            item.innerHTML = `
                <div class="pie-color-box" style="background:${color}"></div>
                <span>${label} (${Math.round(percent * 100)}%)</span>
            `;
            legend.appendChild(item);
        });

        wrapper.appendChild(svg);
        wrapper.appendChild(legend);
        container.appendChild(wrapper);
    }



    // --- Website Tracking Logic ---
    // --- Local Analytics Logic ---
    function loadLocalAnalytics() {
        chrome.storage.local.get(['linkHistory', 'history'], (result) => {
            const history = result.linkHistory || result.history || [];

            // Calculate Stats
            const totalLinks = history.length;

            // This Week (Last 7 Days)
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const linksThisWeek = history.filter(h => h.timestamp && new Date(h.timestamp) >= oneWeekAgo).length;

            // Prepare Chart Data (Daily Activity - Last 14 Days)
            const activityMap = {};
            const today = new Date();
            for (let i = 13; i >= 0; i--) {
                const d = new Date();
                d.setDate(today.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                activityMap[dateStr] = 0;
            }

            // Calculate Top Sources and Mediums (Moved up for KPI usage)
            const sourceMap = {};
            const contentMap = {};

            history.forEach(h => {
                // Chart Data
                if (h.timestamp) {
                    const d = new Date(h.timestamp);
                    const dateStr = d.toISOString().split('T')[0];
                    if (activityMap[dateStr] !== undefined) {
                        activityMap[dateStr]++;
                    }
                }

                // Sources/Mediums
                if (h.utm && h.utm.source) {
                    const s = h.utm.source.toLowerCase();
                    sourceMap[s] = (sourceMap[s] || 0) + 1;
                }
                if (h.utm && h.utm.medium) {
                    const m = h.utm.medium.toLowerCase();
                    contentMap[m] = (contentMap[m] || 0) + 1;
                }
            });

            // Helper to sort and slice
            const getTop = (map) => Object.entries(map)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([name, count]) => ({ name, count }));

            const topSources = getTop(sourceMap);
            const topContent = getTop(contentMap);

            // Top Source KPI
            const topSourceLabel = topSources.length > 0 ? topSources[0].name : '-';

            // DOM Elements
            const kpiTotal = document.getElementById('kpi-views');
            const kpiWeek = document.getElementById('kpi-session');
            const kpiSource = document.getElementById('kpi-clicks');

            // Update KPIs with empty state handling
            if (kpiTotal) {
                kpiTotal.textContent = totalLinks > 0 ? totalLinks.toLocaleString() : '—';
                kpiTotal.style.opacity = totalLinks > 0 ? '1' : '0.5';
            }
            if (kpiWeek) {
                kpiWeek.textContent = linksThisWeek > 0 ? linksThisWeek.toLocaleString() : '—';
                kpiWeek.style.opacity = linksThisWeek > 0 ? '1' : '0.5';
            }
            if (kpiSource) {
                kpiSource.textContent = topSourceLabel !== '-' ? topSourceLabel : '—';
                kpiSource.style.opacity = topSourceLabel !== '-' ? '1' : '0.5';
            }

            const chartData = Object.keys(activityMap).map(date => ({
                date,
                count: activityMap[date]
            }));

            renderActivityChartNew(chartData);
            renderTopListChart('source-chart', topSources);
            renderTopListChart('content-chart', topContent);
        });
    }

    function renderActivityChart(data) {
        const container = document.getElementById('activity-chart');
        if (!container) return;

        container.innerHTML = '';
        if (data.length === 0) {
            container.innerHTML = '<div style="height:100%; display:flex; align-items:center; justify-content:center; color:var(--secondary-text);">No activity yet</div>';
            return;
        }

        // SVG Chart Dimensions
        const width = container.clientWidth || 600;
        const height = container.clientHeight || 200;
        const padding = 20;
        const maxVal = Math.max(...data.map(d => d.count), 5); // Minimum scale of 5

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        svg.style.overflow = "visible";

        // Generate Path
        let pathD = "";
        const points = [];

        const stepX = (width - padding * 2) / (data.length - 1);
        const scaleY = (height - padding * 2) / maxVal;

        data.forEach((d, i) => {
            const x = padding + i * stepX;
            const y = height - padding - (d.count * scaleY);
            points.push({ x, y, count: d.count, date: d.date });
            if (i === 0) {
                pathD += `M ${x} ${y}`;
            } else {
                pathD += ` L ${x} ${y}`;
            }
        });

        // Gradient Definition
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        defs.innerHTML = `
            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="var(--primary-color)" stop-opacity="0.2"/>
                <stop offset="100%" stop-color="var(--primary-color)" stop-opacity="0"/>
            </linearGradient>
        `;
        svg.appendChild(defs);

        // Fill Area
        const fillPathD = pathD + ` L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;
        const fillPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        fillPath.setAttribute("d", fillPathD);
        fillPath.setAttribute("fill", "url(#chartGradient)");
        svg.appendChild(fillPath);

        // Stroke Line
        const pathLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
        pathLine.setAttribute("d", pathD);
        pathLine.setAttribute("fill", "none");
        pathLine.setAttribute("stroke", "var(--primary-color)");
        pathLine.setAttribute("stroke-width", "2");
        pathLine.setAttribute("stroke-linecap", "round");
        pathLine.setAttribute("stroke-linejoin", "round");
        svg.appendChild(pathLine);

        // Points
        points.forEach(p => {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", p.x);
            circle.setAttribute("cy", p.y);
            circle.setAttribute("r", "3");
            circle.setAttribute("fill", "var(--card-bg)");
            circle.setAttribute("stroke", "var(--primary-color)");
            circle.setAttribute("stroke-width", "2");

            // Tooltip logic (simple title)
            const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
            title.textContent = `${p.date}: ${p.count}`;
            circle.appendChild(title);

            svg.appendChild(circle);
        });

        container.appendChild(svg);
    }

    function renderTopListChart(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        if (!data || data.length === 0) {
            container.innerHTML = '<div style="color:var(--secondary-text); font-size:13px; text-align:center; padding-top:20px;">No data yet</div>';
            return;
        }

        const ul = document.createElement('ul');
        ul.style.listStyle = 'none';
        ul.style.padding = '0';
        ul.style.margin = '0';
        ul.style.width = '100%';

        const max = Math.max(...data.map(d => d.count));

        data.forEach(d => {
            const li = document.createElement('li');
            li.style.marginBottom = '12px';

            const header = document.createElement('div');
            header.style.display = 'flex';
            header.style.justifyContent = 'space-between';
            header.style.fontSize = '12px';
            header.style.marginBottom = '4px';
            header.style.color = 'var(--text-color)';

            const nameSpan = document.createElement('strong');
            nameSpan.textContent = d.name;
            const countSpan = document.createElement('span');
            countSpan.textContent = d.count.toLocaleString();

            header.appendChild(nameSpan);
            header.appendChild(countSpan);

            const barBg = document.createElement('div');
            barBg.style.height = '6px';
            barBg.style.borderRadius = '3px';
            barBg.style.backgroundColor = 'rgba(0,0,0,0.05)';
            barBg.style.width = '100%';

            const barFill = document.createElement('div');
            const pc = (d.count / max) * 100;
            barFill.style.height = '100%';
            barFill.style.borderRadius = '3px';
            barFill.style.backgroundColor = 'var(--primary-color)';
            barFill.style.width = `${pc}%`;

            barBg.appendChild(barFill);
            li.appendChild(header);
            li.appendChild(barBg);
            ul.appendChild(li);
        });

        container.appendChild(ul);
    }

    function renderActivityChartNew(data) {
        const container = document.getElementById('activity-chart');
        if (!container) return;

        container.innerHTML = '';

        // SVG Chart Dimensions
        const width = container.clientWidth || 600;
        const height = container.clientHeight || 200;
        const padding = { top: 10, right: 10, bottom: 30, left: 40 };
        const chartW = width - padding.left - padding.right;
        const chartH = height - padding.top - padding.bottom;

        // Determine scale
        let maxVal = 5;
        if (data.length > 0) {
            const m = Math.max(...data.map(d => d.count));
            if (m > 0) maxVal = m;
        }

        const effectiveData = data.length > 0 ? data : [];

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
        svg.style.overflow = "visible";

        // --- DRAW AXES ---
        // Y-Axis Line
        const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
        yAxis.setAttribute("x1", padding.left);
        yAxis.setAttribute("y1", padding.top);
        yAxis.setAttribute("x2", padding.left);
        yAxis.setAttribute("y2", height - padding.bottom);
        yAxis.setAttribute("stroke", "var(--border-color)");
        yAxis.setAttribute("stroke-width", "1");
        svg.appendChild(yAxis);

        // X-Axis Line
        const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
        xAxis.setAttribute("x1", padding.left);
        xAxis.setAttribute("y1", height - padding.bottom);
        xAxis.setAttribute("x2", width - padding.right);
        xAxis.setAttribute("y2", height - padding.bottom);
        xAxis.setAttribute("stroke", "var(--border-color)");
        xAxis.setAttribute("stroke-width", "1");
        svg.appendChild(xAxis);

        // Y-Axis Labels (0, 25%, 50%, 75%, 100%)
        const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(f * maxVal));
        const uniqueTicks = [...new Set(yTicks)].sort((a, b) => a - b);

        uniqueTicks.forEach(tick => {
            const y = height - padding.bottom - (tick / maxVal) * chartH;
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", padding.left - 8);
            text.setAttribute("y", y + 4);
            text.setAttribute("text-anchor", "end");
            text.setAttribute("fill", "var(--secondary-text)");
            text.setAttribute("font-size", "10px");
            text.textContent = tick;
            svg.appendChild(text);

            // Grid line
            if (tick > 0) {
                const grid = document.createElementNS("http://www.w3.org/2000/svg", "line");
                grid.setAttribute("x1", padding.left);
                grid.setAttribute("y1", y);
                grid.setAttribute("x2", width - padding.right);
                grid.setAttribute("y2", y);
                grid.setAttribute("stroke", "var(--border-color)");
                grid.setAttribute("stroke-dasharray", "4 4");
                grid.setAttribute("stroke-opacity", "0.3");
                svg.appendChild(grid);
            }
        });

        // X-Axis Labels (All days for last 14 days)
        if (effectiveData.length > 0) {
            const stepX = chartW / (effectiveData.length - 1);
            effectiveData.forEach((d, i) => {
                // Always show label, but might need to skip if too crowded.
                // With 14 days, it should fit if font is small.
                const x = padding.left + i * stepX;

                // Show every label if <= 15 data points, else skip
                if (effectiveData.length <= 15 || i % 2 === 0) {
                    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    text.setAttribute("x", x);
                    text.setAttribute("y", height - padding.bottom + 15);
                    text.setAttribute("text-anchor", "middle");
                    text.setAttribute("fill", "var(--secondary-text)");
                    text.setAttribute("font-size", "9px"); // Slightly smaller

                    const dateParts = d.date.split('-');
                    text.textContent = `${dateParts[1]}/${dateParts[2]}`;
                    svg.appendChild(text);
                }
            });

            // --- DRAW DATA PATH ---
            let pathD = "";
            const points = [];

            effectiveData.forEach((d, i) => {
                const x = padding.left + i * stepX;
                const y = height - padding.bottom - (d.count / maxVal) * chartH;
                points.push({ x, y, count: d.count, date: d.date });

                if (i === 0) pathD += `M ${x} ${y}`;
                else pathD += ` L ${x} ${y}`;
            });

            const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
            defs.innerHTML = `
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="var(--primary-color)" stop-opacity="0.2"/>
                    <stop offset="100%" stop-color="var(--primary-color)" stop-opacity="0"/>
                </linearGradient>
            `;
            svg.appendChild(defs);

            const fillPathD = pathD + ` L ${width - padding.right} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`;
            const fillPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            fillPath.setAttribute("d", fillPathD);
            fillPath.setAttribute("fill", "url(#chartGradient)");
            svg.appendChild(fillPath);

            const pathLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
            pathLine.setAttribute("d", pathD);
            pathLine.setAttribute("fill", "none");
            pathLine.setAttribute("stroke", "var(--primary-color)");
            pathLine.setAttribute("stroke-width", "2");
            pathLine.setAttribute("stroke-linecap", "round");
            pathLine.setAttribute("stroke-linejoin", "round");
            svg.appendChild(pathLine);

            points.forEach(p => {
                const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttribute("cx", p.x);
                circle.setAttribute("cy", p.y);
                circle.setAttribute("r", "3");
                circle.setAttribute("fill", "var(--card-bg)");
                circle.setAttribute("stroke", "var(--primary-color)");
                circle.setAttribute("stroke-width", "2");

                const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
                title.textContent = `${p.date}: ${p.count}`;
                circle.appendChild(title);

                svg.appendChild(circle);
            });
        }

        container.appendChild(svg);
    }

    // --- Website Tracking Logic ---
    function initAuthLogic() {
        // Initialize Supabase
        const SUPABASE_URL = 'https://werjvrzdbpbyasftmlkl.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indlcmp2cnpkYnBieWFzZnRtbGtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MjU1ODcsImV4cCI6MjA4NDIwMTU4N30.FhAJ30gpTX81uv90weWA6MJJxC1DpVYcZv6YAMI9Lkk'; // Anon Key

        // Ensure supabase is available
        const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: {
                storage: {
                    getItem: async (key) => {
                        return new Promise((resolve) => {
                            chrome.storage.local.get([key], (result) => resolve(result[key]));
                        });
                    },
                    setItem: async (key, value) => {
                        return new Promise((resolve) => {
                            chrome.storage.local.set({ [key]: value }, () => resolve());
                        });
                    },
                    removeItem: async (key) => {
                        return new Promise((resolve) => {
                            chrome.storage.local.remove([key], () => resolve());
                        });
                    }
                }
            }
        }) : null;

        if (!supabaseClient) {
            console.error("Supabase client could not be initialized.");
            return;
        }

        // EXPLICIT SESSION RECOVERY FOR EXTENSION REDIRECTS
        // Chrome Extensions sometimes don't auto-process the hash in the same tick.
        // We force a check here.
        if (window.location.hash && (window.location.hash.includes('access_token') || window.location.hash.includes('refresh_token'))) {
            // Give the client a moment to mount, but effectively it should grab it.
            supabaseClient.auth.getSession().then(({ data, error }) => {
                if (data.session) {
                    console.log("Session recovered from URL", data.session);
                    // Set local storage immediately
                    chrome.storage.local.set({ authUser: data.session.user, authSession: data.session });
                    showTrackingDashboard(data.session.user);
                    syncUserProfile(data.session.user);

                    // Clean URL Hash for aesthetics
                    window.location.hash = 'tracking';
                } else if (error) {
                    console.error("Error recovering session:", error);
                    showStatus("Error verifying email link.", "error");
                }
            });
        }

        // Listen for Auth State Changes
        supabaseClient.auth.onAuthStateChange((event, session) => {
            console.log("Auth State Change:", event, session);
            if (event === 'SIGNED_IN' && session) {
                chrome.storage.local.set({ authUser: session.user, authSession: session });
                showTrackingDashboard(session.user);
                syncUserProfile(session.user); // Sync data to DB
            } else if (event === 'SIGNED_OUT') {
                chrome.storage.local.remove(['authUser', 'authSession']);
                showAuthForm();
            }
        });

        // Helper: Sync User Profile to Supabase Table
        async function syncUserProfile(user) {
            try {
                const updates = {
                    id: user.id,
                    email: user.email,
                    full_name: user.user_metadata?.full_name || '',
                    updated_at: new Date()
                };

                const { error } = await supabaseClient
                    .from('profiles')
                    .upsert(updates);

                if (error) {
                    console.error('Error syncing profile:', error);
                } else {
                    console.log('Profile synced successfully');
                }
            } catch (err) {
                console.error('Profile sync exception:', err);
            }
        }

        // Tab Scavenger: Check for open tabs with auth tokens (Fix for "redirected but not logged in")
        function scavengeAuthToken() {
            if (!chrome.tabs) return;

            // Query for the callback URL
            chrome.tabs.query({ url: 'https://link-booster.link/auth/callback*' }, (tabs) => {
                if (!tabs || tabs.length === 0) return;

                tabs.forEach(tab => {
                    if (tab.url && (tab.url.includes('access_token=') || tab.url.includes('refresh_token='))) {
                        console.log("Found auth token in external tab:", tab.url);

                        // Parse hash manually
                        try {
                            const hashIndex = tab.url.indexOf('#');
                            if (hashIndex === -1) return;

                            const hash = tab.url.substring(hashIndex + 1);
                            const params = new URLSearchParams(hash);
                            const accessToken = params.get('access_token');
                            const refreshToken = params.get('refresh_token');

                            if (accessToken && refreshToken) {
                                supabaseClient.auth.setSession({
                                    access_token: accessToken,
                                    refresh_token: refreshToken
                                }).then(({ data, error }) => {
                                    if (!error && data.session) {
                                        console.log("Successfully scavenged session!");
                                        showStatus("Logged in via external tab!", "success");

                                        // Close the success tab to bring focus back to extension (optional but nice)
                                        chrome.tabs.remove(tab.id);
                                    }
                                });
                            }
                        } catch (e) {
                            console.error("Error parsing external tab token", e);
                        }
                    }
                });
            });
        }

        // Run scavenger on load and focus
        scavengeAuthToken();
        window.addEventListener('focus', scavengeAuthToken);

        // Check Initial Session (Modified for Local Analytics)
        // We now show the dashboard by default populated with local stats.
        // Auth logic remains if user IS logged in for profile sync, but visual priority is local stats.

        // Show dashboard immediately
        showTrackingDashboard(null); // Pass null as user initially
        loadLocalAnalytics();

        chrome.storage.local.get(['authUser', 'authSession'], async (res) => {
            if (res.authSession) {
                // Verify if session is still valid
                const { data: { user }, error } = await supabaseClient.auth.getUser(res.authSession.access_token);
                if (user && !error) {
                    showTrackingDashboard(user);
                    // syncUserProfile(user); 
                } else {
                    chrome.storage.local.remove(['authUser', 'authSession']);
                    // Do not showAuthForm(), keep dashboard visible for local stats
                    showTrackingDashboard(null);
                }
            }
        });

        // ... rest of event listeners ...

        // Auth Tabs
        const loginTab = document.getElementById('tab-login');
        const regTab = document.getElementById('tab-register');
        const loginForm = document.getElementById('login-form');
        const regForm = document.getElementById('register-form');
        const authStatus = document.getElementById('auth-status-msg') || createAuthStatusElement();

        function createAuthStatusElement() {
            const el = document.createElement('div');
            el.id = 'auth-status-msg';
            el.style.textAlign = 'center';
            el.style.marginTop = '16px';
            el.style.fontSize = '13px';
            el.style.fontWeight = '500';
            // Insert after forms
            if (loginForm && loginForm.parentNode) {
                loginForm.parentNode.insertBefore(el, loginForm.nextSibling);
            }
            return el;
        }

        function showStatus(msg, type = 'info') {
            if (authStatus) {
                authStatus.textContent = msg;
                authStatus.style.color = type === 'error' ? '#ff7675' : (type === 'success' ? '#00b894' : 'var(--secondary-text)');
                authStatus.className = type; // for potential CSS styling
            }
        }

        if (loginTab && regTab) {
            loginTab.addEventListener('click', () => {
                loginTab.classList.add('active');
                regTab.classList.remove('active');
                loginForm.style.display = 'flex';
                regForm.style.display = 'none';
                showStatus('');
            });

            regTab.addEventListener('click', () => {
                regTab.classList.add('active');
                loginTab.classList.remove('active');
                loginForm.style.display = 'none';
                regForm.style.display = 'flex';
                showStatus('');
            });
        }

        // Login Form
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                showStatus('Logging in...');
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;

                try {
                    const { data, error } = await supabaseClient.auth.signInWithPassword({
                        email,
                        password
                    });

                    if (error) throw error;
                    // onAuthStateChange will handle the UI update + profile sync
                } catch (err) {
                    showStatus(err.message || 'Login failed', 'error');
                }
            });
        }

        // Register Form
        if (regForm) {
            // Password Toggle Logic
            const toggleBtn = document.getElementById('reg-password-toggle');
            const passInput = document.getElementById('reg-password');
            const eyeOpen = toggleBtn ? toggleBtn.querySelector('.eye-open') : null;
            const eyeClosed = toggleBtn ? toggleBtn.querySelector('.eye-closed') : null;

            if (toggleBtn && passInput) {
                toggleBtn.addEventListener('click', () => {
                    const type = passInput.getAttribute('type') === 'password' ? 'text' : 'password';
                    passInput.setAttribute('type', type);

                    if (eyeOpen && eyeClosed) {
                        eyeOpen.style.display = type === 'password' ? 'block' : 'none';
                        eyeClosed.style.display = type === 'password' ? 'none' : 'block';
                    }
                });
            }

            regForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                // Loading UI
                const loader = document.getElementById('reg-loading-container');
                const btn = regForm.querySelector('button[type="submit"]');
                if (loader) loader.style.display = 'block';
                if (btn) btn.style.display = 'none';

                const name = document.getElementById('reg-name').value;
                const email = document.getElementById('reg-email').value;
                const password = document.getElementById('reg-password').value;

                try {
                    // Get extension URL for redirection (best effort)
                    const redirectUrl = chrome.runtime.getURL('options.html');

                    const { data, error } = await supabaseClient.auth.signUp({
                        email,
                        password,
                        options: {
                            data: { full_name: name },
                            emailRedirectTo: 'https://link-booster.link/auth/callback'
                        }
                    });

                    if (error) throw error;

                    // Success handling
                    if (data.user && data.session) {
                        showStatus('Registered Successfully!', 'success');
                        // onAuthStateChange handles UI + sync
                    } else if (data.user && !data.session) {
                        showStatus('Account created! Please check your email to verify.', 'success');

                        // We can attempt to sync the profile here even before verification if RLS allows, 
                        // but usually it's better to wait for sign-in event.
                        // However, we can TRY to create the profile entry now.
                        syncUserProfile(data.user);
                    }

                } catch (err) {
                    showStatus(err.message || 'Registration failed', 'error');
                    if (loader) loader.style.display = 'none';
                    if (btn) btn.style.display = 'block';
                }
            });
        }

        // Social Login Handlers
        ['google', 'facebook', 'apple'].forEach(provider => {
            const btn = document.getElementById(`social-${provider}`);
            if (btn) {
                btn.addEventListener('click', async () => {
                    showStatus(`Connecting to ${provider}...`);
                    try {
                        const { data, error } = await supabaseClient.auth.signInWithOAuth({
                            provider: provider,
                            options: {
                                redirectTo: 'https://link-booster.link/auth/callback'
                            }
                        });
                        if (error) throw error;
                    } catch (err) {
                        showStatus(err.message || 'Social login failed', 'error');
                    }
                });
            }
        });

        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await supabaseClient.auth.signOut();
                // onAuthStateChange will handle UI
                showStatus('Logged out', 'info');
            });
        }

        // Copy Script
        const copyScriptBtn = document.getElementById('copy-script-btn');
        if (copyScriptBtn) {
            copyScriptBtn.addEventListener('click', () => {
                const codeBlock = document.getElementById('tracking-script-code');
                const text = codeBlock.innerText || codeBlock.textContent;
                navigator.clipboard.writeText(text);

                const originalContent = copyScriptBtn.innerHTML;
                copyScriptBtn.innerHTML = '<span style="font-size:10px; font-weight:bold;">✓</span>';
                copyScriptBtn.style.color = 'var(--primary-color)';
                copyScriptBtn.style.borderColor = 'var(--primary-color)';

                setTimeout(() => {
                    copyScriptBtn.innerHTML = originalContent;
                    copyScriptBtn.style.color = '';
                    copyScriptBtn.style.borderColor = '';
                }, 2000);
            });
        }
    }

    function showAuthForm() {
        const container = document.getElementById('tracking-auth-container');
        const dashboard = document.getElementById('tracking-dashboard-container');
        if (container) container.style.display = 'block';
        if (dashboard) dashboard.style.display = 'none';

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.style.display = 'none';
    }

    function showTrackingDashboard(user) {
        const container = document.getElementById('tracking-auth-container');
        const dashboard = document.getElementById('tracking-dashboard-container');
        if (container) container.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.style.display = 'flex';

        // Load Local Stats (No Supabase required)
        loadLocalAnalytics();
    }

    // Init Auth
    initAuthLogic();

});
