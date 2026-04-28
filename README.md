# Handoff: AmpliFi Marketing Landing Page

## Overview
A full marketing/landing page for AmpliFi — a nonprofit platform for independent singer-songwriters. The page connects four stakeholder audiences (Artists, Venues, Fans, Donors/Sponsors, Studio Partners) and drives them toward a role-aware "Get Involved" contact form. It functions as the primary public-facing web presence for the organization.

## About the Design Files
The files in this bundle are **design references created in HTML** — high-fidelity prototypes showing intended look, copy, and behavior. They are not production code to ship directly. The task is to **recreate these designs in your target codebase** using its established framework, component library, and patterns. If no framework exists yet, React + Tailwind or Next.js are recommended given the component structure used here.

## Fidelity
**High-fidelity.** The prototype includes final colors, typography, spacing, imagery, copy, and interactions. Recreate the UI as close to pixel-perfect as possible, applying your codebase's routing, form handling, and any CMS integration needed.

---

## Screens / Views

### 1. Navigation Bar (Fixed)
**Purpose:** Global nav, persists on scroll with a frosted-glass treatment.

**Layout:**
- `position: fixed`, full-width, `z-index: 100`
- `display: flex`, `justify-content: space-between`, `align-items: center`
- Default padding: `20px 48px`
- Scrolled state padding: `14px 48px`

**Components:**
- **Logo** — `uploads/AmpliFiLogo.png`, `height: 80px`, `filter: invert(1)` (logo is dark, page is dark, invert makes it show)
- **Nav Links** — `font-size: 13px`, `letter-spacing: 0.08em`, `text-transform: uppercase`, `font-weight: 500`, color: `--fg-muted` → hover `--fg`
  - Links: Mission, Programs, How It Works
- **CTA Button** — "Get Involved", background `--amber`, color `--bg`, `padding: 9px 22px`, `border-radius: 2px`, `font-size: 13px`, `font-weight: 600`

**Scrolled state:**
- Background: `oklch(11% 0.012 55 / 0.95)` with `backdrop-filter: blur(12px)`
- `border-bottom: 1px solid var(--border)`
- Transition: `all 0.4s ease`

---

### 2. Hero Section
**Purpose:** Full-viewport brand statement. Sets tone, drives two CTAs.

**Layout:**
- `height: 100vh`, `min-height: 700px`
- `display: flex`, `flex-direction: column`, `align-items: flex-start`, `justify-content: flex-end`
- Content padding: `0 80px 96px`

**Background:**
- Full-bleed photo (`uploads/ChatGPT Image Apr 26, 2026, 09_13_25 PM.png`), `object-position: center 20%`
- `filter: brightness(0.55) contrast(1.05)`
- Gradient vignette overlay: `linear-gradient(to top, oklch(11% 0.012 55 / 0.95) 0%, oklch(11% 0.012 55 / 0.4) 40%, transparent 70%)`

**Content (max-width: 780px):**
- **Eyebrow:** "A Nonprofit Platform for Independent Songwriters" — `font-size: 11px`, `letter-spacing: 0.18em`, `text-transform: uppercase`, color `--amber`, `border-left: 2px solid --amber`, `padding-left: 12px`
- **Headline:** "Where the Song Lives." — Cormorant Garamond, `font-weight: 300`, `font-size: clamp(64px, 8vw, 110px)`, `line-height: 0.95`. "Lives." in italic amber.
- **Subhead:** `font-size: 17px`, `font-weight: 300`, color `--fg-muted`, `max-width: 520px`, `line-height: 1.65`
- **CTAs:** Primary "Get Involved" + Ghost "Our Mission" (see design tokens for button styles)

**Scroll indicator:** Centered at bottom, animated 40px vertical line fading down.

---

### 3. Nonprofit Strip
**Purpose:** Trust signal / identity bar.

**Layout:** `padding: 24px 80px`, flex row centered, `gap: 16px`, `border-bottom: 1px solid --border`, background `--bg-warm`

**Content:** Three items separated by amber `·` dots:
- "501(c)(3) Nonprofit Organization"
- "Independent Songwriter Ecosystem"  
- "Texas-Rooted, Nationally Reaching"

Typography: `font-size: 12px`, `font-weight: 500`, `letter-spacing: 0.1em`, `text-transform: uppercase`, color `--fg-dim`

---

### 4. Mission Section
**Purpose:** Establish the "why" with imagery and human-scale stats.

**Layout:** `padding: 120px 80px`, 2-column grid `1fr 1fr`, `gap: 80px`, `align-items: center`, `max-width: 1200px` centered.

**Left — Image:**
- `aspect-ratio: 4/5`, `overflow: hidden`, `border-radius: 2px`
- Image: `uploads/f989d8cf-67ca-4d1b-8097-231121f9e263.png`, `object-fit: cover`, `filter: contrast(1.05)`
- Gradient overlay from bottom 50%
- Pull quote overlaid at bottom-left: Cormorant Garamond italic, `font-size: 22px`, `font-weight: 300`
  - *"The song is where it all begins."*

**Right — Text:**
- Section label: "Our Mission"
- H2: "From Passion to Profession" — italic amber on "Passion"
- Two body paragraphs (see copy below)
- **Stats row** (conditionally shown, togglable): `padding-top: 40px`, `border-top: 1px solid --border`
  - Stat 1: `4` / "Core Programs"
  - Stat 2: `5` / "Stakeholder Types"
  - Stat 3: `∞` / "Songs to Tell"
  - Stat numbers: Cormorant Garamond, `font-size: 48px`, `font-weight: 300`, color `--amber`

---

### 5. Ecosystem Section
**Purpose:** Explain who AmpliFi serves — four stakeholder pillars.

**Layout:** `padding: 120px 80px`, background `--bg-warm`, `max-width: 1200px` centered.

**Header:** Two-column flex `align-items: flex-end`, `gap: 80px`, `margin-bottom: 80px`
- Left: section label + H2 "Built for Everyone in the Room"
- Right: body paragraph

**Pillars grid:** `grid-template-columns: repeat(4, 1fr)`, `gap: 2px`

Each pillar card:
- Background: `--bg-card` → hover `oklch(19% 0.018 55)`
- `padding: 40px 32px`
- Top border accent (amber, `height: 2px`): `scaleX(0)` → `scaleX(1)` on hover, `transition: 0.4s ease`
- **Icon:** 48×48 box, `border: 1px solid --border`, `border-radius: 2px`, amber color
- **Title:** Cormorant Garamond, `font-size: 26px`, `font-weight: 400`
- **Body:** `font-size: 14px`, `font-weight: 300`, color `--fg-muted`, `line-height: 1.7`
- **Who:** `font-size: 11px`, `font-weight: 500`, `letter-spacing: 0.1em`, `text-transform: uppercase`, color `--amber-dim`, `border-top: 1px solid --border`, `padding-top: 20px`

| Pillar | Icon | Title | Who |
|--------|------|-------|-----|
| 0 | ♪ | Artists | Singer-Songwriters · Collaborators |
| 1 | ◈ | Venues | Listening Rooms · Bars · House Venues |
| 2 | ◉ | Fans | Music Lovers · Champions |
| 3 | ◆ | Partners | Studios · Brands · Foundations |

---

### 6. Image Divider
**Purpose:** Full-bleed atmospheric break between sections.

**Layout:** `height: 360px`, `overflow: hidden`
- Image: `uploads/9d58133d-bea5-4615-b87c-4e6bfa150a98.png`, `object-position: center 30%`, `filter: brightness(0.4) contrast(1.15)`
- Overlaid centered text: *"Where songs are written, connections are made."* — Cormorant Garamond italic, `font-size: clamp(32px, 5vw, 60px)`, `font-weight: 300`

---

### 7. Programs Section
**Purpose:** Showcase the four core initiatives.

**Layout:** `padding: 120px 80px`, background `--bg`, `max-width: 1200px` centered.

**Programs grid:** `grid-template-columns: repeat(2, 1fr)`, `gap: 2px`

Each program card (`display: grid`, `grid-template-columns: 1fr 1fr`):
- **Image side:** `aspect-ratio: 1`, `overflow: hidden`. Image: `filter: brightness(0.7) contrast(1.1)` → `transform: scale(1.05)` on hover
- **Info side:** `padding: 48px 40px`, flex column, justified center
  - Tag: `font-size: 10px`, `letter-spacing: 0.15em`, uppercase, amber
  - Name: Cormorant Garamond, `font-size: 32px`, `font-weight: 400`, `line-height: 1.1`
  - Desc: `font-size: 14px`, `font-weight: 300`, `--fg-muted`
  - "Learn More →" link: amber, `font-size: 12px`, uppercase, gap animates on hover

| # | Tag | Name | Image |
|---|-----|------|-------|
| 0 | Community | Songwriter Collectives | f989d8cf photo |
| 1 | Touring | Songwriter Trail | hero stage photo |
| 2 | Production | AmpliFi Studio Network | session photo |
| 3 | Revenue | Merch, Sponsorships & Fan Engagement | hero stage photo |

---

### 8. Flywheel Section
**Purpose:** Explain the compounding business model.

**Layout:** `padding: 120px 80px`, background `--bg-warm`, `max-width: 1100px` centered.

**Header:** Centered. Section label "The Model", H2 "The *Flywheel*", body copy.

**Steps:** `grid-template-columns: repeat(5, 1fr)`. Horizontal connecting line at `top: 36px` using a pseudo-element gradient.

Each step:
- Circular node: `72×72px`, `border-radius: 50%`, `border: 1px solid --border`, background `--bg-card`. Hover: `border-color: --amber`, `box-shadow: 0 0 24px --amber-glow`
- Number: Cormorant Garamond, `font-size: 28px`, `font-weight: 300`, amber
- Label: Cormorant Garamond, `font-size: 20px`
- Desc: `font-size: 13px`, `font-weight: 300`, `--fg-muted`

| Step | Label | Desc |
|------|-------|------|
| 01 | Artists Perform | Songwriters take the stage… |
| 02 | Build Fans | Real audiences, discovered through curated experiences… |
| 03 | Generate Revenue | Shows, merch, streaming, sponsorships… |
| 04 | Reinvest | Back into recording, touring, and the next creative cycle. |
| 05 | Grow | A career, a community, a movement… |

**CTA:** "Every step forward amplifies the next." (Cormorant Garamond italic, 28px muted) + "Join the Ecosystem" primary button.

---

### 9. Quote Strip
**Purpose:** Mission statement as a high-impact callout.

**Layout:** `padding: 80px`, background `--amber` (full-bleed amber), text centered.

- Blockquote: Cormorant Garamond italic, `font-size: clamp(28px, 4vw, 48px)`, `font-weight: 300`, color `--bg`, `max-width: 800px`
- Cite: DM Sans, `font-size: 12px`, `font-weight: 600`, `letter-spacing: 0.12em`, uppercase, `color: oklch(18% 0.04 55)`

---

### 10. Join / Contact Form
**Purpose:** Role-aware lead capture form.

**Layout:** `padding: 120px 80px`, background `--bg`, `max-width: 900px` centered.

**Role Tabs:** `display: flex`, `gap: 2px`, 5 tabs (Artist, Venue/Booker, Fan, Donor/Sponsor, Studio Partner)
- Tab: `flex: 1`, `padding: 14px 8px`, background `--bg-card` → active `oklch(19% 0.018 55)`
- Active underline: `2px solid --amber`, `transition: scaleX 0.3s`

**Form grid:** `grid-template-columns: 1fr 1fr`, `gap: 20px`

**Fields by role:**

*Artist:* Name, Email, Genre/Style, Based In, Interests (checkboxes), Note
*Venue/Booker:* Name, Email, Venue Name, Venue Type/Capacity, Interests, Note
*Fan:* Name, Email, City, Favorite Venue or Artist, Interests, Note
*Donor/Sponsor:* Name, Email, Organization, Giving Level, Interests, Note
*Studio Partner:* Name, Email, Studio Name, Location, Interests, Note

**Interest checkboxes:** Displayed as pill-shaped chips. Selected state: `border-color: --amber`, background `--amber-glow`, color `--fg`.

**Input styles:**
- Background: `--bg-card`, `border: 1px solid --border`, `border-radius: 2px`
- `padding: 13px 16px`, `font-size: 15px`, `font-weight: 300`
- Focus: `border-color: --amber`

**Success state:** Replaces form with centered confirmation message — amber ♪ symbol, serif headline "You're in the room.", body copy.

---

### 11. Footer
**Layout:** `padding: 80px 80px 40px`, background `oklch(9% 0.01 55)`, `border-top: 1px solid --border`

**Grid:** `grid-template-columns: 2fr 1fr 1fr 1fr`, `gap: 60px`

**Brand column:** Logo (80px, inverted) + tagline paragraph
**Link columns:** Programs, Get Involved, Organization (see full link list in HTML)

**Bottom bar:** `justify-content: space-between`, copyright + Privacy/Terms links, `font-size: 12px`, color `--fg-dim`

---

## Interactions & Behavior

- **Nav scroll:** Attach `window.scroll` listener; add `.scrolled` class at `scrollY > 60px` for glass treatment
- **Hero bg:** Subtle scale `1.02 → 1.0` on image load (Ken Burns intro)
- **Pillar hover:** Top border slides in via `scaleX` transform; background lightens
- **Program card hover:** Image scales to `1.05`
- **Flywheel step hover:** Circle gets amber border + glow shadow
- **Role tab switch:** Smooth tab active state; resets selected interests
- **Interest chips:** Toggle selected state on click
- **Form submit:** `preventDefault`, show success state

---

## Design Tokens

```css
--bg:         oklch(11% 0.012 55);   /* near-black warm charcoal */
--bg-warm:    oklch(14% 0.015 55);
--bg-card:    oklch(16% 0.015 55);
--fg:         oklch(94% 0.008 65);   /* warm cream */
--fg-muted:   oklch(65% 0.01 65);
--fg-dim:     oklch(45% 0.01 65);
--amber:      oklch(70% 0.13 65);    /* primary accent */
--amber-dim:  oklch(55% 0.10 65);
--amber-glow: oklch(70% 0.13 65 / 0.15);
--border:     oklch(25% 0.01 55);

--serif: 'Cormorant Garamond', Georgia, serif;
--sans:  'DM Sans', system-ui, sans-serif;
```

**Google Fonts:**
- Cormorant Garamond: weights 300, 400, 500, 600, 700 (regular + italic)
- DM Sans: weights 300, 400, 500, 600

**Border radius:** `2px` throughout (intentionally sharp — matches the rustic/editorial tone)

**Spacing:** sections use `padding: 120px 80px`. Gaps between cards: `2px`.

---

## Copy

### Hero
- Eyebrow: "A Nonprofit Platform for Independent Songwriters"
- H1: "Where the Song Lives."
- Sub: "AmpliFi connects artists, venues, fans, and partners into a unified ecosystem — removing barriers and building pathways to a sustainable creative life."
- CTAs: "Get Involved" / "Our Mission"

### Mission
P1: "Independent songwriters carry culture forward — but the path from a great song to a sustainable career has never been easy. AmpliFi was built to change that."
P2: "We are an ecosystem engine: connecting artists to venues, fans, studios, and collaborators; building touring infrastructure through the Songwriter Trail; and compounding impact at every stage of an artist's journey."

### Flywheel CTA
"Every step forward amplifies the next."

### Quote Strip
"AmpliFi is committed to building a thriving, connected ecosystem where independent songwriters can create, perform, and sustain a meaningful career."
— AmpliFi Mission Statement

---

## Assets

| File | Used In |
|------|---------|
| `uploads/AmpliFiLogo.png` | Nav, Footer (1254×1254px, dark logo — apply `filter: invert(1)`) |
| `uploads/ChatGPT Image Apr 26, 2026, 09_13_25 PM.png` | Hero bg, Songwriter Trail card, Merch card |
| `uploads/9d58133d-bea5-4615-b87c-4e6bfa150a98.png` | Image divider, Studio Network card |
| `uploads/f989d8cf-67ca-4d1b-8097-231121f9e263.png` | Mission section, Collectives card |

---

## Files

| File | Description |
|------|-------------|
| `AmpliFi.html` | Complete high-fidelity prototype — single-file React + Babel |
| `tweaks-panel.jsx` | Design tweaks UI (dev tool only — not needed in production) |

---

## Implementation Notes

- The prototype is a single-file React app using Babel standalone (for rapid prototyping). In production, convert to a proper React/Next.js component tree.
- The form is UI-only — wire up to your backend, CMS, or a service like Formspree/HubSpot.
- The Tweaks panel is a design exploration tool only — exclude from production build.
- Consider adding a CMS for the Programs section content.
- The `--amber` accent color is tweakable — the organization may want to finalize this before launch.
- All section anchors (`#mission`, `#programs`, `#how-it-works`, `#join`) should be preserved for nav deep-linking.
