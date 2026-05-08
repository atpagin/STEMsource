# STEMsource

A professional job board and resource platform built for scientists, engineers, and researchers. STEMsource connects vetted STEM talent with employers posting freelance projects, contracts, and full-time positions.

## Pages

| File | Description |
|------|-------------|
| `index.html` | Landing page — hero, featured jobs, how it works, benefits, blog/guides carousels, testimonials |
| `jobs.html` | Job board — filter sidebar, search bar, paginated job list cards |
| `blog.html` | Blog — featured article, topic tabs, article grid, newsletter signup |
| `guides.html` | Guides — career playbooks organized by category (freelancing, contracts, clearances, etc.) |
| `post-job.html` | Employer job posting — auth gate, 4-step form, pricing plans, sticky sidebar |
| `signup.html` | Auth page — split layout, sign in / create account toggle, professional profile builder |
| `css/styles.css` | Full design system — tokens, components, layout, responsive |
| `js/main.js` | Interactivity — nav, carousels, stat counters, form steps, password strength |

## Features

- **Job board** — freelance, contract, full-time, and part-time listings across 8 STEM disciplines
- **Searchable professional profiles** — headline, skills, availability, work preference, bio, ORCID/LinkedIn
- **Employer auth gate** — job posting is locked behind email verification before form access
- **Multi-step post-job form** — 4 steps: Position Details → Requirements → Compensation → Review & Publish
- **Horizontal scroll carousels** — blog posts and guides with arrow navigation and snap scrolling
- **Animated stat counters** — triggered by IntersectionObserver on scroll
- **Sticky navbar** — hover dropdowns for Jobs, Disciplines, Resources, Community, For Employers
- **Mobile nav** — full-screen overlay panel with close button
- **Password strength meter** — real-time scoring with color feedback
- **Responsive** — grid layouts collapse cleanly on tablet and mobile

## Design System

Built with vanilla CSS custom properties — no framework required.

```
Primary:   #0284c7  (sky blue)
Dark:      #0369a1
Light:     #f0f9ff
Text:      #0f172a  (navy)
Surface:   #ffffff
Border:    #e2e8f0
```

**Fonts:** Inter (UI), IBM Plex Serif (display headings), IBM Plex Mono (tags/code) — loaded from Google Fonts.

**Shadows:** Five-level shadow scale (`--shadow-xs` → `--shadow-xl`) for consistent depth.

**Radius:** Token-based from `--r-xs: 4px` to `--r-full: 9999px`.

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript — no build step, no dependencies
- Google Fonts via `@import`
- SVG icons inline (no icon library)

## Getting Started

Open locally with any static file server:

```bash
# Python
python -m http.server 8000

# Node
npx serve .
```

Or open `index.html` directly in a browser (Google Fonts requires an internet connection to load).

## Project Structure

```
stemsource/
├── index.html
├── jobs.html
├── blog.html
├── guides.html
├── post-job.html
├── signup.html
├── css/
│   └── styles.css
└── js/
    └── main.js
```
