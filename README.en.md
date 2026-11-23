# L'Essentiel

The news that matters, in two minutes. An installable mobile app (iPhone and Android) that sums up the latest news by topic: AI, tech, politics, world news, economy. Short format, large type, built to be read with one hand.

[Lire en français](./README.md)

## Features

- **One brief per topic**: for each interest, the 6 most important stories of the last 48 hours, deduplicated across outlets.
- **Short format**: a clear headline, the gist in two sentences, "Why it matters" and a "Conversation starter".
- **"3 things to remember"** at the top of the home page.
- **Pick your topics** on first launch, change them at any time.
- **Reading comfort**: 5 text sizes, light, dark or automatic theme, readable serif typography.
- **Installable** (PWA): home screen icon, full screen, offline reading of the last version.
- **Thumb-friendly**: tabs at the top, swipe left or right to switch topic, native share.
- **Bilingual** French / English (French sources in FR, English-language sources in EN).

## Stack

- Next.js 16 (App Router, Turbopack), React 19
- TypeScript, Tailwind CSS v4
- next-intl (FR/EN interface)
- Claude API (`@anthropic-ai/sdk`, structured outputs validated with Zod) for summaries
- rss-parser for feed aggregation
- Preferences and last briefs stored in `localStorage`, no database

## Sources

Public RSS feeds: Le Monde, franceinfo, Le Figaro, Libération, Numerama, Frandroid, 01net, ActuIA, The Verge and Google News (FR); BBC, Ars Technica, The Verge, MIT Technology Review and Google News (EN). Edit the list in [`src/data/categories.ts`](./src/data/categories.ts).

## Setup

```bash
npm install
cp .env.example .env.local
```

## Environment variables

| Variable | Purpose |
| --- | --- |
| `ANTHROPIC_API_KEY` | Enables summaries written by Claude. Without it, the app runs in "headlines mode": latest headlines with their standfirst. |
| `ANTHROPIC_BRIEF_MODEL` | Optional. Model used (defaults to `claude-opus-5-5`). |

Each brief is cached for one hour per topic and language: at most 10 API calls per hour, whatever the number of readers.

## Local development

```bash
npm run dev
```

The app runs on [http://localhost:3185](http://localhost:3185).

## Quality

```bash
npm run lint
npm run build
```

## Deployment

Deployed on Vercel with the GitHub integration: every push to `main` goes to production. Add `ANTHROPIC_API_KEY` to the Vercel project environment variables.

## Install the app on your phone

- **iPhone (Safari)**: open the site, tap Share, then "Add to Home Screen".
- **Android (Chrome)**: open the site, tap "Install" in the banner (or menu ⋮ then "Install app").

## Roadmap

- [x] Topic briefs summarised by Claude
- [x] Installable PWA, offline reading
- [x] Text sizes, dark theme, FR/EN
- [ ] Morning brief notification
- [ ] Custom topics (free keywords)
- [ ] Mark stories as read

## License

© 2026 Riadh MNASRI. See [LICENSE](./LICENSE).
