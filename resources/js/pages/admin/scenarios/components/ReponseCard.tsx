import { Copy, Package, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { RequiredMark } from '@/components/required-mark';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Produit, Question, Rubrique } from './RubriquesSection';

export interface ReponseData {
    libelle: string;
    rubrique_suivante_id: string;
    question_suivante_id: string;
    produits: { produit_ref: string; quantite: number }[];
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

    const [produitRef, setProduitRef] = useState('');
    const [quantite, setQuantite] = useState(1);

    function addProduit() {
        if (!produitRef.trim()) {
            return;
        }

        onChange({
            produits: [...reponse.produits, { produit_ref: produitRef.trim(), quantite }],
        });
        setProduitRef('');
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

                    <div className="grid flex-1 gap-2 rounded-md border p-3">
                        {reponse.produits.length > 0 ? (
                            <ul className="flex flex-wrap gap-2">
                                {reponse.produits.map((produit, produitIndex) => (
                                    <li
                                        key={produitIndex}
                                        className="flex items-center gap-1 rounded-full border py-1 pr-1 pl-3 text-sm"
                                    >
                                        {produit.quantite} × {produits.find((p) => p.ref === produit.produit_ref)?.nom ?? produit.produit_ref}
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

                        <div className="flex items-end gap-2">
                            <div className="grid min-w-0 flex-1 gap-1">
                                <Label htmlFor={`${prefix}_produit_ref`} className="text-xs">
                                    Référence produit
                                </Label>
                                <select
                                    id={`${prefix}_produit_ref`}
                                    value={produitRef}
                                    onChange={(e) => setProduitRef(e.target.value)}
                                    className="w-full rounded-md border px-3 py-1.5 text-sm"
                                >
                                    <option value="">Choisir un produit</option>
                                    {produits.map((produit) => (
                                        <option key={produit.id} value={produit.ref}>
                                            {produit.nom} ({produit.ref})
                                        </option>
                                    ))}
                                </select>
                            </div>

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
                            <Button type="button" variant="outline" onClick={addProduit}>
                                Ajouter
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
