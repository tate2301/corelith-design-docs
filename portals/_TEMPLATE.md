# Portal screen template

This file documents the conventions agents should follow when adding portal screen pages.

## File anatomy

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>{Screen} · {Portal} portal · Huchu</title>
<link rel="stylesheet" href="../../tokens.css" />
<link rel="stylesheet" href="../../components.css" />
<link rel="stylesheet" href="../../portal-shell.css" />
<script src="../../icons.js" defer></script>
<script src="../../portal-kit-nav.js" defer></script>
<style>
  /* page-specific styles only, if needed */
</style>
</head>
<body data-portal-kit="{pos|parent|student|teacher|staff|admin}" data-portal-screen="{slug}">

<!-- portal-kit-nav.js injects the kit nav bar here automatically -->

<main class="kit-stage phone-bg">
  <div class="device-phone">   <!-- or device-tablet / device-desktop -->
    <div class="screen">
      <div class="ps-screen">

        <!-- Optional: status bar, app bar, content -->
        <div class="ps-statusbar">...</div>
        <div class="ps-appbar">...</div>
        <div class="ps-scroll">
          <!-- screen content -->
        </div>
        <div class="ps-tabbar">...</div>

      </div>
    </div>
  </div>
</main>

</body>
</html>
```

## Required attributes

- `body[data-portal-kit]` — one of `pos`, `parent`, `student`, `teacher`, `staff`, `admin`.
- `body[data-portal-screen]` — slug matching the filename (e.g. `sale` for `sale.html`).

## Device frames

Pick the right device class:

- `device-phone` — 390 × 844 with notch (Mobile)
- `device-tablet` — 820 × 620 (Tablet)
- `device-desktop` — 1280 × 760 with browser chrome (Desktop)

Wrap the screen in `.kit-stage` (background) and the device. The kit-stage has `phone-bg` variant for extra vertical padding around phones.

## CSS classes available

- `portal-shell.css` — `.ps-screen`, `.ps-statusbar`, `.ps-appbar`, `.ps-tabbar`, `.ps-tab`, `.ps-side`, `.ps-content`, `.pc`, `.pl`, `.pl-row`, `.phero`, `.psh`, `.pfab`, `.pos-keypad`, `.sale-line`, etc.
- `components.css` — `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-quiet`, etc.
- `tokens.css` — CSS custom properties

## Icons

Use `<span data-icon="name" data-icon-size="14"></span>`. Available names live in `icons.js` (asterisk, back, plus, check, search, etc.).

## Index page link-up

After adding a screen, update the portal's `index.html` to include a `.surface-card` link in the **Pages** section. Remove `coming` modifier from any cards your new screen replaces.

## Reference screens

Existing well-built screens to mimic:

- `portals/pos/sale.html` — phone with status bar, app bar, scroll, charge button
- `portals/pos/cashup.html` — tablet with side rail + main panels
- `portals/pos/counter.html` — desktop with chrome + sidebar + catalog + cart
- `portals/parent/dashboard.html` — phone with hero balance card + list rows
