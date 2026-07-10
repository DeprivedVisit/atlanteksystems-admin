---
target: proyectos/apexcloudworkscompany.com/index.html
total_score: 23
p0_count: 2
p1_count: 3
timestamp: 2026-07-05T11-11-26Z
slug: proyectos-apexcloudworkscompany-com-index-html
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | `#proc-stage` progress bar is `aria-hidden="true"` — visual-only, not announced |
| 2 | Match System / Real World | 2 | Strong CR-local fluency (SINPE, WhatsApp, USD) undercut by raw dev jargon (EC2, Bedrock, build.log) shown to a non-technical audience |
| 3 | User Control and Freedom | 3 | FAQ/dropdown/mobile-nav all closable, toast dismiss persists |
| 4 | Consistency and Standards | 2 | 6 different button classes with no clear primary/secondary system; pricing shown 3 incompatible ways |
| 5 | Error Prevention | 1 | Contact form has no `required`/`type=email`; validation only on submit |
| 6 | Recognition Rather Than Recall | 3 | Calculator live total removes mental math |
| 7 | Flexibility and Efficiency | 3 | Skip-link, anchor nav work well |
| 8 | Aesthetic and Minimalist Design | 1 | Hero is genuinely minimal; from Proceso onward, decoration density (gears, seals, ribbons, terminal mockups, 6 wandering bots) contradicts that intent |
| 9 | Error Recovery | 2 | Error messages exist but generic, not tied to the specific field |
| 10 | Help and Documentation | 3 | FAQ appropriately scoped |
| **Total** | | **23/40** | **Acceptable — significant improvements needed** |

## Anti-Patterns Verdict

**LLM assessment**: The hero breaks from AI-template feel — real negative space, one dominant statement, restraint. Everything below the fold reverts to templated rhythm: the same red-ribbon eyebrow stamped before all 12 sections, a hero-metric counter strip, uniform 5-star testimonials, near-identical service/pricing cards. The pattern-repetition rate, not any single element, is what reads as AI-scaffolded.

**Deterministic scan** (`detect.mjs`, exit 2, 2 findings):
- `em-dash-overuse` (warning) — 19 em-dashes in body copy, an AI-cadence tell.
- `numbered-section-markers` (advisory) — sequence 01-05 detected (the Proceso steps; earns its place since it's a real ordered sequence, not scaffolding).

Both assessments independently flagged the ribbon-eyebrow repetition and a duplicate `--red` token in `tokens.css` — high-confidence findings since neither assessment saw the other's output.

## Overall Impression

The hero delivers on its brief and is the strongest moment on the site. Past the fold, the page reverts to a componentized, repeated formula, and two real trust problems (testimonials contradicting build-status tags; a fixed avatar widget covering pricing text on mobile) undercut the "sistemas reales, no demos" positioning the copy is built around.

## What's Working

1. The hero composition (mountain pinned high with real negative space + one dominant Anton line + two pill CTAs) is a genuine, deliberate departure from the templated rhythm below it.
2. Costa Rica-specific commercial fluency (SINPE Móvil, WhatsApp-first CTAs, USD-only pricing, Cartago-scoped schema) is grounded in the real audience, not generic SaaS copy.
3. Accessibility fundamentals are present where it counts: skip-link, `:focus-visible`, `aria-expanded`, reduced-motion respected for the mountain scene.

## Priority Issues

**[P0] Testimonials contradict the build-status pills shown moments earlier** — EcoPollo/VisionaryFilm testimonials describe finished systems in the past tense, while Actividad tags the same projects "BUILD · 65%" / "EN PAUSA." Undermines the page's central trust claim. **Fix**: remove testimonials for non-live projects, or rewrite as forward-looking build-process quotes. → `/impeccable clarify`

**[P0] Fixed Claude-toast avatar overlaps pricing-card text on mobile** — confirmed live at 430×900, scroll ~9226px: the bottom-left avatar bubble (`#claude-toast`, `position:fixed`) sits directly over "Landing adicional por $150 c/u" in `.pr-card.feat`, and since `.show` sets `pointer-events:all`, it likely blocks taps on that text too. **Fix**: reposition/hide the toast while a card section is in view, or move it to a corner that never collides with content. → `/impeccable adapt`

**[P1] Section-eyebrow ribbon stamped identically 12 times** — same red gradient + clip-path before every section heading is what makes the page read as templated past the hero. **Fix**: reserve the ribbon for 2-3 sections that earn the "decree" tone (Precios, Proceso); give the rest a quieter, non-repeating label. → `/impeccable quieter`

**[P1] IBM Plex Mono referenced but never loaded** — 15+ CSS rules request `'IBM Plex Mono', monospace` but the font `<link>` only loads Anton/Inter/JetBrains Mono; those elements silently fall back to system mono, visibly inconsistent with JetBrains Mono used one component over. **Fix**: replace the IBM Plex Mono declarations with JetBrains Mono. → `/impeccable typeset`

**[P1] Pricing told 3 incompatible ways** — Servicios (price ranges) vs. Precios (3 tiers) vs. Calculadora (3 types, different base prices) force the visitor to reconcile three separate mental models. **Fix**: pick the Calculadora's taxonomy (most concrete/interactive) and reuse its labels everywhere. → `/impeccable clarify`

**[P2] Founder/trust section lands last** — "Sobre mí" sits after Precios/Calculadora/FAQ/contact, but trust-in-the-founder is most valuable before the pricing ask for a non-technical solo-freelancer buyer. **Fix**: move a condensed founder card near the hero or just before Precios. → `/impeccable layout`

**[P2] `.walking-avatar` bots not covered by `prefers-reduced-motion`** — only `display:none` under 767px width; the always-on desktop bounce/walk loop has no motion-preference guard. Also: featuring a competitor's mascot (Gemini) wandering a B2B agency's own pricing table cuts against the "serious systems" positioning. **Fix**: add `.walking-avatar` to the reduced-motion block; reconsider keeping the Gemini bot on a client-facing surface. → `/impeccable harden`

## Persona Red Flags

**Jordan (non-technical CR business owner, decides fast)** — hero lands in 3 seconds, but hits Actividad's terminal-log mockup and the Stack section's AWS/PostgreSQL/Bedrock wall and tunes out; meets the actual founder only at the very bottom of a long page, too late to build trust before the pricing ask; sees the public mobile nav surface "⚙️ Panel Admin" and "🔐 Portal Clientes" to every visitor.

**Riley (stress-tester)** — flags the testimonial/status contradiction as the biggest credibility risk; "100+ leads capturados" next to a portfolio with exactly one confirmed-live client; finds the un-loaded IBM Plex Mono, the duplicate `--red` token, and a hardcoded Google Apps Script webhook URL in public `script.js` (same exposure pattern already flagged as critical for `admin.js`).

**Casey (distracted mobile)** — spared the walking avatars (hidden under 767px) and gets thumb-friendly 52px pill CTAs; but must scroll through 12 sections before reaching pricing, and hits the Claude Toast popup stacking with the always-present WhatsApp bubble, two competing floating widgets on a small screen.

## Minor Observations

- `tokens.css` declares `--red` twice (line 36 `#F87171` bright, line 101 `#7A1F1F` "soviético") — the second silently wins everywhere; no current visible break, but a landmine for a future status/error component.
- `.section-dark` (`rgba(16,19,24,.88)`) and `.section-light` (`rgba(16,19,24,.86)`) are visually indistinguishable despite the naming implying alternation.
- `.proc-node-num` contrast drops to ~2.68:1 at the darkest corner of its gold gradient circle (vs. ~6.28:1 over the main fill) — likely fine since the digits sit centered on the safer region, worth a per-digit eyeball check.
- All three testimonials are uniformly five-star with no variance — compounds the P0 contradiction above.
- Contact form fields have no `required`/`type="email"` — validation is post-submit JS only.
