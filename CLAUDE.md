# Gregory La Blanc personal site (glablanc.com)

Owner: Polina Nazarova, building the site for Greg La Blanc.

## Hard style rules from the owner

- NEVER use em dashes or en dashes anywhere: not in site copy, commit messages, PR text, or replies. Use commas, colons, periods, or parentheses instead. Plain hyphens in compound words (one-day, data-driven) are fine.
- Nothing on the site may look AI-generated: no pill buttons, no gradient glows, no auto-moving marquees, no handwriting fonts, no generic cream-and-serif look.
- Verify every factual claim before it goes on the site (links, engagements, press mentions, logos). If a claim cannot be verified, remove it or ask Polina. She has caught hallucinated content before and checks.

## Visual identity: "unSILOed ink"

Built from the unSILOed podcast cover art (drop/photos/unsiloed-cover.jpg):
- Colors: ink #14264d, deep navy #0a1d3d, cover gold #e9b639, paper #fbf6ea
- Fonts: Bricolage Grotesque (display), Instrument Sans (body and labels)
- Shapes: sketchy hand-drawn border-radius (var(--sketch)), offset solid shadows, slight rotations
- The caricature (cropped from the cover, no text) is the brand mark, favicon, and hero image

## Workflow

- Static site, no build step. Develop on a claude/* branch, PR to main, merge.
- Merging to main auto-deploys via .github/workflows/deploy.yml to GitHub Pages at https://www.glablanc.com
- Direct pushes to main are blocked; always go through a PR.
- drop/ is the owner's staging folder for raw materials; never published content.
- Contact: glablanc@gmail.com, +1 (202) 258-4702 (public, on the site by owner request).
