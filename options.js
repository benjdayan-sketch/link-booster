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
    const initialView = window.location.hash.replace('#', '') || 'overview';
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

            if (qrNoLogo) qrNoLogo.checked = currentQrSettings.noLogo;

            if (currentQrSettings.logoDataUrl) {
                if (qrLogoPreview) qrLogoPreview.src = currentQrSettings.logoDataUrl;
            } else {
                if (qrLogoPreview) qrLogoPreview.src = "assets/icons/icon48.png";
            }

            renderQrPreview();
        });
    };

    const renderQrPreview = () => {
        if (!qrSettingsPreview) return;
        qrSettingsPreview.innerHTML = "";

        // Use a dummy link for preview
        const dummyLink = "https://example.com";
        const qr = new QRCode(qrSettingsPreview, {
            text: dummyLink,
            width: 150,
            height: 150,
            colorDark: currentQrSettings.foreground,
            colorLight: currentQrSettings.background,
            correctLevel: QRCode.CorrectLevel.L
        });

        // Overlay Logo
        if (!currentQrSettings.noLogo) {
            const logoSrc = currentQrSettings.logoDataUrl || "assets/icons/icon48.png";
            const img = document.createElement('img');
            img.src = logoSrc;
            img.style.position = 'absolute';
            img.style.top = '50%';
            img.style.left = '50%';
            img.style.transform = 'translate(-50%, -50%)';
            img.style.width = '40px';
            img.style.height = '40px';
            img.style.background = currentQrSettings.background;
            img.style.border = '2px solid #25D6D7';
            img.style.borderRadius = '4px';
            img.style.padding = '2px';

            // Wrapper relative
            qrSettingsPreview.style.position = 'relative';
            qrSettingsPreview.appendChild(img);
        }
    };

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
                    const maxSize = 120; // slightly larger than needed

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
    function generateAndDownloadQr(url, fmt) {
        // Create hidden container
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.opacity = '0';
        container.style.top = '-9999px';
        document.body.appendChild(container);

        try {
            // Encode properly
            const qrText = new URL(url).toString();

            // Use current settings (or defaults if not loaded yet)
            const fg = currentQrSettings.foreground || "#000000";
            const bg = currentQrSettings.background || "#ffffff";

            const qr = new QRCode(container, {
                text: qrText,
                width: 180,
                height: 180,
                colorDark: fg,
                colorLight: bg,
                correctLevel: QRCode.CorrectLevel.L
            });

            // Allow rendering time? qrcode.js is synchronous for instantiation but image drawing might take a tick?
            // Usually synchronous for Canvas.

            if (fmt === 'png') {
                const canvas = container.querySelector('canvas');
                if (!canvas) {
                    alert("Error generating QR");
                    document.body.removeChild(container);
                    return;
                }

                const finalCanvas = document.createElement('canvas');
                finalCanvas.width = canvas.width;
                finalCanvas.height = canvas.height;
                const ctx = finalCanvas.getContext('2d');

                // Bg
                ctx.fillStyle = bg;
                ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
                ctx.drawImage(canvas, 0, 0);

                const downloadFinal = () => {
                    downloadDataUrl(finalCanvas.toDataURL("image/png"), "qr-code.png");
                    document.body.removeChild(container);
                };

                // Add Logo
                if (!currentQrSettings.noLogo) {
                    const logoImg = new Image();
                    logoImg.onload = () => {
                        const logoSize = 48;
                        const x = (finalCanvas.width - logoSize) / 2;
                        const y = (finalCanvas.height - logoSize) / 2;

                        ctx.fillStyle = bg;
                        ctx.fillRect(x, y, logoSize, logoSize);

                        ctx.strokeStyle = "#25D6D7";
                        ctx.lineWidth = 3;
                        ctx.strokeRect(x, y, logoSize, logoSize);

                        const padding = 6;
                        ctx.drawImage(logoImg, x + padding, y + padding, logoSize - (padding * 2), logoSize - (padding * 2));

                        downloadFinal();
                    };
                    logoImg.onerror = () => {
                        downloadFinal();
                    };
                    // Use custom logo if available
                    logoImg.src = currentQrSettings.logoDataUrl || "assets/icons/icon48.png";
                } else {
                    downloadFinal();
                }

            } else if (fmt === 'svg') {
                if (!qr || !qr._oQRCode || !qr._oQRCode.modules) {
                    document.body.removeChild(container);
                    return;
                }

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
                    if (logoB64 && !currentQrSettings.noLogo) {
                        // Logo
                        const logoSize = 48;
                        const xy = (size - logoSize) / 2;
                        svgContent += `<rect x="${xy}" y="${xy}" width="${logoSize}" height="${logoSize}" fill="${bg}" stroke="#25D6D7" stroke-width="3" rx="10" />`;

                        const padding = 6;
                        const innerSize = logoSize - (padding * 2);
                        const innerXY = xy + padding;
                        svgContent += `<image href="${logoB64}" x="${innerXY}" y="${innerXY}" height="${innerSize}" width="${innerSize}"/>`;
                    }

                    svgContent += `</svg>`;
                    const blobSvg = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
                    const url = URL.createObjectURL(blobSvg);
                    downloadDataUrl(url, "qr-code.svg");
                    document.body.removeChild(container);
                };

                if (!currentQrSettings.noLogo) {
                    const logoSrc = currentQrSettings.logoDataUrl || "assets/icons/icon48.png";
                    // If it's a data URL, we can use it directly? Yes, image href supports data URI.
                    // But if it's a path like "assets/...", we need to fetch it to get base64/blob for standalone SVG.

                    if (logoSrc.startsWith('data:')) {
                        finishSvg(logoSrc);
                    } else {
                        fetch(logoSrc)
                            .then(r => r.blob())
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
            }

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
        const { linkHistory: realHistory = [] } = await chrome.storage.local.get(['linkHistory']);

        // --- Demo Data Injection for Robust Screenshots ---
        const dummyData = [];
        const demoSources = ['facebook', 'newsletter', 'google', 'linkedin', 'twitter'];
        const demoMediums = ['social', 'email', 'cpc', 'referral'];
        const demoTypes = ['qr', 'utm', 'shortened'];
        const demoToday = new Date();

        // Generate ~150 dummy records spread over 14 days
        for (let i = 0; i < 150; i++) {
            const daysAgo = Math.floor(Math.random() * 14);
            const date = new Date();
            date.setDate(demoToday.getDate() - daysAgo);
            // Random hour/min to make it look organic
            date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

            dummyData.push({
                timestamp: date.getTime(),
                utm: {
                    source: demoSources[Math.floor(Math.random() * demoSources.length)],
                    medium: demoMediums[Math.floor(Math.random() * demoMediums.length)],
                    campaign: 'summer_sale_2026'
                },
                type: demoTypes[Math.floor(Math.random() * demoTypes.length)],
                shortened: Math.random() > 0.5
            });
        }

        // Combine real data with dummy data
        const linkHistory = [...realHistory, ...dummyData];
        // --- End Demo Data ---


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

        // Update KPIs
        const kpiTotal = document.getElementById('kpi-total');
        const kpiWeek = document.getElementById('kpi-week');
        const kpiSource = document.getElementById('kpi-source');

        const compTotal = document.getElementById('compliment-total');
        const compWeek = document.getElementById('compliment-week');
        const compSource = document.getElementById('compliment-source');

        if (kpiTotal) kpiTotal.textContent = total;
        if (kpiWeek) kpiWeek.textContent = weekCount;

        const sortedSources = Object.entries(sources).sort((a, b) => b[1] - a[1]);
        const topSource = sortedSources.length > 0 ? sortedSources[0][0] : '-';
        if (kpiSource) kpiSource.textContent = topSource;

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


});
