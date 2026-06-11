document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. System Theme Toggle Control ---
    const themeToggleBtn = document.getElementById("theme-toggle");
    const rootElement = document.documentElement;

    // Pull preference from system configuration or localStorage
    const savedTheme = localStorage.getItem("theme") || 
                       (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    
    rootElement.setAttribute("data-theme", savedTheme);

    themeToggleBtn.addEventListener("click", () => {
        const currentTheme = rootElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        
        rootElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    });

    // --- 2. Intersection Observer (Scroll Animations) ---
    const animatedElements = document.querySelectorAll(".animate-on-scroll");
    
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                // Stop observing once animated into view
                scrollObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: "0px 0px -40px 0px"
    });

    animatedElements.forEach(el => scrollObserver.observe(el));

// --- SECTION 3: High-Performance Scroll-Spy Liquid Nav Engine ---
    const navList = document.getElementById("liquid-nav-list");
    const pillTracker = document.getElementById("liquid-pill-tracker");
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

        // Map sizes smoothly
        pillTracker.style.width = `${linkRect.width}px`;
        pillTracker.style.height = `${linkRect.height}px`;
        pillTracker.style.transform = `translate3d(${relativeLeft}px, 0px, 0)`;

        // Invert text color over active pill
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

    // High-Precision Pixel Tracking Scroll Engine
    window.addEventListener("scroll", () => {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Safety Catch 1: Force Contact link active when hitting the absolute bottom
        if (scrollPosition + windowHeight >= documentHeight - 60) {
            if (activeId !== "contact") {
                activeId = "contact";
                updatePillLayout();
            }
            return;
        }

        // Safety Catch 2: Return back to Home at the top
        if (scrollPosition < 200) {
            if (activeId !== "home") {
                activeId = "home";
                updatePillLayout();
            }
            return;
        }

        // Real-time tracking calculations across milestones
        const targets = ["work", "about", "experience", "contact"];
        let currentTarget = activeId;

        for (const id of targets) {
            const section = document.getElementById(id);
            if (section) {
                const top = section.offsetTop - 300; // Offset zone
                if (scrollPosition >= top) {
                    currentTarget = id;
                }
            }
        }

        if (currentTarget !== activeId && !hoveredId) {
            activeId = currentTarget;
            updatePillLayout();
        }
    });

    // Window Resize Handling
    window.addEventListener("resize", updatePillLayout);
    
    // Fire up layout on initialization
    setTimeout(updatePillLayout, 100);
});