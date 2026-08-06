import { router } from '@inertiajs/react';
import { Info, List } from 'lucide-react';
import { useState } from 'react';
import { SectionTitle, SubSectionTitle } from '@/components/section-title';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Ligne {
    produit_ref: string;
    quantite: number;
    nom: string;
    prix: number | null;
}

interface Totaux {
    total_ht: number;
    total_tva: number;
    total_ttc: number;
}

interface Props {
    devisId: number;
    lignes: Ligne[];
    totaux: Totaux;
    coefficientDifficulte: number;
    remiseValeur: number | null;
    remiseType: 'montant' | 'pourcentage' | null;
}

export default function Recapitulatif({
    devisId,
    lignes,
    totaux,
    coefficientDifficulte,
    remiseValeur,
    remiseType,
}: Props) {
    const [coefficient, setCoefficient] = useState(String(coefficientDifficulte));
    const [remise, setRemise] = useState(remiseValeur !== null ? String(remiseValeur) : '0');
    const [typeRemise, setTypeRemise] = useState<'montant' | 'pourcentage'>(remiseType ?? 'montant');

    function saveTarification(changes: {
        coefficient_difficulte?: string;
        remise_valeur?: string;
        remise_type?: string;
    }) {
        router.post(
            `/devis/${devisId}/tarification`,
            {
                coefficient_difficulte: changes.coefficient_difficulte ?? coefficient,
                remise_valeur: changes.remise_valeur ?? remise,
                remise_type: changes.remise_type ?? typeRemise,
            },
            { preserveState: true, preserveScroll: true },
        );
    }

    return (
        <aside className="w-80 shrink-0 rounded-md border p-4">
            <div className="flex items-center gap-2 pb-4">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                    <List className="text-primary size-4" />
                </div>
                <SectionTitle>Récapitulatif</SectionTitle>
            </div>
            <div className="-mx-4 border-b" />

            {lignes.length === 0 ? (
                <p className="text-muted-foreground mt-3 text-sm">Aucun produit pour l'instant.</p>
            ) : (
                <ul className="mt-3 mb-4 flex flex-col gap-4">
                    {lignes.map((ligne) => (
                        <li
                            key={ligne.produit_ref}
                            className="grid grid-cols-[auto_1fr_auto] items-start gap-x-2 text-sm"
                        >
                            <span className="text-[#64748B]">×{ligne.quantite}</span>
                            <span className="text-[#64748B]">{ligne.nom}</span>
                            <span className="text-[#212529]">
                                {ligne.prix !== null ? `${(ligne.quantite * ligne.prix).toFixed(2)} €` : '—'}
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            <div className="mt-4">
                <SubSectionTitle>Prix</SubSectionTitle>
            </div>

            <div className="flex flex-col gap-3 border-t pt-3">
                <div className="grid gap-1.5">
                    <div className="flex items-center gap-1.5">
                        <Label htmlFor="coefficient_difficulte" className="text-[#64748B]">
                            Coefficient de difficulté
                        </Label>
                        <Tooltip>
                            <TooltipTrigger type="button">
                                <Info className="text-[#64748B] size-3.5" />
                            </TooltipTrigger>
                            <TooltipContent>Applique une hausse tarifaire au total</TooltipContent>
                        </Tooltip>
                    </div>
                    <Input
                        id="coefficient_difficulte"
                        type="number"
                        step="0.01"
                        min={0}
                        value={coefficient}
                        onChange={(e) => setCoefficient(e.target.value)}
                        onBlur={() => saveTarification({ coefficient_difficulte: coefficient })}
                    />
                </div>

                <div className="grid gap-1.5">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="remise_valeur" className="text-[#64748B]">
                            Remise commercial
                        </Label>
                        <RadioGroup
                            value={typeRemise}
                            onValueChange={(value) => {
                                setTypeRemise(value as 'montant' | 'pourcentage');
                                saveTarification({ remise_type: value });
                            }}
                            className="flex gap-3"
                        >
                            <div className="flex items-center gap-1">
                                <RadioGroupItem value="montant" id="remise_montant" />
                                <Label htmlFor="remise_montant" className="text-xs">
                                    €
                                </Label>
                            </div>
                            <div className="flex items-center gap-1">
                                <RadioGroupItem value="pourcentage" id="remise_pourcentage" />
                                <Label htmlFor="remise_pourcentage" className="text-xs">
                                    %
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <Input
                        id="remise_valeur"
                        type="number"
                        step="0.01"
                        min={0}
                        value={remise}
                        onChange={(e) => setRemise(e.target.value)}
                        onBlur={() => saveTarification({ remise_valeur: remise })}
                    />
                </div>
            </div>


            <div className="mt-4 flex flex-col gap-1 border-t pt-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-[#64748B]">Total HT</span>
                    <span className="text-[#212529]">{totaux.total_ht.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-[#64748B]">Total TVA</span>
                    <span className="text-[#212529]">{totaux.total_tva.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between font-semibold">
                    <span className="text-[#212529]">Total TTC</span>
                    <span className="text-[#212529]">{totaux.total_ttc.toFixed(2)} €</span>
                </div>
            </div>
        </aside>
    );
}
