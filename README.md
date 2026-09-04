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

- **Backend** : Laravel 13, PHP 8.4+ (le `composer.lock` verrouille des paquets Symfony qui exigent 8.4.1+, même si `composer.json` dit encore `^8.3`), PostgreSQL
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
| **Devis** | Un dossier client créé par un franchisé, lié à un scénario, avec ses réponses (`DevisReponse`), sa main d'œuvre (`DevisMainOeuvre`), ses prestations de service et fournitures (`DevisLigne`) et sa tarification (coefficient de difficulté, marge selon le type de tarif du dossier). |
| **Chiffrage** | L'onglet du Devis où le franchisé répond aux questions du scénario ; les produits déclenchés et le Résultat (produits, main d'œuvre, prestations, fournitures) sont recalculés à la volée. |
| **MoteurScenarios** | Service (`app/Services/MoteurScenarios.php`) qui parcourt l'arbre du scénario à partir des réponses déjà données, pour résoudre à la fois les produits déclenchés (`resoudre()`) et les questions actuellement accessibles (`questionsAccessibles()`), afin que le Chiffrage ne révèle que les sections pertinentes au fur et à mesure. |
| **Prestation / Fourniture** | Article ajouté manuellement au Chiffrage (bouton "+ Ajouter"), choisi dans un catalogue via un combobox recherchable. Stocké en `DevisLigne` avec son prix figé à l'ajout. |
| **Catalogues AquaConnect (fictifs)** | `PrestationCatalogue`, `FournitureCatalogue` et `PolitiqueTarifaire` (`app/Catalogues/`) renvoient des données codées en dur en attendant l'intégration AquaConnect — un seul point à remplacer par un appel réel le moment venu. |
| **Marge** | Taux appliqué au prix des produits et fournitures (pas aux prestations ni à la main d'œuvre), déterminé par `Devis::typeTarif()` (pro / public / autoconstructeur) d'après les champs `installateur`/`type_installateur` du dossier, avec le taux fourni par `PolitiqueTarifaire`. |

## Prérequis

- PHP 8.4+ avec l'extension PostgreSQL (`pdo_pgsql`)
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
- **`/devis/{id}`** — Onglets "Dossier" et "Chiffrage" d'un devis. Le Chiffrage propose un bouton "+ Ajouter" (main d'œuvre / prestation de service / fournitures) et un Récapitulatif en aperçu latéral (produits, main d'œuvre, prestations, fournitures, Résultat avec la marge appliquée).
- **`/devis`** — Historique des chiffrages : recherche, tri par colonne, filtre par plage de dates, pagination, export Excel.
- **`/parametres`** — Liste de taux horaires de main d'œuvre, configurable par l'admin (ajout/édition du montant/suppression) ; chaque ligne de main d'œuvre d'un devis peut cumuler des heures sur plusieurs de ces taux.

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

Le CI GitHub Actions (`.github/workflows/tests.yml`, déclenché sur push vers `master`) ne fait tourner que les tests Pest, contre un service PostgreSQL — pas encore le lint/Pint/PHPStan/Prettier, dont le code n'est pas encore aligné (dérive à résorber avant de les intégrer au CI).

## Conventions notables

- **Design tokens** : toute couleur réutilisée est définie une seule fois dans `resources/css/app.css` (`--primary`, `--label`, `--muted-foreground`, `--border-secondary`, `--disabled`, etc.) et exposée comme classe Tailwind (`text-label`, `border-border-secondary`…) — ne jamais réécrire un hex en dur dans plusieurs fichiers.
- **Boutons** : toujours passer par `<Button variant="...">` (`default` / `outline` / `destructive` / `destructive-outline`), jamais de classes CSS de bouton écrites à la main.
- **États vides** : les écrans/listes principaux utilisent `<EmptyState icon={...} title="..." />` (`resources/js/components/empty-state.tsx`) plutôt qu'une simple phrase de texte.
- **Auto-save** : les réponses du Chiffrage, le coefficient de difficulté et le filtre de dates s'enregistrent immédiatement (pas de bouton "Enregistrer" séparé), pour supporter la reprise d'un devis en brouillon et un Récapitulatif toujours à jour.

## Licence

Propriété d'Aquatiris — usage interne uniquement, non destiné à la distribution.
