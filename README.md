# ByteX website

The website for **ByteX**, a student-led technology, innovation and solutions
initiative at Albukhary International University (AIU), Malaysia.

It is a **static, frontend-only** website: plain HTML, CSS and JavaScript.
There is no build step, no installation, no database and no server code.

---

## How to open it

**Quickest:** double-click `index.html`. It opens in your browser.

**Recommended (behaves exactly like a real web server):** open a terminal in
this folder and run:

```sh
python3 -m http.server 8000
```

Then visit <http://localhost:8000>. Press `Ctrl + C` in the terminal to stop.

**To publish it:** upload the whole folder (keeping its structure) to any
static host, for example GitHub Pages, Netlify, Cloudflare Pages or a normal
web-hosting account. `index.html` must stay at the top level.

---

## Folder structure

```text
bytex-website/
  index.html                 <- the whole page: all text, images and links
  README.md                  <- this file
  EDITING-GUIDE.md           <- step-by-step editing instructions
  assets/
    css/
      template.css           <- design foundation from the original template
      bytex.css              <- ByteX colors + ByteX-specific styles (edit this)
    js/
      main.js                <- menus, theme, sliders, scroll effects, form
    vendor/                  <- third-party libraries (do not edit)
      gsap/                  <- GSAP, ScrollTrigger, ScrollSmoother, ScrollToPlugin
      swiper/                <- Swiper slider
    fonts/                   <- Funnel Display, Mona Sans, Font Awesome icon fonts
    images/
      brand/                 <- logos, favicon, app icon
        originals/           <- your supplied logo files, untouched
      artwork/               <- ByteX illustrations (SVG, editable)
      decor/                 <- decorative shapes, patterns and icons
```

### Which file does what

| File | Purpose | Edit it? |
| --- | --- | --- |
| `index.html` | Every word, image, link and menu on the page. | Yes, often. |
| `assets/css/bytex.css` | Brand colors and ByteX-specific styling. | Yes, for visual changes. |
| `assets/js/main.js` | How things behave (menu, sliders, theme, form). | Only for behaviour changes. |
| `assets/css/template.css` | The template's layout and responsive rules. | Rarely. Prefer overriding in `bytex.css`. |
| `assets/vendor/` | Third-party libraries. | No. |

---

## Dependencies

All dependencies are included locally; the site needs no internet connection
to display.

| Library | Used for | License |
| --- | --- | --- |
| GSAP 3.13 + ScrollTrigger + ScrollSmoother, ScrollToPlugin 3.12 | Smooth scrolling, horizontal cards, reveal animations, loading screen | GSAP Standard License (see header of each file) |
| Swiper | Vision & purpose slider, Roadmap slider | MIT |
| Font Awesome Free 5.15 (fonts) | Moon/sun icons in the theme button | Icons CC BY 4.0, fonts SIL OFL 1.1 |
| Bootstrap 5.2 (parts of the CSS, inside `template.css`) | Grid and utility classes | MIT |
| Funnel Display, Mona Sans (fonts) | Typography | SIL Open Font License |

The license notices inside `template.css` and the vendor files must stay.
The Swiper file in this template came without its original header; Swiper is
published by Vladimir Kharlampidi under the MIT license.

---

## Features that work

- Light and dark themes (button in the header). Only the word `dark` or
  `light` is remembered in the browser.
- Desktop navigation with dropdowns (hover or keyboard).
- Full-screen / mobile menu with submenus, Escape to close and keyboard focus
  kept inside the menu.
- Smooth scrolling on desktop, and same-page links that scroll to sections.
- Solutions cards that move sideways while scrolling (desktop).
- Two sliders with arrow buttons.
- Leadership list with hover previews (desktop).
- Back-to-top button with a scroll-progress ring.
- Loading screen.
- Reduced-motion support: visitors who turn off animations in their device
  settings get a calm, non-animated version.

---

## Frontend limitations (please read)

This is a **frontend-only** website. It cannot send, save or receive data.

1. **"Get updates" form (footer).** ByteX has no mailing-list service yet.
   The form checks that the email address is valid, then shows a message that
   **nothing was saved or sent**, with an optional link that opens an email
   draft to `bytex.my@gmail.com` in the visitor's own email app. The visitor
   must press Send in their email app themselves. To collect real sign-ups
   later, connect a form or newsletter service and update `initNewsletter()`
   in `assets/js/main.js`.
2. **"Email ByteX" button and email links** are `mailto:` links. They open the
   visitor's email app; they do not send anything by themselves, and they do
   nothing on devices without an email app set up.
3. **No contact form, accounts, shop or payments.** These need a backend and
   were intentionally not added.
4. **Proposed tools.** The receipt generator, certificate generator and
   fund/expense manager are clearly labelled as proposed. Remove the
   "(proposed)" wording only when they genuinely exist.
5. **No detail pages.** Cards and buttons link to sections on this page. If
   you create separate pages later (for example `pages/services.html`),
   update the matching `href` values.
6. **Placeholders.** Team members are shown with role icons, not photos. See
   "Missing content" in `EDITING-GUIDE.md`.

---

## How this site was made

The layout, animations and interactions come from the supplied website
template. Its branding, text, images, links, shop/cart and demo content were
replaced with ByteX branding and information from the *ByteX Organization
Overview & Brief*. The template's original appearance, section order,
spacing, typography and responsive behaviour were kept.

Logo files: the supplied logos were not transparent. The versions used in the
header and footer (`*-transparent.png`) were made by cropping and removing the
plain background only; the logo shapes and colors were not redrawn or changed.
The originals are in `assets/images/brand/originals/`.
