import { router, useForm } from '@inertiajs/react';
import {
    ChevronDown,
    Copy,
    GripVertical,
    MoreVertical,
    Package,
    Pencil,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { DialogIcon } from '@/components/dialog-icon';
import { RequiredMark } from '@/components/required-mark';
import { Button } from '@/components/ui/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export interface QuestionOption {
    id: number;
    libelle: string;
}

export interface Question {
    id: number;
    texte: string;
    options: QuestionOption[];
}

export interface Rubrique {
    id: number;
    titre: string;
    bulle_infos: string | null;
    questions: Question[];
}

interface Props {
    rubriques: Rubrique[];
    questions: Question[];
}

interface ReponseData {
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
    onChange: (changes: Partial<ReponseData>) => void;
    onDuplicate: () => void;
    onRemove: () => void;
    canRemove: boolean;
}

function ReponseCard({
    index,
    reponse,
    rubriques,
    questions,
    onChange,
    onDuplicate,
    onRemove,
    canRemove,
}: ReponseCardProps) {
    const label = `Réponse ${String.fromCharCode(65 + index)}`;
    const prefix = `q_${index}`;

    const [produitRef, setProduitRef] = useState('');
    const [quantite, setQuantite] = useState(1);

    function addProduit() {
        if (!produitRef.trim()) {
            return;
        }

        onChange({
            produits: [
                ...reponse.produits,
                { produit_ref: produitRef.trim(), quantite },
            ],
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
                <button
                    type="button"
                    onClick={onDuplicate}
                    className="text-primary hover:text-primary/80"
                >
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
                            onChange={(e) =>
                                onChange({ libelle: e.target.value })
                            }
                            placeholder="Saisir la réponse"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor={`${prefix}_rubrique_suivante_id`}>
                            Passer à la section
                        </Label>
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
                            className="rounded-md border px-3 py-1.5 disabled:opacity-50"
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
                        <Label htmlFor={`${prefix}_question_suivante_id`}>
                            Renvoyer vers la question
                        </Label>
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
                            className="rounded-md border px-3 py-1.5 disabled:opacity-50"
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
                                {reponse.produits.map(
                                    (produit, produitIndex) => (
                                        <li
                                            key={produitIndex}
                                            className="flex items-center gap-1 rounded-full border py-1 pr-1 pl-3 text-sm"
                                        >
                                            {produit.quantite} ×{' '}
                                            {produit.produit_ref}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeProduit(produitIndex)
                                                }
                                                className="flex size-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                                            >
                                                <X className="size-3.5" />
                                            </button>
                                        </li>
                                    ),
                                )}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-1 py-4 text-center">
                                <Package className="size-5 text-muted-foreground/50" />
                                <p className="text-sm text-muted-foreground">
                                    Aucun produit associé pour l'instant.
                                </p>
                            </div>
                        )}

                        <div className="flex items-end gap-2">
                            <div className="grid min-w-0 flex-1 gap-1">
                                <Label
                                    htmlFor={`${prefix}_produit_ref`}
                                    className="text-xs"
                                >
                                    Référence produit
                                </Label>
                                <Input
                                    id={`${prefix}_produit_ref`}
                                    value={produitRef}
                                    onChange={(e) =>
                                        setProduitRef(e.target.value)
                                    }
                                    placeholder="Ex: BAC-5PP"
                                />
                            </div>
                            <div className="grid w-20 shrink-0 gap-1">
                                <Label
                                    htmlFor={`${prefix}_quantite`}
                                    className="text-xs"
                                >
                                    Qté
                                </Label>
                                <Input
                                    id={`${prefix}_quantite`}
                                    type="number"
                                    min={1}
                                    value={quantite}
                                    onChange={(e) =>
                                        setQuantite(Number(e.target.value))
                                    }
                                />
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addProduit}
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

export default function RubriquesSection({ rubriques, questions }: Props) {
    const [renameTarget, setRenameTarget] = useState<Rubrique | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Rubrique | null>(null);
    const [questionRubrique, setQuestionRubrique] = useState<Rubrique | null>(
        null,
    );

    const questionForm = useForm({
        texte: '',
        infos_bulle: '',
        reponses: [
            {
                libelle: '',
                rubrique_suivante_id: '',
                question_suivante_id: '',
                produits: [] as { produit_ref: string; quantite: number }[],
            },
        ],
    });

    function updateReponseAt(index: number, changes: Partial<ReponseData>) {
        questionForm.setData(
            'reponses',
            questionForm.data.reponses.map((r, i) =>
                i === index ? { ...r, ...changes } : r,
            ),
        );
    }

    function addReponse() {
        questionForm.setData('reponses', [
            ...questionForm.data.reponses,
            {
                libelle: '',
                rubrique_suivante_id: '',
                question_suivante_id: '',
                produits: [],
            },
        ]);
    }

    function duplicateReponse(index: number) {
        const original = questionForm.data.reponses[index];
        const copy = { ...original, produits: [...original.produits] };
        const next = [...questionForm.data.reponses];
        next.splice(index + 1, 0, copy);
        questionForm.setData('reponses', next);
    }

    function removeReponse(index: number) {
        questionForm.setData(
            'reponses',
            questionForm.data.reponses.filter((_, i) => i !== index),
        );
    }

    function handleQuestionSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!questionRubrique) {
            return;
        }

        questionForm.post(`/admin/rubriques/${questionRubrique.id}/questions`, {
            onSuccess: () => {
                questionForm.reset();
                setQuestionRubrique(null);
            },
        });
    }

    const renameForm = useForm({ titre: '' });

    function openRename(rubrique: Rubrique) {
        renameForm.setData('titre', rubrique.titre);
        setRenameTarget(rubrique);
    }

    function handleRenameSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!renameTarget) {
            return;
        }

        renameForm.put(`/admin/rubriques/${renameTarget.id}`, {
            onSuccess: () => setRenameTarget(null),
        });
    }

    function handleDuplicate(rubrique: Rubrique) {
        router.post(`/admin/rubriques/${rubrique.id}/duplicate`);
    }

    function handleDelete() {
        if (!deleteTarget) {
            return;
        }

        router.delete(`/admin/rubriques/${deleteTarget.id}`, {
            onSuccess: () => setDeleteTarget(null),
        });
    }

    return (
        <section>
            {rubriques.length === 0 ? (
                <p className="text-muted-foreground">
                    Aucune rubrique pour l'instant.
                </p>
            ) : (
                <ul className="mx-auto flex max-w-4xl flex-col gap-2">
                    {rubriques.map((rubrique) => (
                        <li
                            key={rubrique.id}
                            className="rounded-md border bg-card"
                        >
                            <Collapsible>
                                <div className="flex items-center gap-2 px-4 py-2">
                                    <GripVertical className="size-4 cursor-grab text-muted-foreground" />
                                    <CollapsibleTrigger className="flex flex-1 items-center justify-between text-left [&[data-state=open]_svg]:rotate-180">
                                        <span className="font-semibold">
                                            {rubrique.titre}
                                        </span>
                                        <ChevronDown className="size-4 transition-transform" />
                                    </CollapsibleTrigger>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground">
                                            <MoreVertical className="size-4" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    openRename(rubrique)
                                                }
                                            >
                                                <Pencil /> Renommer
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleDuplicate(rubrique)
                                                }
                                            >
                                                <Copy /> Dupliquer
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                variant="destructive"
                                                onClick={() =>
                                                    setDeleteTarget(rubrique)
                                                }
                                            >
                                                <Trash2 /> Supprimer
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <CollapsibleContent className="px-4 pb-3 pl-10">
                                    {rubrique.questions.length > 0 && (
                                        <ul className="mb-3 divide-y rounded-md border bg-background">
                                            {rubrique.questions.map(
                                                (question) => (
                                                    <li
                                                        key={question.id}
                                                        className="px-3 py-2 text-sm"
                                                    >
                                                        {question.texte}
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    )}
                                    <div className="flex justify-center">
                                        <Button
                                            type="button"
                                            className="rounded-full"
                                            onClick={() =>
                                                setQuestionRubrique(rubrique)
                                            }
                                        >
                                            + Ajouter une question
                                        </Button>
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        </li>
                    ))}
                </ul>
            )}

            <Dialog
                open={renameTarget !== null}
                onOpenChange={(open) => !open && setRenameTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <DialogIcon icon={Pencil} />
                            Renommer la section
                        </DialogTitle>
                    </DialogHeader>

                    <form
                        onSubmit={handleRenameSubmit}
                        className="flex flex-col gap-4"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="rename_titre">
                                Titre <RequiredMark />
                            </Label>
                            <Input
                                id="rename_titre"
                                value={renameForm.data.titre}
                                onChange={(e) =>
                                    renameForm.setData('titre', e.target.value)
                                }
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setRenameTarget(null)}>
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={renameForm.processing}
                            >
                                Enregistrer
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={deleteTarget !== null}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <DialogIcon icon={Trash2} variant="destructive" />
                            Supprimer la section
                        </DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer la section «{' '}
                            {deleteTarget?.titre} » ?
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteTarget(null)}
                        >
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={questionRubrique !== null}
                onOpenChange={(open) => !open && setQuestionRubrique(null)}
            >
                <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <DialogIcon icon={Pencil} />
                            Ajouter une question
                        </DialogTitle>
                    </DialogHeader>

                    <form
                        onSubmit={handleQuestionSubmit}
                        className="flex flex-col gap-4"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="q_texte">
                                Libellé de la question <RequiredMark />
                            </Label>
                            <Input
                                id="q_texte"
                                value={questionForm.data.texte}
                                onChange={(e) =>
                                    questionForm.setData(
                                        'texte',
                                        e.target.value,
                                    )
                                }
                            />
                            {questionForm.errors.texte && (
                                <p className="text-sm text-red-600">
                                    {questionForm.errors.texte}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="q_infos_bulle">Infos bulle</Label>
                            <Textarea
                                id="q_infos_bulle"
                                value={questionForm.data.infos_bulle}
                                onChange={(e) =>
                                    questionForm.setData(
                                        'infos_bulle',
                                        e.target.value,
                                    )
                                }
                                rows={3}
                            />
                        </div>

                        {questionForm.data.reponses.map((reponse, index) => (
                            <ReponseCard
                                key={index}
                                index={index}
                                reponse={reponse}
                                rubriques={rubriques}
                                questions={questions}
                                onChange={(changes) =>
                                    updateReponseAt(index, changes)
                                }
                                onDuplicate={() => duplicateReponse(index)}
                                onRemove={() => removeReponse(index)}
                                canRemove={
                                    questionForm.data.reponses.length > 1
                                }
                            />
                        ))}

                        <div className="flex justify-center">
                            <Button type="button" variant="outline" onClick={addReponse}>
                                + Ajouter une réponse
                            </Button>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setQuestionRubrique(null)}>
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={questionForm.processing}
                            >
                                Créer
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </section>
    );
}
