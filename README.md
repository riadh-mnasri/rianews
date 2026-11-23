# L'Essentiel

L'actu qui compte, en deux minutes. Une app mobile installable (iPhone et Android) qui résume les dernières infos par centre d'intérêt : IA, tech, politique, actualités, économie. Format court, grands caractères, pensé pour être lu d'une main.

[Read this in English](./README.en.md)

## Fonctionnalités

- **Brief par rubrique** : pour chaque centre d'intérêt, les 6 sujets les plus importants des dernières 48 heures, dédoublonnés entre médias.
- **Format court** : un titre clair, l'essentiel en deux phrases, « Pourquoi ça compte » et une phrase « À placer en société ».
- **« Les 3 infos à retenir »** en tête de la page d'accueil.
- **Rubriques au choix** dès le premier lancement, modifiables à tout moment.
- **Confort de lecture** : 5 tailles de texte, thème clair, sombre ou automatique, typographie serif lisible.
- **Installable** (PWA) : icône sur l'écran d'accueil, plein écran, lecture hors ligne de la dernière version.
- **Navigation au pouce** : onglets en haut, glisser à gauche ou à droite pour changer de rubrique, partage natif d'une info.
- **Bilingue** français / anglais (sources françaises en FR, anglophones en EN).

## Stack

- Next.js 16 (App Router, Turbopack), React 19
- TypeScript, Tailwind CSS v4
- next-intl (interface FR/EN)
- API Claude (`@anthropic-ai/sdk`, sorties structurées validées par Zod) pour les résumés
- rss-parser pour l'agrégation des flux
- Préférences et derniers briefs stockés en `localStorage`, pas de base de données

## Sources

Flux RSS publics : Le Monde, franceinfo, Le Figaro, Libération, Numerama, Frandroid, 01net, ActuIA, The Verge et Google Actualités (FR) ; BBC, Ars Technica, The Verge, MIT Technology Review et Google News (EN). La liste se modifie dans [`src/data/categories.ts`](./src/data/categories.ts).

## Installation

```bash
npm install
cp .env.example .env.local
```

## Variables d'environnement

| Variable | Rôle |
| --- | --- |
| `ANTHROPIC_API_KEY` | Active les résumés rédigés par Claude. Sans clé, l'app passe en « mode dépêches » : derniers titres avec leur chapô. |
| `ANTHROPIC_BRIEF_MODEL` | Optionnel. Modèle utilisé (par défaut `claude-opus-5-5`). |

Chaque brief est mis en cache une heure par rubrique et par langue : au maximum 10 appels à l'API par heure, quel que soit le nombre de lecteurs.

## Développement local

```bash
npm run dev
```

L'app tourne sur [http://localhost:3185](http://localhost:3185).

## Qualité

```bash
npm run lint
npm run build
```

## Déploiement

Déployé sur Vercel, avec l'intégration GitHub : chaque push sur `main` part en production. Ajouter `ANTHROPIC_API_KEY` dans les variables d'environnement du projet Vercel.

## Installer l'app sur son téléphone

- **iPhone (Safari)** : ouvrir le site, toucher le bouton Partager, puis « Sur l'écran d'accueil ».
- **Android (Chrome)** : ouvrir le site, toucher « Installer » dans la bannière (ou menu ⋮ puis « Installer l'application »).

## Feuille de route

- [x] Briefs par rubrique, résumés par Claude
- [x] PWA installable, lecture hors ligne
- [x] Tailles de texte, thème sombre, FR/EN
- [ ] Notification du brief du matin
- [ ] Rubriques personnalisées (mots-clés libres)
- [ ] Marquer les infos déjà lues

## Licence

© 2026 Riadh MNASRI. Voir [LICENSE](./LICENSE).
