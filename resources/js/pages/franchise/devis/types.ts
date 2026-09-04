/**
 * Types partagés par les écrans « devis » du franchisé (Chiffrage, Récapitulatif,
 * dialog main d'œuvre). Reflètent la forme des props envoyées par
 * App\Http\Controllers\Franchise\DevisController.
 */

export interface QuestionOption {
    id: number;
    libelle: string;
}

export interface Question {
    id: number;
    texte: string;
    infos_bulle: string | null;
    options: QuestionOption[];
}

export interface Rubrique {
    id: number;
    titre: string;
    bulle_infos: string | null;
    questions: Question[];
}

export interface Scenario {
    id: number;
    nom: string;
    famille: string;
    rubriques: Rubrique[];
}

export interface DevisReponse {
    question_id: number;
    question_option_id: number;
}

export interface Ligne {
    cle: string;
    produit_ref: string | null;
    quantite: number;
    nom: string;
    prix: number | null;
}

export interface TauxHoraire {
    id: number;
    libelle: string;
    montant: number;
}

export interface MainOeuvre {
    id: number;
    libelle: string;
    description: string | null;
    heures: { taux_horaire_id: number; libelle: string; nombre_heures: number }[];
    cout: number;
}

export interface Totaux {
    /** Affiché sous le libellé « Résultat » dans le Récapitulatif. */
    total_ht: number;
}

export type CategorieLigne = 'prestation' | 'fourniture';

/** Article sélectionnable dans le combobox (catalogue prestations ou fournitures). */
export interface ArticleCatalogue {
    ref: string;
    nom: string;
    prix: number;
}

/** Ligne prestation/fourniture ajoutée manuellement au devis (prix figé à l'ajout). */
export interface LigneCatalogue {
    id: number;
    categorie: CategorieLigne;
    produit_ref: string | null;
    libelle: string;
    quantite: number;
    prix_unitaire: number;
}

export interface LignesParCategorie {
    prestation: LigneCatalogue[];
    fourniture: LigneCatalogue[];
}

export interface Catalogues {
    prestation: ArticleCatalogue[];
    fourniture: ArticleCatalogue[];
}
