# Gregory La Blanc — Personal Website

Personal site for Gregory La Blanc — Faculty Director of Professional Education at UC Berkeley College of Engineering, Distinguished Teaching Fellow at Berkeley Haas, and host of the unSILOed Podcast.

## Running it

No build step, no dependencies. Either:

- Open `index.html` directly in a browser, or
- Serve the folder: `python3 -m http.server 8000` and visit `http://localhost:8000`

To publish with GitHub Pages: repo **Settings → Pages → Deploy from a branch → main / root**. The site will be live at `https://pnazarova.github.io/pnazarova/`.

## Design

An editorial design system built around Greg's Berkeley identity:

- **Palette** — warm paper background, Berkeley navy, California gold
- **Type** — [Fraunces](https://fonts.google.com/specimen/Fraunces) for display, Inter for body, Spline Sans Mono for labels
- **Motion** — scroll-triggered reveals, animated stat counters, podcast topic bars, and an institutions marquee; all disabled under `prefers-reduced-motion`

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | All content, one page: hero, about, expertise, speaking, executive education, podcast, global advisory, credentials, media, contact |
| `styles.css` | Full design system (variables, components, responsive breakpoints at 1024px and 720px) |
| `script.js` | Nav behavior, mobile menu, reveal/counter/bar animations, active-section highlighting |
