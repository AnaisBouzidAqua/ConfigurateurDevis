# Configurateur Devis

Application interne Aquatiris permettant aux **franchisés** de chiffrer un dispositif d'assainissement à partir d'un scénario de questions/réponses paramétré par l'**admin**, puis de suivre l'historique de leurs chiffrages.

## Table des matières

- [Stack technique](#stack-technique)
- [Concepts métier](#concepts-métier)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Développement](#développement)
- [Structure des écrans](#structure-des-écrans)
- [Tests et qualité](#tests-et-qualité)
- [Conventions notables](#conventions-notables)
- [Licence](#licence)

## Stack technique

- **Backend** : Laravel 13, PHP 8.3+, PostgreSQL
- **Frontend** : Inertia.js, React 19, TypeScript, Tailwind CSS v4 (design tokens dans `resources/css/app.css`), composants shadcn/ui sur primitives Radix
- **Tests** : Pest (PHP), PHPStan/Larastan
- **Qualité** : ESLint, Prettier, Laravel Pint, `tsc --noEmit`
- **Export** : maatwebsite/excel

## Concepts métier

| Terme | Description |
|---|---|
| **Scénario** | Un arbre de questions/réponses paramétré par l'admin pour une famille de dispositifs. |
| **Rubrique** | Une section du scénario regroupant plusieurs questions (ex: "Type de sol"). |
| **Question / Option** | Chaque option d'une question peut déclencher des produits et/ou renvoyer vers une autre rubrique/question (branchement conditionnel). |
| **Devis** | Un dossier client créé par un franchisé, lié à un scénario, avec ses réponses (`DevisReponse`), sa main d'œuvre (`DevisMainOeuvre`) et sa tarification (coefficient de difficulté, remise). |
| **Chiffrage** | L'onglet du Devis où le franchisé répond aux questions du scénario ; les produits déclenchés et le total (HT/TVA/TTC) sont recalculés à la volée. |
| **MoteurScenarios** | Service (`app/Services/MoteurScenarios.php`) qui parcourt l'arbre du scénario à partir des réponses déjà données, pour résoudre à la fois les produits déclenchés (`resoudre()`) et les questions actuellement accessibles (`questionsAccessibles()`), afin que le Chiffrage ne révèle que les sections pertinentes au fur et à mesure. |

## Prérequis

- PHP 8.3+ avec l'extension PostgreSQL (`pdo_pgsql`)
- PostgreSQL 14+
- Node.js 20+
- Composer

## Installation

```bash
composer install
npm install

cp .env.example .env
php artisan key:generate
```

Configure la base de données dans `.env` (`DB_CONNECTION=pgsql` par défaut), puis :

```bash
php artisan migrate
```

## Développement

```bash
composer run dev
```

Lance en parallèle le serveur Laravel, le build Vite (avec hot-reload) et la queue de jobs. Sinon, séparément :

```bash
php artisan serve
npm run dev
```

L'application est accessible sur `http://localhost:8000`.

## Structure des écrans

- **`/admin/scenarios`** — Back-office pour paramétrer les scénarios, rubriques, questions et leurs produits déclenchés.
- **`/devis/create`** — Formulaire "Dossier" pour démarrer un nouveau chiffrage (franchisé).
- **`/devis/{id}`** — Onglets "Dossier" et "Chiffrage" d'un devis, avec Récapitulatif (produits, main d'œuvre, totaux) en aperçu latéral.
- **`/devis`** — Historique des chiffrages : recherche, tri par colonne, filtre par plage de dates, pagination, export Excel.
- **`/parametres`** — Taux horaires de main d'œuvre (chantier, mini-pelle), utilisés pour calculer le coût de la main d'œuvre saisie sur un devis.

## Tests et qualité

```bash
php artisan test          # Pest
composer run lint:check   # Laravel Pint
composer run types:check  # PHPStan / Larastan

npm run lint:check        # ESLint
npm run format:check      # Prettier
npm run types:check       # tsc --noEmit
```

`composer run test` enchaîne le lint, l'analyse statique et les tests Pest.

## Conventions notables

- **Design tokens** : toute couleur réutilisée est définie une seule fois dans `resources/css/app.css` (`--primary`, `--label`, `--muted-foreground`, `--border-secondary`, `--disabled`, etc.) et exposée comme classe Tailwind (`text-label`, `border-border-secondary`…) — ne jamais réécrire un hex en dur dans plusieurs fichiers.
- **Boutons** : toujours passer par `<Button variant="...">` (`default` / `outline` / `destructive` / `destructive-outline`), jamais de classes CSS de bouton écrites à la main.
- **États vides** : les écrans/listes principaux utilisent `<EmptyState icon={...} title="..." />` (`resources/js/components/empty-state.tsx`) plutôt qu'une simple phrase de texte.
- **Auto-save** : les réponses du Chiffrage, le coefficient de difficulté, la remise et le filtre de dates s'enregistrent immédiatement (pas de bouton "Enregistrer" séparé), pour supporter la reprise d'un devis en brouillon et un Récapitulatif toujours à jour.

## Licence

Propriété d'Aquatiris — usage interne uniquement, non destiné à la distribution.
