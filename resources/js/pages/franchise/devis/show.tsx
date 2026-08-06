import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ChiffrageTab from './components/ChiffrageTab';
import DossierFields from './components/DossierFields';
import Recapitulatif from './components/Recapitulatif';

interface QuestionOption {
    id: number;
    libelle: string;
}

interface Question {
    id: number;
    texte: string;
    infos_bulle: string | null;
    options: QuestionOption[];
}

interface Rubrique {
    id: number;
    titre: string;
    bulle_infos: string | null;
    questions: Question[];
}

interface Scenario {
    id: number;
    nom: string;
    famille: string;
    rubriques: Rubrique[];
}

interface DevisReponse {
    question_id: number;
    question_option_id: number;
}

interface Devis {
    id: number;
    client_nom: string | null;
    dispositif: string | null;
    nombre_batiments: number | null;
    capacite_eh: number | null;
    nombre_chambres: number | null;
    type_effluents: string | null;
    installateur: string | null;
    type_installateur: string | null;
    installateur_agree_nom: string | null;
    type_realisation: string | null;
    coefficient_difficulte: number;
    remise_valeur: number | null;
    remise_type: 'montant' | 'pourcentage' | null;
    scenario: Scenario | null;
    reponses: DevisReponse[];
}

interface Ligne {
    produit_ref: string;
    quantite: number;
    nom: string;
    prix: number | null;
}

interface MainOeuvre {
    id: number;
    libelle: string;
    nombre_heures_chantier: number;
    nombre_heures_mini_pelle: number;
    cout: number;
}


interface Totaux {
    total_ht: number;
    total_tva: number;
    total_ttc: number;
}

interface Props {
    devis: Devis;
    resolution: Ligne[];
    visibleQuestionIds: number[];
    mainOeuvres: MainOeuvre[];
    totaux: Totaux;
}

function toDossierData(devis: Devis) {
    return {
        client_nom: devis.client_nom ?? '',
        dispositif: devis.dispositif ?? '',
        nombre_batiments: devis.nombre_batiments?.toString() ?? '',
        capacite_eh: devis.capacite_eh?.toString() ?? '',
        nombre_chambres: devis.nombre_chambres?.toString() ?? '',
        type_effluents: devis.type_effluents ?? '',
        installateur: devis.installateur ?? '',
        type_installateur: devis.type_installateur ?? '',
        installateur_agree_nom: devis.installateur_agree_nom ?? '',
        type_realisation: devis.type_realisation ?? '',
    };
}

export default function Show({ devis, resolution, visibleQuestionIds, mainOeuvres, totaux }: Props) {
    const initialTab = new URLSearchParams(window.location.search).get('tab') === 'chiffrage' ? 'chiffrage' : 'dossier';
    const [tab, setTab] = useState<'dossier' | 'chiffrage'>(initialTab);
    const [dossierData, setDossierData] = useState(toDossierData(devis));

    return (
        <>
            <Head title={`Chiffrage — ${devis.client_nom ?? 'Dossier'}`} />

            <div className="flex flex-col gap-4 pt-8 pb-4 pr-6 pl-[52px] md:pr-4 md:pl-[44px]">
                <div className="flex flex-col gap-4">
                    <div className="flex gap-6 border-b border-border">
                        <button
                            type="button"
                            onClick={() => setTab('dossier')}
                            className={
                                tab === 'dossier'
                                    ? 'border-b-2 border-primary pb-2 text-sm font-medium text-primary'
                                    : 'pb-2 text-sm text-muted-foreground'
                            }
                        >
                            Dossier
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab('chiffrage')}
                            className={
                                tab === 'chiffrage'
                                    ? 'border-b-2 border-primary pb-2 text-sm font-medium text-primary'
                                    : 'pb-2 text-sm text-muted-foreground'
                            }
                        >
                            Chiffrage
                        </button>
                    </div>

                    {tab === 'dossier' && (
                        <DossierFields
                            data={dossierData}
                            onChange={(field, value) => setDossierData((prev) => ({ ...prev, [field]: value }))}
                        />
                    )}

                    {tab === 'chiffrage' && (
                        <div className="flex items-start gap-6">
                            <div className="flex-1">
                                <ChiffrageTab
                                    devisId={devis.id}
                                    scenario={devis.scenario}
                                    reponses={devis.reponses}
                                    visibleQuestionIds={visibleQuestionIds}
                                    mainOeuvres={mainOeuvres}
                                />
                            </div>
                            <div className="flex w-80 shrink-0 flex-col gap-3">
                                <Recapitulatif
                                    devisId={devis.id}
                                    lignes={resolution}
                                    mainOeuvres={mainOeuvres}
                                    totaux={totaux}
                                    coefficientDifficulte={devis.coefficient_difficulte}
                                    remiseValeur={devis.remise_valeur}
                                    remiseType={devis.remise_type}
                                />
                                <Button
                                    type="button"
                                    variant="destructive-outline"
                                    onClick={() => router.delete(`/devis/${devis.id}/reponses`)}
                                    className="self-end"
                                >
                                    Vider
                                </Button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}

Show.layout = (props: Props) => ({
    breadcrumbs: [{ title: `Chiffrage ${props.devis.client_nom ?? ''}`, href: `/devis/${props.devis.id}` }],
});
