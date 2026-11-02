document.addEventListener("DOMContentLoaded", () => {
    
    // =========================================================================
    // 1. SYSTEM THEME TOGGLE (Obsidian Dark / Antique Parchment Light)
    // =========================================================================
    const themeToggleBtn = document.getElementById("theme-toggle");
    const rootElement = document.documentElement;

    const savedTheme = localStorage.getItem("theme") || 
                       (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    
    rootElement.setAttribute("data-theme", savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const currentTheme = rootElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            
            rootElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
            
            // Re-render tour spotlight & shades on theme toggle
            if (typeof updateTourCamera === "function") {
                updateTourCamera();
            }
        });
    }

    // =========================================================================
    // 2. MATHEMATICAL SCROLL-DRIVEN TAPESTRY TOUR ENGINE (pragalva.me/projects)
    // =========================================================================
    const stageEl = document.getElementById("pj-stage");
    const frameEl = document.getElementById("pj-frame");
    const spotEl = document.getElementById("pj-spot");
    const tourContainer = document.querySelector(".pj-tour");
    const skipBtn = document.getElementById("pj-skip-btn");

    // Classical Tapestry Dimensions: test.jpg is 8000 x 5808 (aspect ratio ~1.3774)
    const TS = 8000 / 5808;

    // Tour Stops targeting figures in test.jpg (Ladies' faces centered at 0.54, 0.40)
    const SHOTS = [
        { 
            id: "pj-hall", 
            name: "Overview", 
            x: 0.54, 
            y: 0.44, 
            zoom: 1.0, 
            isHall: true, 
            kind: "hall" 
        },
        { 
            id: "pj-ladies", 
            name: "The Ladies", 
            x: 0.54, 
            y: 0.40, 
            zoom: 0.30, 
            cardSide: "left", 
            kind: "project" 
        },
        { 
            id: "pj-works", 
            name: "Creative Works", 
            x: 0.32, 
            y: 0.44, 
            zoom: 0.36, 
            cardSide: "right", 
            kind: "project" 
        },
        { 
            id: "pj-learning", 
            name: "Foundations", 
            x: 0.80, 
            y: 0.30, 
            zoom: 0.38, 
            cardSide: "left", 
            kind: "project" 
        },
        { 
            id: "pj-contact", 
            name: "Correspondence", 
            x: 0.54, 
            y: 0.40, 
            zoom: 0.32, 
            cardSide: "right", 
            kind: "project" 
        }
    ];

    let tourState = null;
    let updateTourCamera = null;

    if (stageEl && frameEl && spotEl && tourContainer) {
        const stepElements = SHOTS.map(s => document.getElementById(s.id)).filter(Boolean);
        const clamp = (val, min, max) => Math.min(max, Math.max(min, val));
        const smoothStep = (t) => t * t * (3 - 2 * t);

        // Calculate Camera configuration for a specific shot and viewport
        function calcCamera(viewportW, viewportH, shot) {
            const isMobile = viewportW < 1024;
            const { x, y, zoom } = shot;
            const effZoom = isMobile ? Math.min(1.0, zoom * 1.35) : zoom;
            const baseH = Math.max(viewportH / effZoom, viewportH, viewportW / TS);
            const baseW = baseH * TS;
            
            // Screen focus offset: positions figure away from the text caption card
            const screenFocusX = isMobile ? 0.5 : (shot.cardSide === "right" ? 0.30 : 0.70);
            const screenFocusY = isMobile ? 0.38 : 0.50;
            
            const left = clamp(screenFocusX * viewportW - x * baseW, viewportW - baseW, 0);
            const top = clamp(screenFocusY * viewportH - y * baseH, viewportH - baseH, 0);
            
            return {
                left,
                top,
                height: baseH,
                width: baseW,
                fx: x,
                fy: y,
                spot: shot.isHall ? 3.0 : 1.0,
                kind: shot.kind,
                side: shot.cardSide || (shot.isHall ? "hall" : "left")
            };
        }

        // Interpolate between Camera A and Camera B
        function interpolateCamera(camA, camB, progress, viewportW, viewportH) {
            // Smooth exponential scale curve between stops
            const height = camA.height * Math.pow(camB.height / camA.height, progress);
            const width = height * TS;
            
            let left = camA.left + (camB.left - camA.left) * progress;
            let top = camA.top + (camB.top - camA.top) * progress;
            
            if (width >= viewportW) left = clamp(left, viewportW - width, 0);
            if (height >= viewportH) top = clamp(top, viewportH - height, 0);
            
            const fx = camA.fx + (camB.fx - camA.fx) * progress;
            const fy = camA.fy + (camB.fy - camA.fy) * progress;
            const spot = camA.spot + (camB.spot - camA.spot) * progress;
            
            return { left, top, height, width, fx, fy, spot };
        }

        // Initialize and compute layout milestones
        function initTourLayout() {
            const viewportW = stageEl.clientWidth;
            const viewportH = stageEl.clientHeight;
            const baseH = Math.max(viewportH, viewportW / TS);
            
            const stops = stepElements.map(el => {
                const rect = el.getBoundingClientRect();
                const absTop = rect.top + window.scrollY;
                return Math.max(0, absTop + (el.offsetHeight - viewportH) / 2);
            });

            const cameras = SHOTS.map(s => calcCamera(viewportW, viewportH, s));

            tourState = {
                w: viewportW,
                h: viewportH,
                baseH,
                stops,
                cameras
            };

            frameEl.style.width = `${baseH * TS}px`;
            frameEl.style.height = `${baseH}px`;
            stageEl.setAttribute("data-ready", "true");
            
            renderTourFrame();
        }

        // Render current camera position from scroll offset
        function renderTourFrame() {
            if (!tourState) return;
            const { stops, cameras, w, h, baseH } = tourState;
            const scrollY = window.scrollY;
            const numStops = stops.length;

            if (numStops === 0) return;

            let currIdx = 0;
            while (currIdx < numStops - 1 && scrollY >= stops[currIdx + 1]) {
                currIdx++;
            }

            const nextIdx = Math.min(currIdx + 1, numStops - 1);
            const span = (stops[nextIdx] - stops[currIdx]) || 1;
            const rawProgress = clamp((scrollY - stops[currIdx]) / span, 0, 1);
            const easedProgress = smoothStep(rawProgress);

            const camA = cameras[currIdx];
            const camB = cameras[nextIdx];
            const interp = interpolateCamera(camA, camB, easedProgress, w, h);
            
            const scale = interp.height / baseH;

            // Apply smooth 3D hardware-accelerated transforms
            frameEl.style.transform = `translate3d(${interp.left.toFixed(2)}px, ${interp.top.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
            spotEl.style.transform = `translate3d(${(interp.left + interp.fx * interp.width).toFixed(2)}px, ${(interp.top + interp.fy * interp.height).toFixed(2)}px, 0) scale(${interp.spot.toFixed(3)})`;

            // Active step card visibility and stage shade states
            const activeStepIdx = rawProgress < 0.5 ? currIdx : nextIdx;
            const activeShot = SHOTS[activeStepIdx];

            stageEl.setAttribute("data-kind", activeShot.kind);
            if (activeShot.cardSide) {
                stageEl.setAttribute("data-side", activeShot.cardSide);
            } else {
                stageEl.removeAttribute("data-side");
            }

            stepElements.forEach((el, idx) => {
                if (idx === activeStepIdx) {
                    el.setAttribute("data-on", "true");
                } else {
                    el.removeAttribute("data-on");
                }
            });
        }

        updateTourCamera = renderTourFrame;

        // Skip button handler
        if (skipBtn) {
            skipBtn.addEventListener("click", () => {
                const target = document.getElementById("portfolio-content");
                if (target) {
                    target.scrollIntoView({ behavior: "smooth" });
                }
            });
        }

        // Performance-optimized scroll listener
        let ticking = false;
        window.addEventListener("scroll", () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    renderTourFrame();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        // ResizeObserver to recalibrate on window adjustments
        const resizeObserver = new ResizeObserver(() => {
            initTourLayout();
        });
        resizeObserver.observe(stageEl);
        resizeObserver.observe(tourContainer);

        initTourLayout();
    }

    // =========================================================================
    // 3. INTERSECTION OBSERVER (SCROLL REVEAL FOR EDITORIAL SECTIONS)
    // =========================================================================
    const animatedElements = document.querySelectorAll(".animate-on-scroll");
    
    if (animatedElements.length > 0) {
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    scrollObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.08,
            rootMargin: "0px 0px -40px 0px"
        });

        animatedElements.forEach(el => scrollObserver.observe(el));
    }

    // =========================================================================
    // 4. HIGH-PRECISION LIQUID GLASS NAV SCROLL-SPY ENGINE
    // =========================================================================
    const navList = document.getElementById("liquid-nav-list");
    const pillTracker = document.getElementById("liquid-pill-tracker");
    
    if (navList && pillTracker) {
        const navLinks = navList.querySelectorAll("a");
        let activeId = "home"; 
        let hoveredId = null;

        function updatePillLayout() {
            const targetId = hoveredId || activeId;
            const targetLink = navList.querySelector(`[data-id="${targetId}"]`);
            
            if (!targetLink) return;

            const parentRect = navList.getBoundingClientRect();
            const linkRect = targetLink.getBoundingClientRect();
            const relativeLeft = linkRect.left - parentRect.left;

            pillTracker.style.width = `${linkRect.width}px`;
            pillTracker.style.height = `${linkRect.height}px`;
            pillTracker.style.transform = `translate3d(${relativeLeft}px, 0px, 0)`;

            navLinks.forEach(link => {
                if (link.getAttribute("data-id") === targetId) {
                    link.classList.add("pill-active");
                } else {
                    link.classList.remove("pill-active");
                }
            });
        }

        // Interaction Events
        navLinks.forEach(link => {
            link.addEventListener("mouseenter", () => {
                hoveredId = link.getAttribute("data-id");
                updatePillLayout();
            });
            
            link.addEventListener("click", () => {
                activeId = link.getAttribute("data-id");
                hoveredId = null;
                setTimeout(updatePillLayout, 10);
            });
        });

        navList.addEventListener("mouseleave", () => {
            hoveredId = null;
            updatePillLayout();
        });

        // Scroll Milestones
        window.addEventListener("scroll", () => {
            const scrollPosition = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            
            // Bottom boundary -> contact
            if (scrollPosition + windowHeight >= documentHeight - 60) {
                if (activeId !== "contact") {
                    activeId = "contact";
                    updatePillLayout();
                }
                return;
            }

            // Top boundary -> home
            if (scrollPosition < 400) {
                if (activeId !== "home") {
                    activeId = "home";
                    updatePillLayout();
                }
                return;
            }

            const targets = ["work", "about", "experience", "contact"];
            let currentTarget = activeId;

            for (const id of targets) {
                const section = document.getElementById(id);
                if (section) {
                    const top = section.offsetTop - 300;
                    if (scrollPosition >= top) {
                        currentTarget = id;
                    }
                }
            }

            if (currentTarget !== activeId && !hoveredId) {
                activeId = currentTarget;
                updatePillLayout();
            }
        }, { passive: true });

        window.addEventListener("resize", updatePillLayout);
        setTimeout(updatePillLayout, 150);
    }
});
