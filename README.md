# SGYN — DevOps Trainee Portfolio

A minimalist, high-performance portfolio website built with native semantic HTML5, fluid CSS Grid typography engines, and vanillajs core logic. Designed with an ultra-clean, structural aesthetic featuring a liquid-glass interactive tracking navigation bar and a responsive hero profile setup inspired by hardware interfaces.

## 🛠️ Architectural Highlights

- **Dynamic Scroll-Spy Liquid Nav Bar**: Outfitted with a custom pixel-measured coordinate spy engine that eliminates the inconsistency of `IntersectionObserver` thresholds near the bottom of pages, ensuring flawless transitions from *About* to *Contact*.
- **Google Pixel Front-Camera Swap Loop**: An SVG vector circle overlay that simulates the hardware punch-hole lens rotation effect exactly when the viewport refreshes, using hardware-accelerated CSS `transform` and `stroke-width` tapering instead of unstable dash arrays.
- **Strict 12-Column Layout Grid**: A clean, fluid grid design that moves elements down smoothly and prevents vertical clustering, enabling long, natural horizontal typography flow on desktops and tight, comfortable layout stacking on mobile screens.
- **Zero-Blink Tap Mechanics**: Fully optimized for handheld touchscreen clients by dropping browser tap-highlight-color overlays globally.

## 📁 Project Structure

```text
├── index.html      # Main semantic structural content & layouts
├── style.css       # Unified design tokens, 12-column grid tracks, & keyframe loops
├── script.js       # High-precision scroll-spy calculations & liquid pill matrices
└── profile.jpg     # Portfolio avatar asset