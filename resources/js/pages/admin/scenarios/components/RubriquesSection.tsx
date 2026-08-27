import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { router, useForm } from '@inertiajs/react';
import { ChevronDown, Copy, GripVertical, MoreVertical, Pencil, Trash2, Layers } from 'lucide-react';
import { useState } from 'react';
import { DialogIcon } from '@/components/dialog-icon';
import { EmptyState } from '@/components/empty-state';
import { RequiredMark } from '@/components/required-mark';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuIconTrigger,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AjouterQuestionDialog } from './AjouterQuestionDialog';
import { ModifierQuestionDialog } from './ModifierQuestionDialog';

export interface QuestionOptionProduit {
    id: number;
    produit_ref: string | null;
    libelle_libre: string | null;
    prix_libre: number | null;
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
    scenarioId: number;
    rubriques: Rubrique[];
    questions: Question[];
    produits: Produit[];
}

interface SortableQuestionProps {
    question: Question;
    onEdit: (question: Question) => void;
    onDuplicate: (question: Question) => void;
    onDelete: (question: Question) => void;
}

function SortableQuestion({ question, onEdit, onDuplicate, onDelete }: SortableQuestionProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.id });

    return (
        <li
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
            className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
        >
            <div className="flex items-center gap-2">
                <GripVertical
                    className="text-muted-foreground size-4 cursor-grab touch-none"
                    {...attributes}
                    {...listeners}
                />
                <span className="text-muted-foreground">{question.texte}</span>
            </div>
            <DropdownMenu>
                <DropdownMenuIconTrigger>
                    <MoreVertical className="size-4" />
                </DropdownMenuIconTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(question)}>
                        <Pencil /> Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDuplicate(question)}>
                        <Copy /> Dupliquer
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => onDelete(question)}>
                        <Trash2 /> Supprimer
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </li>
    );
}

interface SortableRubriqueProps {
    rubrique: Rubrique;
    onRename: (rubrique: Rubrique) => void;
    onDuplicate: (rubrique: Rubrique) => void;
    onDelete: (rubrique: Rubrique) => void;
    onAddQuestion: (rubrique: Rubrique) => void;
    onEditQuestion: (question: Question) => void;
    onDuplicateQuestion: (question: Question) => void;
    onDeleteQuestion: (question: Question) => void;
    onQuestionsReordered: (rubriqueId: number, questions: Question[]) => void;
}

function SortableRubrique({
    rubrique,
    onRename,
    onDuplicate,
    onDelete,
    onAddQuestion,
    onEditQuestion,
    onDuplicateQuestion,
    onDeleteQuestion,
    onQuestionsReordered,
}: SortableRubriqueProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: rubrique.id });
    const questionSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    function handleQuestionDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = rubrique.questions.findIndex((question) => question.id === active.id);
        const newIndex = rubrique.questions.findIndex((question) => question.id === over.id);
        const reordonnees = arrayMove(rubrique.questions, oldIndex, newIndex);

        onQuestionsReordered(rubrique.id, reordonnees);

        router.put(
            `/admin/rubriques/${rubrique.id}/questions/reorder`,
            { ids: reordonnees.map((question) => question.id) },
            { preserveState: true, preserveScroll: true },
        );
    }

    return (
        <li
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
            className="rounded-md border bg-card"
        >
            <Collapsible>
                <div className="flex items-center gap-2 px-4 py-2">
                    <GripVertical
                        className="text-muted-foreground size-4 cursor-grab touch-none"
                        {...attributes}
                        {...listeners}
                    />
                    <CollapsibleTrigger className="flex flex-1 items-center justify-between text-left [&[data-state=open]_svg]:rotate-180">
                        <span className="font-semibold">{rubrique.titre}</span>
                        <ChevronDown className="size-4 transition-transform" />
                    </CollapsibleTrigger>

                    <DropdownMenu>
                        <DropdownMenuIconTrigger>
                            <MoreVertical className="size-4" />
                        </DropdownMenuIconTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onRename(rubrique)}>
                                <Pencil /> Renommer
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDuplicate(rubrique)}>
                                <Copy /> Dupliquer
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => onDelete(rubrique)}>
                                <Trash2 /> Supprimer
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <CollapsibleContent className="px-4 pb-3 pl-10">
                    {rubrique.questions.length > 0 && (
                        <DndContext
                            sensors={questionSensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleQuestionDragEnd}
                        >
                            <SortableContext
                                items={rubrique.questions.map((question) => question.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <ul className="mb-3 divide-y rounded-md border bg-background">
                                    {rubrique.questions.map((question) => (
                                        <SortableQuestion
                                            key={question.id}
                                            question={question}
                                            onEdit={onEditQuestion}
                                            onDuplicate={onDuplicateQuestion}
                                            onDelete={onDeleteQuestion}
                                        />
                                    ))}
                                </ul>
                            </SortableContext>
                        </DndContext>
                    )}
                    <div className="flex justify-center">
                        <Button type="button" className="rounded-full" onClick={() => onAddQuestion(rubrique)}>
                            + Ajouter une question
                        </Button>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </li>
    );
}

export default function RubriquesSection({ scenarioId, rubriques, questions, produits }: Props) {
    const [editQuestionTarget, setEditQuestionTarget] = useState<Question | null>(null);
    const [deleteQuestionTarget, setDeleteQuestionTarget] = useState<Question | null>(null);

    const [renameTarget, setRenameTarget] = useState<Rubrique | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Rubrique | null>(null);
    const [questionRubrique, setQuestionRubrique] = useState<Rubrique | null>(null);

    const [rubriquesLocal, setRubriquesLocal] = useState(rubriques);
    const [rubriquesPropPrecedent, setRubriquesPropPrecedent] = useState(rubriques);
    const rubriqueSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    // Resynchronise la copie locale (utilisée pour le drag-and-drop) quand la
    // prop change pour une autre raison qu'un reorder (ajout/suppression/
    // renommage) — pattern "adjusting state during render" plutôt qu'un
    // useEffect, pour éviter un rendu en cascade.
    if (rubriques !== rubriquesPropPrecedent) {
        setRubriquesPropPrecedent(rubriques);
        setRubriquesLocal(rubriques);
    }

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

    function handleQuestionsReordered(rubriqueId: number, questionsReordonnees: Question[]) {
        setRubriquesLocal((prev) =>
            prev.map((rubrique) =>
                rubrique.id === rubriqueId ? { ...rubrique, questions: questionsReordonnees } : rubrique,
            ),
        );
    }

    function handleRubriqueDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = rubriquesLocal.findIndex((rubrique) => rubrique.id === active.id);
        const newIndex = rubriquesLocal.findIndex((rubrique) => rubrique.id === over.id);
        const reordonnees = arrayMove(rubriquesLocal, oldIndex, newIndex);

        setRubriquesLocal(reordonnees);

        router.put(
            `/admin/scenarios/${scenarioId}/rubriques/reorder`,
            { ids: reordonnees.map((rubrique) => rubrique.id) },
            { preserveState: true, preserveScroll: true },
        );
    }

    return (
        <section>
            {rubriquesLocal.length === 0 ? (
                <EmptyState
                    icon={Layers}
                    title="Aucune section pour l'instant."
                    description="Clique sur « + Ajouter une section » pour commencer."
                />
            ) : (
                <DndContext
                    sensors={rubriqueSensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleRubriqueDragEnd}
                >
                    <SortableContext
                        items={rubriquesLocal.map((rubrique) => rubrique.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <ul className="mx-auto flex max-w-4xl flex-col gap-2">
                            {rubriquesLocal.map((rubrique) => (
                                <SortableRubrique
                                    key={rubrique.id}
                                    rubrique={rubrique}
                                    onRename={openRename}
                                    onDuplicate={handleDuplicate}
                                    onDelete={setDeleteTarget}
                                    onAddQuestion={setQuestionRubrique}
                                    onEditQuestion={setEditQuestionTarget}
                                    onDuplicateQuestion={handleDuplicateQuestion}
                                    onDeleteQuestion={setDeleteQuestionTarget}
                                    onQuestionsReordered={handleQuestionsReordered}
                                />
                            ))}
                        </ul>
                    </SortableContext>
                </DndContext>
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
                rubriques={rubriquesLocal}
                questions={questions}
                produits={produits}
            />
            {editQuestionTarget && (
                <ModifierQuestionDialog
                    key={editQuestionTarget.id}
                    question={editQuestionTarget}
                    onClose={() => setEditQuestionTarget(null)}
                    rubriques={rubriquesLocal}
                    questions={questions}
                    produits={produits}
                />
            )}

        </section>
    );
}
