# Contexte de reprise RiaNews

RiaNews est une application web installable d’actualité bilingue (FR/EN), conçue pour lire rapidement un brief sur iPhone et Samsung Android. La direction visuelle est celle d’un magazine numérique avec une une bleu nuit et ivoire, une typographie éditoriale et une lecture aérée sur mobile.

## État vérifié en production

- Le déploiement Vercel `dpl_7Sug6fBEqpCe1NPqDfR1LztBE8u6` a livré la rubrique Bourse sur [RiaNews](https://rianews.vercel.app/fr).
- La refonte de l’accueil et les ajustements de lecture mobile sont déployés. La mise en page a été testée sur des profils iPhone et Galaxy simulés jusqu’à 320 px de large.
- La nouvelle icône est un R ivoire sur fond bleu nuit, souligné d’un filet doré. Le proxy de langue ignore les routes des icônes. L’icône Apple répond directement en PNG 180 × 180 sur le domaine public. Si un raccourci installé conserve l’ancienne image, ouvrir le site dans Safari et l’ajouter à nouveau à l’écran d’accueil.
- La rubrique Bourse se trouve dans **Réglages → Centres d’intérêt**. Les sélections existantes sont conservées. L’API publique a renvoyé 10 dépêches en français et 10 en anglais lors de la vérification. La rubrique couvre des indices, des résultats d’entreprises cotées et des ETF. Le mode observé était `raw`, avec des liens vers les sources.

## Priorités proposées pour la suite

1. Rétablir les résumés en production. Diagnostiquer le mode `raw`, puis vérifier sur les données réelles que les briefs expliquent ce qui s’est passé, pourquoi cela compte et ce qu’il faut surveiller, avec les sources.
2. Ajouter une liste de suivi Bourse pour sélectionner des actions, des indices et des ETF, puis faire remonter les nouvelles et dates de résultats pertinentes.
3. Définir une édition du jour courte et finie. Lors d’une nouvelle visite, mettre en avant ce qui a changé depuis la dernière lecture.
4. Ajouter des alertes facultatives, avec une heure de brief choisie et des notifications pour les événements suivis.

## Repères techniques

- Next.js 16, React, Tailwind et next-intl. Lire les guides Next.js installés sous `node_modules/next/dist/docs/` avant de modifier le code, comme indiqué dans `AGENTS.md`.
- Les rubriques sont définies dans `src/data/categories.ts` et `src/data/category-meta.ts`. Le brief est généré dans `src/lib/brief.ts` à partir des flux RSS, avec repli sur les dépêches lorsque la synthèse Anthropic est indisponible.
- Le projet Vercel est `riadh-mnasris-projects/rianews`, ID `prj_99wweYFoJ30ur5ifV8HBa8nanLKS`. Le fichier local `.vercel/project.json` a déjà affiché l’ancien nom `lessentiel` pour ce même ID. Vérifier le nom distant et l’alias public avant de publier.
