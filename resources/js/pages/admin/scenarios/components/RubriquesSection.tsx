import { router, useForm } from '@inertiajs/react';
import { ChevronDown, Copy, GripVertical, MoreVertical, Pencil, Trash2, Layers } from 'lucide-react';
import { useState } from 'react';
import { DialogIcon } from '@/components/dialog-icon';
import { RequiredMark } from '@/components/required-mark';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { AjouterQuestionDialog } from './AjouterQuestionDialog';
import { ModifierQuestionDialog } from './ModifierQuestionDialog';

export interface QuestionOptionProduit {
    id: number;
    produit_ref: string;
    quantite: number;
}

export interface QuestionOption {
    id: number;
    libelle: string;
    rubrique_suivante_id: number | null;
    question_suivante_id: number | null;
    produits: QuestionOptionProduit[];
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

export interface Produit {
    id: number;
    ref: string;
    nom: string;
    prix: number;
}

interface Props {
    rubriques: Rubrique[];
    questions: Question[];
    produits: Produit[];
}

export default function RubriquesSection({ rubriques, questions, produits }: Props) {
    const [editQuestionTarget, setEditQuestionTarget] = useState<Question | null>(null);
    const [deleteQuestionTarget, setDeleteQuestionTarget] = useState<Question | null>(null);

    const [renameTarget, setRenameTarget] = useState<Rubrique | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Rubrique | null>(null);
    const [questionRubrique, setQuestionRubrique] = useState<Rubrique | null>(null);

    const renameForm = useForm({ titre: '', bulle_infos: '' });

    function openRename(rubrique: Rubrique) {
        renameForm.setData({
            titre: rubrique.titre,
            bulle_infos: rubrique.bulle_infos ?? '',
        });
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
        // Le backend copie aussi les questions/réponses/produits de la rubrique
        // (voir RubriqueController::duplicate), pas juste son titre.
        router.post(`/admin/rubriques/${rubrique.id}/duplicate`);
    }

    function handleDuplicateQuestion(question: Question) {
        router.post(`/admin/questions/${question.id}/duplicate`);
    }

    function handleDeleteQuestion() {
        if (!deleteQuestionTarget) {
            return;
        }

        router.delete(`/admin/questions/${deleteQuestionTarget.id}`, {
            onSuccess: () => setDeleteQuestionTarget(null),
        });
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
                <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-2 rounded-md border border-dashed py-16 text-center">
                    <Layers className="text-muted-foreground/50 size-8" />
                    <p className="text-muted-foreground text-sm">Aucune section pour l'instant.</p>
                    <p className="text-muted-foreground text-xs">Clique sur « + Ajouter une section » pour commencer.</p>
                </div>
            ) : (
                <ul className="mx-auto flex max-w-4xl flex-col gap-2">
                    {rubriques.map((rubrique) => (
                        <li key={rubrique.id} className="rounded-md border bg-card">
                            <Collapsible>
                                <div className="flex items-center gap-2 px-4 py-2">
                                    <GripVertical className="size-4 cursor-grab text-muted-foreground" />
                                    <CollapsibleTrigger className="flex flex-1 items-center justify-between text-left [&[data-state=open]_svg]:rotate-180">
                                        <span className="font-semibold">{rubrique.titre}</span>
                                        <ChevronDown className="size-4 transition-transform" />
                                    </CollapsibleTrigger>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground">
                                            <MoreVertical className="size-4" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => openRename(rubrique)}>
                                                <Pencil /> Renommer
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDuplicate(rubrique)}>
                                                <Copy /> Dupliquer
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                variant="destructive"
                                                onClick={() => setDeleteTarget(rubrique)}
                                            >
                                                <Trash2 /> Supprimer
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <CollapsibleContent className="px-4 pb-3 pl-10">
                                    {rubrique.questions.length > 0 && (
                                        <ul className="mb-3 divide-y rounded-md border bg-background">
                                            {rubrique.questions.map((question) => (
                                                <li
                                                    key={question.id}
                                                    className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
                                                >
                                                    <span className="text-muted-foreground">{question.texte}</span>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground">
                                                            <MoreVertical className="size-4" />
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() => setEditQuestionTarget(question)}
                                                            >
                                                                <Pencil /> Modifier
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDuplicateQuestion(question)}
                                                            >
                                                                <Copy /> Dupliquer
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                variant="destructive"
                                                                onClick={() => setDeleteQuestionTarget(question)}
                                                            >
                                                                <Trash2 /> Supprimer
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    <div className="flex justify-center">
                                        <Button
                                            type="button"
                                            className="rounded-full"
                                            onClick={() => setQuestionRubrique(rubrique)}
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

            <Dialog open={renameTarget !== null} onOpenChange={(open) => !open && setRenameTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <DialogIcon icon={Pencil} />
                            Renommer la section
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleRenameSubmit} className="flex flex-col gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="rename_titre">
                                Titre <RequiredMark />
                            </Label>
                            <Input
                                id="rename_titre"
                                value={renameForm.data.titre}
                                onChange={(e) => renameForm.setData('titre', e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="rename_bulle_infos">Bulle d'infos</Label>
                            <Textarea
                                id="rename_bulle_infos"
                                value={renameForm.data.bulle_infos}
                                onChange={(e) => renameForm.setData('bulle_infos', e.target.value)}
                                rows={3}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setRenameTarget(null)}>
                                Annuler
                            </Button>
                            <Button type="submit" disabled={renameForm.processing}>
                                Enregistrer
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <DialogIcon icon={Trash2} variant="destructive" />
                            Supprimer la section
                        </DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer la section « {deleteTarget?.titre} » ?
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={deleteQuestionTarget !== null}
                onOpenChange={(open) => !open && setDeleteQuestionTarget(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <DialogIcon icon={Trash2} variant="destructive" />
                            Supprimer la question
                        </DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer la question « {deleteQuestionTarget?.texte} » ?
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteQuestionTarget(null)}>
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteQuestion}>
                            Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AjouterQuestionDialog
                rubrique={questionRubrique}
                onClose={() => setQuestionRubrique(null)}
                rubriques={rubriques}
                questions={questions}
                produits={produits}
            />
            {editQuestionTarget && (
                <ModifierQuestionDialog
                    key={editQuestionTarget.id}
                    question={editQuestionTarget}
                    onClose={() => setEditQuestionTarget(null)}
                    rubriques={rubriques}
                    questions={questions}
                    produits={produits}
                />
            )}

        </section>
    );
}
