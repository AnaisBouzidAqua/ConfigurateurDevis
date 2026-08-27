import { Check, ChevronsUpDown, Copy, List, Package, PenLine, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { RequiredMark } from '@/components/required-mark';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Produit, Question, Rubrique } from './RubriquesSection';

export interface ReponseDataProduit {
    produit_ref: string | null;
    libelle_libre: string | null;
    prix_libre: number | null;
    quantite: number;
}

export interface ReponseData {
    libelle: string;
    rubrique_suivante_id: string;
    question_suivante_id: string;
    produits: ReponseDataProduit[];
}

interface ReponseCardProps {
    index: number;
    reponse: ReponseData;
    rubriques: Rubrique[];
    questions: Question[];
    produits: Produit[];
    onChange: (changes: Partial<ReponseData>) => void;
    onDuplicate: () => void;
    onRemove: () => void;
    canRemove: boolean;
}

// Un sous-composant par réponse, plutôt qu'un seul bloc dans le formulaire parent,
// pour que chaque réponse ait son propre état local (produitRef/quantite) sans
// avoir à synchroniser un tableau parallèle à questionForm.data.reponses.
export function ReponseCard({
    index,
    reponse,
    rubriques,
    questions,
    produits,
    onChange,
    onDuplicate,
    onRemove,
    canRemove,
}: ReponseCardProps) {
    const label = `Réponse ${String.fromCharCode(65 + index)}`;
    // Préfixe unique par réponse pour éviter des id HTML en double
    // (plusieurs ReponseCard sont rendues côte à côte dans le même formulaire).
    const prefix = `q_${index}`;

    const [modeAjout, setModeAjout] = useState<'catalogue' | 'libre'>('catalogue');
    const [produitRef, setProduitRef] = useState('');
    const [produitComboboxOuvert, setProduitComboboxOuvert] = useState(false);
    const [libelleLibre, setLibelleLibre] = useState('');
    const [prixLibre, setPrixLibre] = useState('');
    const [quantite, setQuantite] = useState(1);

    // produitRef vaut '' par defaut ; ne pas matcher un produit dont la reference
    // AquaConnect est elle-meme vide, sinon il apparait selectionne par defaut.
    const produitSelectionne = produitRef !== '' ? produits.find((produit) => produit.ref === produitRef) : undefined;

    function addProduitCatalogue() {
        if (!produitRef.trim()) {
            return;
        }

        onChange({
            produits: [
                ...reponse.produits,
                { produit_ref: produitRef.trim(), libelle_libre: null, prix_libre: null, quantite },
            ],
        });
        setProduitRef('');
        setQuantite(1);
    }

    const libelleLibreValide = libelleLibre.trim() !== '';
    const prixLibreValide = prixLibre !== '' && !Number.isNaN(Number(prixLibre)) && Number(prixLibre) >= 0;

    function addProduitLibre() {
        if (!libelleLibreValide || !prixLibreValide) {
            return;
        }

        onChange({
            produits: [
                ...reponse.produits,
                { produit_ref: null, libelle_libre: libelleLibre.trim(), prix_libre: Number(prixLibre), quantite },
            ],
        });
        setLibelleLibre('');
        setPrixLibre('');
        setQuantite(1);
    }

    function removeProduit(produitIndex: number) {
        onChange({
            produits: reponse.produits.filter((_, i) => i !== produitIndex),
        });
    }

    return (
        <div className="rounded-md border p-4">
            <div className="mb-3 flex items-center justify-end gap-1">
                <button type="button" onClick={onDuplicate} className="text-primary hover:text-primary/80">
                    <Copy className="size-4" />
                </button>
                <button
                    type="button"
                    onClick={onRemove}
                    disabled={!canRemove}
                    className="text-destructive hover:text-destructive/80 disabled:pointer-events-none disabled:opacity-30"
                >
                    <Trash2 className="size-4" />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-3">
                    <div className="grid gap-2">
                        <Label htmlFor={`${prefix}_libelle`}>
                            {label} <RequiredMark />
                        </Label>
                        <Input
                            id={`${prefix}_libelle`}
                            value={reponse.libelle}
                            onChange={(e) => onChange({ libelle: e.target.value })}
                            placeholder="Saisir la réponse"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor={`${prefix}_rubrique_suivante_id`}>Passer à la section</Label>
                        {/* Une réponse redirige soit vers une section, soit vers une question,
                            jamais les deux : chaque select vide l'autre et se désactive
                            quand l'autre a une valeur. */}
                        <select
                            id={`${prefix}_rubrique_suivante_id`}
                            value={reponse.rubrique_suivante_id}
                            onChange={(e) =>
                                onChange({
                                    rubrique_suivante_id: e.target.value,
                                    question_suivante_id: '',
                                })
                            }
                            disabled={reponse.question_suivante_id !== ''}
                            className="w-full rounded-md border px-3 py-1.5 disabled:opacity-50"
                        >
                            <option value="">Aucune</option>
                            {rubriques.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {r.titre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor={`${prefix}_question_suivante_id`}>Renvoyer vers la question</Label>
                        <select
                            id={`${prefix}_question_suivante_id`}
                            value={reponse.question_suivante_id}
                            onChange={(e) =>
                                onChange({
                                    question_suivante_id: e.target.value,
                                    rubrique_suivante_id: '',
                                })
                            }
                            disabled={reponse.rubrique_suivante_id !== ''}
                            className="w-full rounded-md border px-3 py-1.5 disabled:opacity-50"
                        >
                            <option value="">Aucune</option>
                            {questions.map((q) => (
                                <option key={q.id} value={q.id}>
                                    {q.texte}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <Label>Associer un produit</Label>

                    <div className="grid flex-1 gap-3 rounded-md border p-3">
                        {reponse.produits.length > 0 ? (
                            <ul className="flex flex-wrap gap-2">
                                {reponse.produits.map((produit, produitIndex) => (
                                    <li
                                        key={produitIndex}
                                        className={`flex items-center gap-1.5 rounded-full border py-1 pr-1 pl-3 text-sm ${
                                            produit.produit_ref ? '' : 'border-dashed'
                                        }`}
                                    >
                                        {!produit.produit_ref && <PenLine className="text-muted-foreground size-3.5" />}
                                        {produit.produit_ref
                                            ? `${produit.quantite} × ${produits.find((p) => p.ref === produit.produit_ref)?.nom ?? produit.produit_ref}`
                                            : `${produit.quantite} × ${produit.libelle_libre} (${produit.prix_libre} €)`}
                                        <button
                                            type="button"
                                            onClick={() => removeProduit(produitIndex)}
                                            className="text-muted-foreground hover:text-foreground flex size-5 items-center justify-center rounded-full"
                                        >
                                            <X className="size-3.5" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-1 py-4 text-center">
                                <Package className="text-muted-foreground/50 size-5" />
                                <p className="text-muted-foreground text-sm">Aucun produit associé pour l'instant.</p>
                            </div>
                        )}

                        <div className="flex gap-1">
                            <Tooltip>
                                <TooltipTrigger
                                    type="button"
                                    onClick={() => setModeAjout('catalogue')}
                                    className={`flex size-8 items-center justify-center rounded-md border transition-colors ${
                                        modeAjout === 'catalogue'
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:text-foreground border-transparent'
                                    }`}
                                >
                                    <List className="size-4" />
                                </TooltipTrigger>
                                <TooltipContent>Depuis le catalogue</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger
                                    type="button"
                                    onClick={() => setModeAjout('libre')}
                                    className={`flex size-8 items-center justify-center rounded-md border transition-colors ${
                                        modeAjout === 'libre'
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:text-foreground border-transparent'
                                    }`}
                                >
                                    <PenLine className="size-4" />
                                </TooltipTrigger>
                                <TooltipContent>Produit libre</TooltipContent>
                            </Tooltip>
                        </div>

                        <div className="flex flex-wrap items-end gap-2">
                            {modeAjout === 'catalogue' ? (
                                <div className="grid min-w-0 flex-1 gap-1">
                                    <Label htmlFor={`${prefix}_produit_ref`} className="text-xs">
                                        Référence produit <RequiredMark />
                                    </Label>
                                    <Popover open={produitComboboxOuvert} onOpenChange={setProduitComboboxOuvert}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                id={`${prefix}_produit_ref`}
                                                type="button"
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={produitComboboxOuvert}
                                                className={cn(
                                                    'text-foreground hover:text-foreground w-full min-w-0 justify-between rounded-md border bg-transparent px-3 py-1 font-normal shadow-xs',
                                                    produitComboboxOuvert
                                                        ? 'border-ring ring-ring/50 ring-[3px]'
                                                        : 'border-input hover:bg-transparent',
                                                    !produitSelectionne && 'text-muted-foreground hover:text-muted-foreground',
                                                )}
                                            >
                                                <span className="min-w-0 truncate">
                                                    {produitSelectionne
                                                        ? `${produitSelectionne.nom} (${produitSelectionne.ref})`
                                                        : 'Choisir un produit'}
                                                </span>
                                                <ChevronsUpDown className="text-muted-foreground size-4 shrink-0" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                            <Command>
                                                <CommandInput placeholder="Rechercher par nom ou référence" />
                                                <CommandList>
                                                    <CommandEmpty>Aucun produit ne correspond.</CommandEmpty>
                                                    <CommandGroup>
                                                        {produits.map((produit) => {
                                                            const estSelectionne = produit.ref !== '' && produit.ref === produitRef;

                                                            return (
                                                                <CommandItem
                                                                    key={produit.id}
                                                                    value={`${produit.nom} ${produit.ref}`}
                                                                    onSelect={() => {
                                                                        setProduitRef(estSelectionne ? '' : produit.ref);
                                                                        setProduitComboboxOuvert(false);
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn('size-4', estSelectionne ? 'opacity-100' : 'opacity-0')}
                                                                    />
                                                                    {produit.nom} ({produit.ref})
                                                                </CommandItem>
                                                            );
                                                        })}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            ) : (
                                <>
                                    <div className="grid min-w-0 flex-1 gap-1">
                                        <Label htmlFor={`${prefix}_libelle_libre`} className="text-xs">
                                            Libellé <RequiredMark />
                                        </Label>
                                        <Input
                                            id={`${prefix}_libelle_libre`}
                                            value={libelleLibre}
                                            onChange={(e) => setLibelleLibre(e.target.value)}
                                            placeholder="Ex : Prestation d'étude"
                                        />
                                    </div>

                                    <div className="grid w-24 shrink-0 gap-1">
                                        <Label htmlFor={`${prefix}_prix_libre`} className="text-xs">
                                            Montant (€) <RequiredMark />
                                        </Label>
                                        <Input
                                            id={`${prefix}_prix_libre`}
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            placeholder="0,00"
                                            value={prixLibre}
                                            onChange={(e) => setPrixLibre(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            <div className="grid w-20 shrink-0 gap-1">
                                <Label htmlFor={`${prefix}_quantite`} className="text-xs">
                                    Qté
                                </Label>
                                <Input
                                    id={`${prefix}_quantite`}
                                    type="number"
                                    min={1}
                                    value={quantite}
                                    onChange={(e) => setQuantite(Number(e.target.value))}
                                />
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={modeAjout === 'catalogue' ? !produitRef.trim() : !libelleLibreValide || !prixLibreValide}
                                onClick={modeAjout === 'catalogue' ? addProduitCatalogue : addProduitLibre}
                                className="shrink-0"
                            >
                                Ajouter
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
