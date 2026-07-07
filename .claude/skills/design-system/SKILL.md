---
name: design-system
description: Use when the user wants a landing page, UI, or component to match the visual style of a specific well-known brand or product (e.g. "make it look like Linear", "Stripe-style pricing page", "Apple-like product page", "Vercel dark theme", "give it that Notion feel"). Contains 74 analyzed DESIGN.md files with exact color tokens, typography scales, spacing, and component patterns for major tech/consumer brands. Trigger words: "como Linear/Stripe/Apple/...", "estilo [marca]", "que se vea como", "dame la paleta de", "design system de".
---

# Design System Reference Library

74 brand design systems, each as a `DESIGN.md` with exact color tokens (hex), typography scales (font, size, weight, line-height, letter-spacing), spacing rules, and component patterns extracted from the real product.

## How to use

1. Identify which brand the user is referencing (explicit name, or infer from description: "minimalist dark dev tool" → Linear/Vercel; "warm e-commerce" → Airbnb/Shopify).
2. Read `brands/<name>/DESIGN.md` — it's plain YAML+notes, directly usable as CSS variables / Tailwind config.
3. Apply the tokens to the actual project (Apex client landing, etc.) — adapt content/copy to the client, keep the *system* (colors, type scale, spacing rhythm, component shapes) from the reference.
4. Never copy brand names, logos, or copyrighted assets into client work — only the *design language* (colors, type, spacing, layout patterns) is reference material.

## Available brands

```
airbnb       airtable     apple        binance      bmw
bmw-m        bugatti      cal          claude       clay
clickhouse   cohere       coinbase     composio     cursor
dell-1996    elevenlabs   expo         ferrari      figma
framer       hashicorp    hp           ibm          intercom
kraken       lamborghini  linear.app   lovable      mastercard
meta         minimax      mintlify     miro         mistral.ai
mongodb      nike         nintendo-2001 notion      nvidia
ollama       opencode.ai  pinterest    playstation  posthog
raycast      renault      replicate    resend       revolut
runwayml     sanity       sentry       shopify      slack
spacex       spotify      starbucks    stripe       superhuman
supabase     tesla        theverge     together.ai  uber
vercel       vodafone     voltagent    warp         webflow
wired        wise         x.ai         zapier
```

## Apex-relevant picks

- **Dark/technical/SaaS feel** (Apex corporate, EcoPollo cotizador): `linear.app`, `vercel`, `stripe`, `raycast`, `cal`
- **Warm/lifestyle/product** (Skindoctors, Arte Verde): `airbnb`, `shopify`, `starbucks`, `nike`
- **Minimal/premium** (RFLX): `apple`, `figma`, `framer`, `mintlify`
