// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: "onboarding.html" });
  }

  chrome.contextMenus.create({
    id: "decode-url",
    title: "Copy Boosted Link",
    contexts: ["link", "selection", "page"]
  });

  // Set default shortcut if not exists
  chrome.storage.local.get(['shortcutKey'], (result) => {
    if (!result.shortcutKey) {
      chrome.storage.local.set({
        shortcutKey: { key: 'C', altKey: true, shiftKey: false, ctrlKey: false, metaKey: false }
      });
    }
  });
});

// Listen for Supabase Auth redirect from the website
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  if (request.action === "openOptions") {
    const targetUrl = chrome.runtime.getURL("options.html" + (request.hash || ""));
    chrome.tabs.create({ url: targetUrl });
  }
});

// ... (existing code)

// Helper: Show QR Overlay on Page
async function showQrOnPage(tabId, finalUrl) {
  // 1. Inject QR Library
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['assets/qrcode.min.js']
  });

  // 2. Fetch Logo as Data URL (Base64) to avoid permission issues
  const logoUrl = chrome.runtime.getURL('assets/icons/icon48.png');
  let logoDataUrl = logoUrl;
  try {
    const response = await fetch(logoUrl);
    const blob = await response.blob();
    logoDataUrl = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn("Failed to convert logo to base64", e);
  }

  // 3. Inject Overlay Logic
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (url, logoSrc) => {
      // Remove existing
      const existing = document.getElementById('lb-qr-overlay');
      if (existing) existing.remove();

      // Create Overlay
      const overlay = document.createElement('div');
      overlay.id = 'lb-qr-overlay';
      Object.assign(overlay.style, {
        position: 'fixed',
        top: '0', left: '0',
        width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: '2147483647',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: '0',
        transition: 'opacity 0.3s'
      });

      // Create Card
      const card = document.createElement('div');
      Object.assign(card.style, {
        background: 'white',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '300px',
        textAlign: 'center'
      });

      // Close Button
      const closeBtn = document.createElement('div');
      closeBtn.innerHTML = '&times;';
      Object.assign(closeBtn.style, {
        position: 'absolute',
        top: '10px', right: '14px',
        fontSize: '24px',
        color: '#b2bec3',
        cursor: 'pointer',
        lineHeight: '1'
      });
      closeBtn.onclick = () => overlay.remove();
      card.appendChild(closeBtn);

      // Title
      const title = document.createElement('h3');
      title.textContent = 'Your Free QR Code';
      title.style.margin = '0 0 16px 0';
      title.style.color = '#2d3436';
      title.style.fontFamily = 'Segoe UI, sans-serif';
      card.appendChild(title);

      // QR Container
      const qrWrapper = document.createElement('div');
      Object.assign(qrWrapper.style, {
        position: 'relative',
        padding: '10px',
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #f1f3f5'
      });

      const qrCodeDiv = document.createElement('div');
      qrWrapper.appendChild(qrCodeDiv);

      // Logo
      // Logo
      if (logoSrc) {
        const logo = document.createElement('img');
        logo.src = logoSrc;
        Object.assign(logo.style, {
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '48px', height: '48px',
          background: 'white',
          padding: '6px',
          borderRadius: '10px',
          border: '3px solid #25D6D7',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        });
        qrWrapper.appendChild(logo);
      }
      card.appendChild(qrWrapper);

      // URL Text
      const urlText = document.createElement('div');
      urlText.textContent = url;
      Object.assign(urlText.style, {
        fontSize: '11px',
        color: '#636e72',
        marginTop: '12px',
        wordBreak: 'break-all',
        display: '-webkit-box',
        webkitLineClamp: '3',
        webkitBoxOrient: 'vertical',
        overflow: 'hidden',
        maxHeight: '48px',
        fontFamily: 'Segoe UI, sans-serif',
        direction: 'ltr'
      });
      card.appendChild(urlText);

      // Actions
      const actionsDiv = document.createElement('div');
      Object.assign(actionsDiv.style, {
        display: 'flex',
        gap: '8px',
        justifyContent: 'center',
        marginTop: '8px'
      });

      const btnStyle = {
        fontSize: '11px',
        padding: '4px 8px',
        background: '#f1f3f5',
        border: '1px solid #dfe6e9',
        borderRadius: '4px',
        cursor: 'pointer',
        color: '#2d3436',
        fontFamily: 'Segoe UI, sans-serif',
        transition: 'all 0.2s'
      };

      const addHover = (btn) => {
        btn.onmouseover = () => {
          btn.style.borderColor = '#25D6D7';
          btn.style.color = '#25D6D7';
          btn.style.background = 'white';
        };
        btn.onmouseout = () => {
          btn.style.borderColor = '#dfe6e9';
          btn.style.color = '#2d3436';
          btn.style.background = '#f1f3f5';
        };
      };

      const dlPng = document.createElement('button');
      dlPng.textContent = 'Download PNG';
      Object.assign(dlPng.style, btnStyle);
      addHover(dlPng);

      const dlSvg = document.createElement('button');
      dlSvg.textContent = 'Download SVG';
      Object.assign(dlSvg.style, btnStyle);
      addHover(dlSvg);

      actionsDiv.appendChild(dlPng);
      actionsDiv.appendChild(dlSvg);
      card.appendChild(actionsDiv);

      overlay.appendChild(card);
      document.body.appendChild(overlay);

      // Generate QR
      const qrText = new URL(url).toString();
      const qr = new QRCode(qrCodeDiv, {
        text: qrText,
        width: 180,
        height: 180,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.L
      });

      // Download Helper
      const downloadImage = (dataUrl, filename) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      // PNG Logic
      dlPng.onclick = (e) => {
        e.stopPropagation();
        const canvas = qrCodeDiv.querySelector('canvas');
        if (!canvas) return;

        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = canvas.width;
        finalCanvas.height = canvas.height;
        const ctx = finalCanvas.getContext('2d');

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        ctx.drawImage(canvas, 0, 0);

        if (logoSrc) {
          const logoImg = new Image();
          logoImg.onload = () => {
            const logoSize = 48;
            const x = (finalCanvas.width - logoSize) / 2;
            const y = (finalCanvas.height - logoSize) / 2;

            ctx.fillStyle = "#ffffff";
            ctx.fillRect(x, y, logoSize, logoSize);

            ctx.strokeStyle = "#25D6D7";
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, logoSize, logoSize);

            const padding = 6;
            ctx.drawImage(logoImg, x + padding, y + padding, logoSize - (padding * 2), logoSize - (padding * 2));

            downloadImage(finalCanvas.toDataURL("image/png"), "qr-code.png");
          };
          logoImg.src = logoSrc;
        } else {
          downloadImage(finalCanvas.toDataURL("image/png"), "qr-code.png");
        }
      };

      // SVG Logic
      dlSvg.onclick = (e) => {
        e.stopPropagation();
        if (!qr || !qr._oQRCode || !qr._oQRCode.modules) return;

        const modules = qr._oQRCode.modules;
        const modCount = qr._oQRCode.moduleCount;
        const size = 180;
        const tileSize = size / modCount;

        let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
        svgContent += `<rect width="100%" height="100%" fill="#ffffff"/>`;

        for (let r = 0; r < modCount; r++) {
          for (let c = 0; c < modCount; c++) {
            if (modules[r][c]) {
              svgContent += `<rect x="${c * tileSize}" y="${r * tileSize}" width="${tileSize}" height="${tileSize}" fill="#000000"/>`;
            }
          }
        }

        if (logoSrc) {
          const logoSize = 48;
          const xy = (size - logoSize) / 2;

          svgContent += `<rect x="${xy}" y="${xy}" width="${logoSize}" height="${logoSize}" fill="#ffffff" stroke="#25D6D7" stroke-width="3" rx="10" />`;

          const padding = 6;
          const innerSize = logoSize - (padding * 2);
          const innerXY = xy + padding;

          svgContent += `<image href="${logoSrc}" x="${innerXY}" y="${innerXY}" height="${innerSize}" width="${innerSize}"/>`;
        }

        svgContent += `</svg>`;

        const blobSvg = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blobSvg);
        downloadImage(url, "qr-code.svg");
      };

      // Animate In
      requestAnimationFrame(() => {
        overlay.style.opacity = '1';
      });

      // Close on BG click
      overlay.onclick = (e) => {
        if (e.target === overlay) overlay.remove();
      };
    },
    args: [finalUrl, logoDataUrl || ""]
  });
}

// ... (existing helper functions: cleanUrl, appendUtm, shortenUrl, etc.)

// Context menu click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;

  // Prevent scripting on restricted URLs to avoid "Cannot access contents of the page" errors
  if (tab.url && (tab.url.startsWith('chrome:') || tab.url.startsWith('edge:') || tab.url.startsWith('about:') || tab.url.startsWith('https://chrome.google.com/webstore'))) {
    console.warn("Link Booster: Cannot run scripts on this restricted page.", tab.url);
    return;
  }

  let textToDecode = "";
  if (info.linkUrl) textToDecode = info.linkUrl;
  else if (info.selectionText) textToDecode = info.selectionText;
  else if (tab.url) textToDecode = tab.url;

  // Check storage for params
  const result = await new Promise(resolve => chrome.storage.local.get(['decodedMode', 'cleanMode', 'socialMode', 'utmMode', 'shortenMode', 'utmParams'], resolve));

  // Determine effective 'decoded' preference: Force true if menu action is "Copy Decoded Link"
  let decoded = result.decodedMode !== undefined ? result.decodedMode : true;
  if (info.menuItemId === "decode-url") decoded = true;

  const clean = result.cleanMode || false;
  const social = result.socialMode || false;
  const shorten = result.shortenMode || false;
  const utmParams = result.utmMode ? result.utmParams : null;

  // Determine Title
  let historyTitle = tab.title || "Link";
  if (info.linkUrl) {
    if (info.selectionText) {
      historyTitle = info.selectionText;
    } else {
      // Try to get a meaningful name from the URL itself
      const slug = extractSlug(info.linkUrl);
      if (slug) {
        historyTitle = slug;
      } else {
        try {
          historyTitle = new URL(info.linkUrl).hostname;
        } catch (e) { }
      }
    }
  }

  // Shared processing logic
  // 1. Clean
  let textToProcess = textToDecode;
  if (clean) textToProcess = cleanUrl(textToProcess);

  // 2. UTM
  if (utmParams) textToProcess = appendUtm(textToProcess, utmParams);

  // 3. Shorten OR Decode (Calculation)
  let finalProcessUrl = textToProcess;
  if (shorten) {
    // Note: Shortening is async
    try {
      finalProcessUrl = await shortenUrl(textToProcess, historyTitle);
    } catch (e) { console.error(e); }
  } else if (decoded) {
    finalProcessUrl = decodeURIComponent(textToProcess);
  }

  // 4. Save History
  const type = info.menuItemId === "generate-qr" ? "qr" : "link";
  if (utmParams || shorten || type === "qr") {
    addToHistory({
      timestamp: Date.now(),
      title: historyTitle,
      originalUrl: textToDecode,
      finalUrl: finalProcessUrl,
      utm: utmParams,
      shortened: shorten,
      type: type
    });
  }

  // Switch Action
  if (info.menuItemId === "generate-qr") {
    showQrOnPage(tab.id, finalProcessUrl);
  } else {
    // "decode-url" (Copy)
    copyAndToast(tab.id, finalProcessUrl, false, false, social, false, null, false, historyTitle, textToDecode);
  }
});

// Helper: Clean Tracking Params
function cleanUrl(url) {
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
}

// Helper: Append UTM Params
function appendUtm(url, params) {
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
}

// Helper: Extract meaningful alias from URL or Title
function extractSlug(url, title) {
  try {
    const candidates = [];

    // 1. Path Segment
    try {
      const path = new URL(url).pathname;
      const decodedPath = decodeURIComponent(path);
      const segments = decodedPath.split('/').filter(s => s && s !== 'index.html');
      if (segments.length > 0) candidates.push(segments[segments.length - 1]);
    } catch (e) { }

    // 2. Title
    if (title) {
      const shortTitle = title.split(/ [|\-–—:] /)[0].trim();
      candidates.push(shortTitle);
    }

    for (let raw of candidates) {
      if (!raw) continue;
      let slug = raw.toString().replace(/\.[^/.]+$/, "");
      slug = slug.toLowerCase();
      slug = slug.replace(/[^a-z0-9]/g, "-");
      slug = slug.replace(/-+/g, "-").replace(/^-|-$/g, "");
      if (slug.length >= 3) {
        if (slug.length > 30) slug = slug.substring(0, 30);
        return slug;
      }
    }
    return null;
  } catch (e) { return null; }
}

// Helper: Shorten URL (TinyURL)
async function shortenUrl(url, title = "") {
  try {
    let apiUrl = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`;

    // Attempt Auto-Alias
    const slug = extractSlug(url, title);
    if (slug) {
      // Add random suffix to improve success rate
      const suffix = Math.random().toString(36).substring(2, 6);
      apiUrl += `&alias=${slug}-${suffix}`;
    }

    const response = await fetch(apiUrl);
    const text = response.ok ? await response.text() : "";

    if (response.ok && text.startsWith("http")) {
      return text;
    }

    // Retry without alias
    if (slug) {
      const padding = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
      if (padding.ok) return await padding.text();
    }

    return url;
  } catch (e) {
    console.error("Shortener error:", e);
    return url;
  }
}

// Helper: Add to History
function addToHistory(record) {
  chrome.storage.local.get(['linkHistory'], (result) => {
    const history = result.linkHistory || [];
    history.push(record);
    if (history.length > 50) history.shift();
    chrome.storage.local.set({ linkHistory: history });
  });
}

// Helper: Detect language and return config
function detectLanguage(text, title = "") {
  // Combine text and title
  const sample = (text + " " + title);

  // Ordered by specificity.
  const configs = [
    {
      // Hebrew
      test: /[\u0590-\u05FF]/,
      msg: "קישור בעברית הועתק בהצלחה!",
      rtl: true,
      color: "#70E000" // Green
    },
    {
      // Arabic / Urdu (General Arabic script)
      test: /[\u0600-\u06FF\u0750-\u077F]/,
      msg: "تم نسخ الرابط بنجاح!",
      rtl: true,
      color: "#2ecc71"
    },
    {
      // Chinese (Han)
      test: /[\u4E00-\u9FFF]/,
      msg: "链接已复制！",
      rtl: false,
      color: "#e74c3c" // Red
    },
    {
      // Japanese (Hiragana, Katakana)
      test: /[\u3040-\u309F\u30A0-\u30FF]/,
      msg: "リンクをコピーしました！",
      rtl: false,
      color: "#ff9f43"
    },
    {
      // Korean (Hangul)
      test: /[\uAC00-\uD7AF\u1100-\u11FF]/,
      msg: "링크가 성공적으로 복사되었습니다!",
      rtl: false,
      color: "#3498db"
    },
    {
      // Russian (Cyrillic)
      test: /[\u0400-\u04FF]/,
      msg: "Ссылка успешно скопирована!",
      rtl: false,
      color: "#9b59b6"
    },
    {
      // Hindi / Marathi (Devanagari)
      test: /[\u0900-\u097F]/,
      msg: "लिंक सफलतापूर्वक कॉपी किया गया!",
      rtl: false,
      color: "#e67e22"
    },
    {
      // Bengali
      test: /[\u0980-\u09FF]/,
      msg: "লিঙ্ক সফলভাবে কপি করা হয়েছে!",
      rtl: false,
      color: "#16a085"
    },
    {
      // Telugu
      test: /[\u0C00-\u0C7F]/,
      msg: "లింక్ విజయవంతంగా కాపీ చేయబడింది!",
      rtl: false,
      color: "#f1c40f"
    },
    {
      // Spanish (Special chars)
      test: /[áéíóúñÁÉÍÓÚÑüÜ¡¿]/,
      msg: "¡Enlace copiado con éxito!",
      rtl: false,
      color: "#2ecc71"
    },
    {
      // French (Special chars)
      test: /[àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ]/,
      msg: "Lien copié avec succès !",
      rtl: false,
      color: "#3498db"
    },
    {
      // Portuguese (Special chars)
      test: /[ãõÃÕçÇ]/,
      msg: "Link copiado com sucesso!",
      rtl: false,
      color: "#27ae60"
    },
    {
      // German (Special chars)
      test: /[äöüßÄÖÜ]/,
      msg: "Link erfolgreich kopiert!",
      rtl: false,
      color: "#f39c12"
    },
    {
      // Turkish (Special chars)
      test: /[ğüşöçİĞÜŞÖÇı]/,
      msg: "Bağlantı başarıyla kopyalandı!",
      rtl: false,
      color: "#e17055"
    },
    {
      // Vietnamese
      test: /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/,
      msg: "Liên kết đã được sao chép thành công!",
      rtl: false,
      color: "#00b894"
    },
    {
      // Tamil
      test: /[\u0B80-\u0BFF]/,
      msg: "இணைப்பு வெற்றிகரமாக நகலெடுக்கப்பட்டது!",
      rtl: false,
      color: "#e84393"
    }
  ];

  for (const config of configs) {
    if (config.test.test(sample)) {
      return config;
    }
  }

  // Default / English
  return {
    msg: "Link copied successfully!",
    rtl: false,
    color: "#70E000" // Standard Green
  };
}

// Helper: run code in the page that copies + shows toast
async function copyAndToast(tabId, textToDecode, shouldDecode = true, shouldClean = false, shouldSocial = false, suppressCopy = false, utmParams = null, shouldShorten = false, pageTitle = "", detectionOverride = "") {
  if (!textToDecode) return;

  // 1. Clean first if requested
  let textToProcess = textToDecode;
  if (shouldClean) {
    textToProcess = cleanUrl(textToProcess);
  }

  // 2. Append UTMs if requested
  if (utmParams) {
    textToProcess = appendUtm(textToProcess, utmParams);
  }

  // 3. Shorten OR Decode
  let finalCopyText = textToProcess;
  if (shouldShorten) {
    finalCopyText = await shortenUrl(textToProcess, pageTitle);
  } else if (shouldDecode) {
    finalCopyText = decodeURIComponent(textToProcess);
  }

  // 4. Save to History (if UTM or Shortened)
  if (utmParams || shouldShorten) {
    addToHistory({
      timestamp: Date.now(),
      title: pageTitle || "Link",
      originalUrl: textToDecode,
      finalUrl: finalCopyText,
      utm: utmParams,
      shortened: shouldShorten
    });
  }

  // Detect language for toast text direction/content
  // Use detectionOverride if present, otherwise finalCopyText/textToProcess
  let detectionTarget = detectionOverride || (shouldShorten ? textToProcess : finalCopyText);
  let detectionText = detectionTarget;
  try { detectionText = decodeURIComponent(detectionTarget); } catch (e) { }

  const detected = detectLanguage(detectionText, pageTitle);
  console.log("Language Detection Debug:", {
    original: textToProcess,
    final: finalCopyText,
    detectionFallback: detectionTarget,
    decoded: detectionText,
    title: pageTitle,
    result: detected
  });

  chrome.scripting.executeScript({
    target: { tabId },
    func: (text, config, showSocial, validUrl, suppressCopy) => {
      // Fallback if args not passed correctly
      const actualText = validUrl || text;

      const runCopy = async () => {
        if (suppressCopy) return;
        try {
          await navigator.clipboard.writeText(text);
        } catch (e) {
          console.log("Clipboard writeText failed, trying fallback", e);
          const input = document.createElement('textarea');
          input.value = text;
          input.style.position = 'fixed';
          input.style.opacity = '0';
          document.body.appendChild(input);
          input.select();
          const success = document.execCommand('copy');
          document.body.removeChild(input);
          if (!success) throw new Error("Legacy copy failed");
        }
      };

      runCopy()
        .then(() => {
          // ===== TOAST =====
          const toast = document.createElement("div");
          toast.textContent = config.msg;
          toast.style.position = "fixed";
          toast.style.top = "30px";
          toast.style.left = "50%";
          toast.style.transform = "translateX(-50%)";
          toast.style.background = config.color || "#70E000";
          toast.style.color = "#fff";
          if (config.color === "#FFFFFF") toast.style.color = "#000";

          toast.style.padding = "14px 22px";
          toast.style.borderRadius = "8px";
          toast.style.fontSize = "16px";
          toast.style.fontWeight = "600";
          toast.style.zIndex = "2147483647"; // Max z-index
          toast.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)";
          toast.style.opacity = "0";
          toast.style.transition = "opacity 0.3s ease, transform 0.3s ease";
          toast.style.pointerEvents = "none";

          if (config.rtl) {
            toast.style.direction = "rtl";
            toast.style.textAlign = "right";
          } else {
            toast.style.direction = "ltr";
            toast.style.textAlign = "center";
          }

          document.body.appendChild(toast);

          // Animate Toast
          requestAnimationFrame(() => {
            toast.style.opacity = "1";
            toast.style.transform = "translateX(-50%) translateY(6px)";
          });

          setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateX(-50%) translateY(0px)";
            setTimeout(() => toast.remove(), 300);
          }, 1800);

          // ===== CONFETTI =====
          const canvas = document.createElement("canvas");
          canvas.style.position = "fixed";
          canvas.style.top = "0";
          canvas.style.left = "0";
          canvas.style.width = "100%";
          canvas.style.height = "100%";
          canvas.style.pointerEvents = "none";
          canvas.style.zIndex = "999998";
          document.body.appendChild(canvas);

          const ctx = canvas.getContext("2d");

          function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
          }
          resizeCanvas();
          const resizeHandler = () => resizeCanvas();
          window.addEventListener("resize", resizeHandler);

          const colors = [config.color, "#FFFFFF", "#FFD700", "#FF5733"];
          const confettiCount = 80;
          const confetti = [];

          const toastRect = toast.getBoundingClientRect();
          const centerX = toastRect.left + toastRect.width / 2;
          const startYMin = toastRect.top - 80;
          const startYMax = toastRect.top - 40;

          for (let i = 0; i < confettiCount; i++) {
            const side = Math.random();
            let x, y, vx, vy;
            if (side < 0.5) {
              x = centerX + (Math.random() * toastRect.width - toastRect.width / 2);
              y = startYMin + Math.random() * (startYMax - startYMin);
              vx = -0.3 + Math.random() * 0.6;
              vy = 0.8 + Math.random() * 1.2;
            } else if (side < 0.75) {
              x = centerX + (Math.random() * 40 - 20);
              y = startYMin + Math.random() * (startYMax - startYMin);
              vx = -(1.0 + Math.random() * 1.0);
              vy = 0.7 + Math.random() * 1.0;
            } else {
              x = centerX + (Math.random() * 40 - 20);
              y = startYMin + Math.random() * (startYMax - startYMin);
              vx = (1.0 + Math.random() * 1.0);
              vy = 0.7 + Math.random() * 1.0;
            }
            confetti.push({
              x, y, vx, vy,
              w: 6 + Math.random() * 4,
              h: 10 + Math.random() * 6,
              rotation: Math.random() * 2 * Math.PI,
              rotationSpeed: -0.08 + Math.random() * 0.16,
              color: colors[Math.floor(Math.random() * colors.length)]
            });
          }

          let startTime = null;
          const duration = 2000;
          function animateConfetti(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            confetti.forEach((p) => {
              p.x += p.vx;
              p.y += p.vy;
              p.rotation += p.rotationSpeed;
              ctx.save();
              ctx.translate(p.x, p.y);
              ctx.rotate(p.rotation);
              ctx.fillStyle = p.color;
              ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
              ctx.restore();
            });
            if (elapsed < duration) {
              requestAnimationFrame(animateConfetti);
            } else {
              window.removeEventListener("resize", resizeHandler);
              canvas.remove();
            }
          }
          requestAnimationFrame(animateConfetti);

          // ===== SOCIAL POPUP =====
          if (showSocial) {
            // Remove existing if any
            const existing = document.getElementById("lb-social-popup");
            if (existing) existing.remove();

            const socialContainer = document.createElement("div");
            socialContainer.id = "lb-social-popup";

            // Design matching the screenshot:
            // Grey background, rounded corners, grid layout
            Object.assign(socialContainer.style, {
              position: "fixed",
              top: "100px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#dcdcdc", // Light grey from visual
              borderRadius: "16px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
              padding: "20px 24px",
              zIndex: "2147483647",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              width: "auto",
              minWidth: "200px", // Reduced width since fewer icons
              animation: "lbPopIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            });

            // Inject Styles for animation & hover
            const style = document.createElement("style");
            style.textContent = `
              @keyframes lbPopIn {
                from { opacity: 0; transform: translateX(-50%) scale(0.9); }
                to { opacity: 1; transform: translateX(-50%) scale(1); }
              }
              .lb-social-icon {
                width: 48px;
                height: 48px;
                transition: transform 0.2s ease;
                cursor: pointer;
                display: block;
              }
              .lb-social-icon:hover {
                transform: scale(1.1);
              }
              .lb-close-btn {
                position: absolute;
                top: 10px;
                right: 14px;
                font-family: sans-serif;
                font-size: 20px;
                color: #555;
                cursor: pointer;
                line-height: 1;
              }
              .lb-close-btn:hover { color: #000; }
            `;
            document.head.appendChild(style);

            // Title
            const title = document.createElement("div");
            title.textContent = "Share link on";
            Object.assign(title.style, {
              fontSize: "18px",
              fontWeight: "600",
              color: "#222",
              textAlign: "center",
              fontFamily: "Segoe UI, system-ui, sans-serif",
              marginBottom: "8px"
            });
            socialContainer.appendChild(title);

            // Close Button
            const closeBtn = document.createElement("div");
            closeBtn.className = "lb-close-btn";
            closeBtn.innerHTML = "&times;"; // Standard X
            closeBtn.onclick = () => { socialContainer.remove(); style.remove(); };
            socialContainer.appendChild(closeBtn);

            // Grid Container
            const grid = document.createElement("div");
            Object.assign(grid.style, {
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "16px",
              justifyItems: "center"
            });

            // Social Providers
            // Some platforms (FB, LinkedIn) need encoded URLs for their crawlers.
            // Chat apps (WhatsApp, Telegram) look better with decoded human-readable links.
            const encodedUrl = encodeURIComponent(actualText || text);
            const decodedUrl = encodeURIComponent(decodeURIComponent(actualText || text)); // Decode then re-encode just the query param part for the API

            // Actually, for WA/Telegram API, we usually pass `text=URL`. 
            // If we pass `text=http://.../שלום`, the browser/OS handles the encoding when opening the intent.
            // But to be safe for the URL parameter *itself*, it should be encoded, but the *content* inside it should be the decoded string.
            // Let's rely on standard encodeURIComponent of the *Decoded* string for Chat apps.
            const urlForChats = encodeURIComponent(decodeURIComponent(actualText || text));

            const providers = [
              { file: "facebook-logo.svg", url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
              { file: "linkedin-logo.svg", url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
              { file: "whatsapp-logo.svg", url: `https://api.whatsapp.com/send?text=${urlForChats}` },
              { file: "telegram-logo.svg", url: `https://t.me/share/url?url=${urlForChats}` }
            ];

            providers.forEach(p => {
              const a = document.createElement("a");
              a.href = p.url;
              a.target = "_blank";

              const img = document.createElement("img");
              img.src = chrome.runtime.getURL(`assets/social-share-logos/${p.file}`);
              img.className = "lb-social-icon";
              // Disable draggable to feel more app-like
              img.draggable = false;

              a.appendChild(img);
              grid.appendChild(a);
            });

            socialContainer.appendChild(grid);
            document.body.appendChild(socialContainer);
          }
        })
        .catch(err => {
          console.error("Clipboard error:", err);
          alert("Error copying link / שגיאה בהעתקת הקישור");
        });
    },
    args: [finalCopyText, detected, shouldSocial, textToProcess, suppressCopy]
  });
}

// Receive message from Popup or Content Script (Shortcut)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "copyFromPopup") {
    copyAndToast(request.tabId, request.url, request.decoded, request.clean, request.social, request.suppressCopy, null, false, request.title, request.originalUrl);
    sendResponse({ success: true });
  }

  if (request.action === "shortcutTriggered") {
    // Sender tab is where the key was pressed
    const tab = sender.tab;
    if (tab && tab.id) {
      chrome.storage.local.get(['decodedMode', 'cleanMode', 'socialMode', 'utmMode', 'shortenMode', 'utmParams'], (result) => {
        const decoded = result.decodedMode !== undefined ? result.decodedMode : true;
        const clean = result.cleanMode || false;
        const social = result.socialMode || false;
        const shorten = result.shortenMode || false;
        const utmParams = result.utmMode ? result.utmParams : null;

        copyAndToast(tab.id, tab.url, decoded, clean, social, false, utmParams, shorten, tab.title);
      });
    }
  }
});


