---
name: corelith-design
description: Use this skill to generate well-branded interfaces and assets for Corelith (the operating platform built on the Huchu codebase). Provides the warm-paper Claude Code-inspired design language — colors, type, fonts, status vocabulary, sidebar, table, settings, and list patterns — for production code or throwaway prototypes and mocks.
user-invocable: true
---

# Corelith — design skill

Read `README.md` for full context. Use this file as a quick orientation when building.

## Always

- Use the CSS variables in `tokens.css` and the classes in `components.css`. Never invent new color values.
- Sentence case everywhere. Short verbs in buttons. The real noun in labels.
- Status vocabulary is fixed: **Needs input · Running · Completed · Idle · Not started**. Don't invent new labels.
- Borders, not shadows. Shadows are for popovers and modals only.
- One primary (ink) button per screen. Everything else is secondary or ghost.
- 8-point spacing rhythm. 24 px content gutter.
- Generous controls (36 px minimum). Generous whitespace. Quiet copy.

## Never

- Emoji.
- Exclamation points.
- Gradients on text or backgrounds.
- Clay (`#CC785C`) as a button background — it's the brand mark only.
- "Please", "Oops!", "Awesome!", "We're working on it" — read the writing principles in `preview/brand.html`.
- Custom status labels.
- Title Case headings.
- ScrollIntoView in scripts (it breaks the host).

## File layout

```
tokens.css        ← all design tokens (color, type, space, radii, motion)
components.css    ← all UI classes (.btn, .card, .sidebar, .list-item, …)
icons.js          ← <span data-icon="name"></span> → inline Lucide-style SVG
fonts/            ← SS Huchu woff2 files (legacy from codebase; UI uses Atkinson Hyperlegible Next via Google Fonts)
preview/          ← single-purpose foundation pages
kits/             ← composed app surfaces (shell, settings, tables)
```

## When you create a static HTML artifact

1. Copy `tokens.css`, `components.css`, `icons.js`, and `fonts/` if you don't have them.
2. Link them in your HTML head:
   ```html
   <link rel="stylesheet" href="tokens.css">
   <link rel="stylesheet" href="components.css">
   <script src="icons.js" defer></script>
   ```
3. Inspect `preview/components.html` for the available classes. Inspect `kits/*` for whole-screen patterns.
4. Compose with utility-free, semantic markup. Don't reach for Tailwind.

## When you write production code in the Huchu repo

- Use the shadcn `Button`, `Badge`, `Input`, etc. from `components/ui/`.
- Apply the design language by setting CSS variables in `app/globals.css` to match the values in `tokens.css`.
- Use `lucide-react` icons. The strokes in `icons.js` match it visually.
- Reference `preview/brand.html` for voice and copy.

## Default behavior when invoked

If the user invokes this skill without other guidance, ask them what they want to build, what surface (app shell, settings page, marketing, deck), what content they need to express, and what audience. Then act as an expert designer who outputs HTML artifacts (or production React) depending on the need.
