document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const nextBtn = document.getElementById('next-btn');
    const modKey1 = document.getElementById('mod-key-1');
    const shortcutKey = document.getElementById('shortcut-key');

    let currentSlide = 0;

    // Load actual shortcut
    chrome.storage.local.get(['shortcutKey'], (result) => {
        if (result.shortcutKey) {
            const sh = result.shortcutKey;

            // Determine primary modifier
            if (sh.cmdKey || sh.metaKey) modKey1.textContent = "Cmd";
            else if (sh.ctrlKey) modKey1.textContent = "Ctrl";
            else if (sh.altKey) modKey1.textContent = "Alt";
            else modKey1.textContent = "";

            if (!modKey1.textContent) modKey1.style.display = 'none';

            shortcutKey.textContent = sh.key.toUpperCase();
        }
    });

    const updateSlides = () => {
        slides.forEach((slide, index) => {
            slide.classList.remove('active', 'exit');
            if (index === currentSlide) {
                slide.classList.add('active');
            } else if (index < currentSlide) {
                slide.classList.add('exit');
            }
        });

        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });

        if (currentSlide === slides.length - 1) {
            nextBtn.textContent = "Get Started";
        } else {
            nextBtn.textContent = "Next";
        }
    };

    nextBtn.addEventListener('click', () => {
        if (currentSlide < slides.length - 1) {
            currentSlide++;
            updateSlides();
        } else {
            // Finish
            window.close();
        }
    });

    // Optional: Allow dot clicking
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.dataset.index);
            currentSlide = index;
            updateSlides();
        });
    });

    // Shortcut to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') window.close();
    });

    // Language Demo Logic
    const demoContainer = document.querySelector('#slide-2 .decoding-container');
    const demoToggle = document.querySelector('#slide-2 .demo-toggle-row .demo-toggle');
    const demoEncoded = document.getElementById('demo-encoded');
    const demoDecoded = document.getElementById('demo-decoded');
    const langDesc = document.getElementById('lang-desc');

    if (demoContainer && demoToggle && demoEncoded && demoDecoded && langDesc) {
        const examples = [
            { id: 'he', label: 'Hebrew', enc: '%D7%94%D7%97%D7%95%D7%9E%D7%95%D7%A1-%D7%94%D7%9B%D7%99-%D7%98%D7%95%D7%91-%D7%AA%D7%9C-%D7%90%D7%91%D7%99%D7%91-2024', dec: 'החומוס-הכי-טוב-תל-אביב-2024' },
            { id: 'ru', label: 'Russian', enc: '%D0%BA%D0%B0%D0%BA-%D0%BF%D1%80%D0%B8%D0%B3%D0%BE%D1%82%D0%BE%D0%B2%D0%B8%D1%82%D1%8C-%D0%B1%D0%BE%D1%80%D1%89-%D1%80%D0%B5%D1%86%D0%B5%D0%BF%D1%82', dec: 'как-приготовить-борщ-рецепт' },
            { id: 'hi', label: 'Hindi', enc: '%E0%A4%87%E0%A4%B8-%E0%A4%B8%E0%A4%BE%E0%A4%B2-%E0%A4%95%E0%A5%80-%E0%A4%B6%E0%A5%80%E0%A4%B0%E0%A5%8D%E0%A4%B7-%E0%A4%AC%E0%A5%89%E0%A4%B2%E0%A5%80%E0%A4%B5%E0%A5%81%E0%A4%A1-%E0%A4%AB%E0%A4%BF%E0%A4%B2%E0%A5%8D%E0%A4%AE%E0%A5%87%E0%A4%82', dec: 'इस-साल-की-शीर्ष-बॉलीवुड-फिल्में' },
            { id: 'ar', label: 'Arabic', enc: '%D8%AA%D8%B9%D9%84%D9%85-%D8%A7%D9%84%D9%84%D8%BA%D8%A9-%D8%A7%D9%84%D8%B9%D8%B1%D8%A8%D9%8A%D8%A9-%D8%A8%D8%B3%D9%87%D9%88%D9%84%D8%A9', dec: 'تعلم-اللغة-العربية-بسهولة' },
            { id: 'zh', label: 'Chinese', enc: '%E6%98%A5%E8%8A%82-%E6%97%85%E6%B8%B8-%E6%8C%87%E5%8D%97', dec: '春节-旅游-指南' }
        ];

        let exampleIndex = 0;
        let isLoopRunning = false;
        let activeInterval = null;

        // Start loop only when Slide 2 is active
        const startDemoLoop = async () => {
            if (isLoopRunning) return;
            isLoopRunning = true;

            // Loop functionality
            while (isLoopRunning && currentSlide === 1) { // Ensure still on slide 2
                const ex = examples[exampleIndex];

                // 1. Reset State (OFF, Encoded)
                demoToggle.classList.remove('active');
                demoContainer.classList.remove('reveal');
                langDesc.textContent = "";
                demoEncoded.textContent = ex.enc;
                demoDecoded.textContent = ex.dec;

                // Small pause before typing
                await wait(1000); // 1 second waiting
                if (currentSlide !== 1) break;

                // 2. Type Language
                await typeText(ex.label);
                if (currentSlide !== 1) break;

                // Human reaction time before clicking toggle
                await wait(100);

                // 3. Sync Trigger: Toggle ON + Decode
                // Forces both transitions to start in the same frame
                demoToggle.classList.add('active');
                demoContainer.classList.add('reveal');

                // 4. Wait for reading (User admires the green link)
                await wait(2500);
                if (currentSlide !== 1) break;

                // 5. Reset for next loop
                // Toggle bumps back OFF
                demoToggle.classList.remove('active');
                demoContainer.classList.remove('reveal');

                // Simultaneous delete phase
                await deleteText();
                if (currentSlide !== 1) break;

                // Prepare next
                exampleIndex = (exampleIndex + 1) % examples.length;
                await wait(300); // Breathe before next loop
            }

            isLoopRunning = false;
        };

        // Helper: Wait Promise
        const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // Helper: Type Text
        const typeText = (text) => new Promise(resolve => {
            let i = 0;
            // Clear interval if exists from previous run
            if (activeInterval) clearInterval(activeInterval);

            activeInterval = setInterval(() => {
                langDesc.textContent = text.substring(0, i + 1);
                i++;
                if (i === text.length) {
                    clearInterval(activeInterval);
                    resolve();
                }
            }, 58); // Typing Speed
        });

        // Helper: Delete Text
        const deleteText = () => new Promise(resolve => {
            let text = langDesc.textContent;
            let i = text.length;
            if (activeInterval) clearInterval(activeInterval);

            activeInterval = setInterval(() => {
                langDesc.textContent = text.substring(0, i);
                i--;
                if (i < 0) {
                    clearInterval(activeInterval);
                    resolve();
                }
            }, 35); // Deleting Speed
        });

        // Hook into updateSlides to start/stop
        // We override the internal updateSlides logic slightly by calling our starter
        const originalUpdateSlides = updateSlides;

        // Redefine locally effectively? No, better to listen to changes or inject.
        // Since updateSlides is defined in scope above, we can modify it 
        // BUT it's const. We need to attach logic where currentSlide changes.
        // We will monkey-patch the nextBtn listener and dot listeners logic or simply poll?
        // Better: The updateSlides function logic handles classes.
        // We can add a MutationObserver on slide-2 classList?
        // Or simply check periodically? 
        // Actually, simpler: define a separate function to check slide state.

        const checkSlideState = () => {
            if (currentSlide === 1) { // Slide 2 (0-indexed? No, slide IDs are slide-1... wait. HTML ids are slide-1, slide-2..).
                // JS logic: currentSlide = 0 is slide-1. currentSlide = 1 is slide-2.
                startDemoLoop();
            } else {
                isLoopRunning = false;
                // Reset visuals immediately if leaving
                if (activeInterval) clearInterval(activeInterval);
                demoToggle.classList.remove('active');
                demoContainer.classList.remove('reveal');
                langDesc.textContent = "";
            }
        };

        // Inject check into existing event listeners logic by wrapping updateSlides? 
        // Can't wrap const.
        // We will add a listener to the buttons again? No, duplicate logic.
        // Let's use a MutationObserver on the slide-2 element to see when it gets 'active' class.
        const slide2 = document.getElementById('slide-2');
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    if (slide2.classList.contains('active')) {
                        currentSlide = 1; // Sync just in case
                        startDemoLoop();
                    } else {
                        // Stop loop
                        isLoopRunning = false;
                        if (activeInterval) clearInterval(activeInterval);
                        demoToggle.classList.remove('active');
                        demoContainer.classList.remove('reveal');
                        langDesc.textContent = "";
                    }
                }
            });
        });
        if (slide2) observer.observe(slide2, { attributes: true });

        // Also check initially
        if (slide2 && slide2.classList.contains('active')) startDemoLoop();
    }

    // Checkbox Sequence Logic (Slide 3)
    const slide3 = document.getElementById('slide-3');
    let slide3Checked = false;

    if (slide3) {
        const checkboxes = slide3.querySelectorAll('.check-box');

        const runCheckboxSequence = async () => {
            if (slide3Checked) return;
            slide3Checked = true;

            // Wait for slide to settle
            await new Promise(r => setTimeout(r, 600));

            for (const cb of checkboxes) {
                await new Promise(r => setTimeout(r, 400));
                cb.classList.add('checked');
            }
        };

        const observer3 = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && slide3.classList.contains('active')) {
                    runCheckboxSequence();
                }
            });
        });
        observer3.observe(slide3, { attributes: true });

        // Initial check
        if (slide3.classList.contains('active')) {
            runCheckboxSequence();
        }
    }
});
