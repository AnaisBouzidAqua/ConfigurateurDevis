import { router } from '@inertiajs/react';
import { Info, List, X } from 'lucide-react';
import { useState } from 'react';
import { SectionTitle, SubSectionTitle } from '@/components/section-title';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatEuros } from '@/lib/utils';
import type { Ligne, LigneCatalogue, MainOeuvre, Tarif, Totaux } from '../types';

const LABELS_TARIF: Record<Tarif['type'], string> = {
    pro: 'professionnel',
    public: 'public',
    autoconstructeur: 'autoconstructeur',
};

function LigneCatalogueRow({ ligne, devisId }: { ligne: LigneCatalogue; devisId: number }) {
    return (
        <div className="grid grid-cols-[1fr_auto_auto] items-start gap-x-2 text-sm">
            <span className="text-muted-foreground">{ligne.libelle}</span>
            <span className="text-foreground w-20 text-right">{formatEuros(ligne.quantite * ligne.prix_unitaire)}</span>
            <button
                type="button"
                onClick={() => router.delete(`/devis/${devisId}/lignes/${ligne.id}`)}
                className="text-destructive hover:text-destructive/80"
                aria-label={`Retirer ${ligne.libelle}`}
            >
                <X className="size-4" />
            </button>
        </div>
    );
}

interface Props {
    devisId: number;
    lignes: Ligne[];
    mainOeuvres: MainOeuvre[];
    lignesCatalogue: LigneCatalogue[];
    totaux: Totaux;
    tarif: Tarif;
    coefficientDifficulte: number;
}

export default function Recapitulatif({
    devisId,
    lignes,
    mainOeuvres,
    lignesCatalogue,
    totaux,
    tarif,
    coefficientDifficulte,
}: Props) {
    const prestations = lignesCatalogue.filter((ligne) => ligne.categorie === 'prestation');
    const fournitures = lignesCatalogue.filter((ligne) => ligne.categorie === 'fourniture');
    const rienAChiffrer = lignes.length === 0 && mainOeuvres.length === 0 && lignesCatalogue.length === 0;

    const [coefficient, setCoefficient] = useState(String(coefficientDifficulte));
    const [coefficientError, setCoefficientError] = useState<string | null>(null);

    function saveTarification(changes: { coefficient_difficulte?: string }) {
        router.post(
            `/devis/${devisId}/tarification`,
            {
                coefficient_difficulte: changes.coefficient_difficulte ?? coefficient,
            },
            {
                preserveState: true,
                preserveScroll: true,
                onError: (errors) => setCoefficientError(errors.coefficient_difficulte ?? null),
                onSuccess: () => setCoefficientError(null),
            },
        );
    }

    return (
        <aside className="w-80 shrink-0 rounded-md border p-4">
            <div className="flex items-center gap-2 pb-4">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                    <List className="text-primary size-4" />
                </div>
                <SectionTitle className="text-label">Récapitulatif</SectionTitle>
            </div>
            <div className="-mx-4 border-b" />

            {rienAChiffrer ? (
                <p className="text-muted-foreground mt-3 text-sm">Aucun élément pour l'instant.</p>
            ) : (
                <div className="mt-3 mb-4 flex flex-col gap-4">
                    {lignes.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <SubSectionTitle>Produits</SubSectionTitle>
                            {lignes.map((ligne) => (
                                <div
                                    key={ligne.cle}
                                    className="grid grid-cols-[auto_1fr_auto_auto] items-start gap-x-2 text-sm"
                                >
                                    <span className="text-muted-foreground">×{ligne.quantite}</span>
                                    <span className="text-muted-foreground">{ligne.nom}</span>
                                    <span className="text-foreground w-20 text-right">
                                        {ligne.prix !== null ? formatEuros(ligne.quantite * ligne.prix) : '—'}
                                    </span>
                                    <span className="size-4" aria-hidden="true" />
                                </div>
                            ))}
                        </div>
                    )}

                    {mainOeuvres.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <SubSectionTitle>Main d'œuvre</SubSectionTitle>
                            {mainOeuvres.map((mo) => (
                                <div
                                    key={mo.id}
                                    className="grid grid-cols-[1fr_auto_auto] items-start gap-x-2 text-sm"
                                >
                                    {mo.description ? (
                                        <Tooltip>
                                            <TooltipTrigger type="button" className="text-muted-foreground text-left">
                                                {mo.libelle}
                                            </TooltipTrigger>
                                            <TooltipContent>{mo.description}</TooltipContent>
                                        </Tooltip>
                                    ) : (
                                        <span className="text-muted-foreground">{mo.libelle}</span>
                                    )}
                                    <span className="text-foreground w-20 text-right">{formatEuros(mo.cout)}</span>
                                    <button
                                        type="button"
                                        onClick={() => router.delete(`/devis/${devisId}/main-oeuvre/${mo.id}`)}
                                        className="text-destructive hover:text-destructive/80"
                                        aria-label={`Retirer ${mo.libelle}`}
                                    >
                                        <X className="size-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {prestations.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <SubSectionTitle>Prestations de service</SubSectionTitle>
                            {prestations.map((ligne) => (
                                <LigneCatalogueRow key={ligne.id} ligne={ligne} devisId={devisId} />
                            ))}
                        </div>
                    )}

                    {fournitures.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <SubSectionTitle>Fournitures</SubSectionTitle>
                            {fournitures.map((ligne) => (
                                <LigneCatalogueRow key={ligne.id} ligne={ligne} devisId={devisId} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="mt-4 flex flex-col gap-3 border-t pt-3">
                <div className="grid gap-1.5">
                    <div className="flex items-center gap-1.5">
                        <Label htmlFor="coefficient_difficulte" className="font-bold">
                            Coefficient de difficulté
                        </Label>
                        <span className="text-muted-foreground text-xs">%</span>
                        <Tooltip>
                            <TooltipTrigger type="button">
                                <Info className="text-muted-foreground size-3.5" />
                            </TooltipTrigger>
                            <TooltipContent>Applique une hausse tarifaire au total, en pourcentage</TooltipContent>
                        </Tooltip>
                    </div>
                    <Input
                        id="coefficient_difficulte"
                        type="number"
                        step="1"
                        min={0}
                        value={coefficient}
                        onChange={(e) => setCoefficient(e.target.value.replace(/[^0-9]/g, ''))}
                        onBlur={() => saveTarification({ coefficient_difficulte: coefficient })}
                    />
                    {coefficientError && <p className="text-sm text-red-600">{coefficientError}</p>}
                </div>
            </div>

            <div className="mt-4 border-t pt-3 text-sm">
                <div className="flex justify-between font-semibold">
                    <span className="text-foreground flex items-center gap-1.5">
                        Résultat
                        <Tooltip>
                            <TooltipTrigger type="button">
                                <Info className="text-muted-foreground size-3.5" />
                            </TooltipTrigger>
                            <TooltipContent>
                                Résultat prenant en compte vos marges d'après le type du dossier.
                            </TooltipContent>
                        </Tooltip>
                    </span>
                    <span className="text-foreground">{formatEuros(totaux.total_ht)}</span>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                    Tarif {LABELS_TARIF[tarif.type]} — marge {tarif.taux_marge}&nbsp;%
                </p>
            </div>
        </aside>
    );
}
