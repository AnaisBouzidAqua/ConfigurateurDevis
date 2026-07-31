import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, ChevronDown, Copy, GripVertical, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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

interface QuestionOption {
    id: number;
    libelle: string;
}

interface Question {
    id: number;
    texte: string;
    options: QuestionOption[];
}

interface Condition {
    id: number;
    question: Question;
    question_option: QuestionOption;
}

interface Produit {
    id: number;
    produit_ref: string;
    quantite: number;
}

interface Scenario {
    id: number;
    nom: string;
    conditions: Condition[];
    produits: Produit[];
    rubriques: Rubrique[];
}

interface Rubrique {
    id: number;
    titre: string;
    bulle_infos: string | null;
}


interface Props {
    scenario: Scenario;
    questions: Question[];
}

export default function Show({ scenario, questions }: Props) {
    const conditionForm = useForm({
    question_id: '',
    question_option_id: '',
    });

    const questionChoisie = questions.find((q) => q.id === Number(conditionForm.data.question_id));

    function handleConditionSubmit(e: React.FormEvent) {
        e.preventDefault();
        conditionForm.post(`/admin/scenarios/${scenario.id}/conditions`, {
            onSuccess: () => conditionForm.reset(),
        });
    }

    const produitForm = useForm({
    produit_ref: '',
    quantite: 1,
    });

    function handleProduitSubmit(e: React.FormEvent) {
        e.preventDefault();
        produitForm.post(`/admin/scenarios/${scenario.id}/produits`, {
            onSuccess: () => produitForm.reset(),
        });
    }

   const [rubriqueDialogOpen, setRubriqueDialogOpen] = useState(false);

    const rubriqueForm = useForm({
        titre: '',
        bulle_infos: '',
    });

    function handleRubriqueSubmit(e: React.FormEvent) {
        e.preventDefault();
        rubriqueForm.post(`/admin/scenarios/${scenario.id}/rubriques`, {
            onSuccess: () => {
                rubriqueForm.reset();
                setRubriqueDialogOpen(false);
            },
        });
    }

    const [renameTarget, setRenameTarget] = useState<Rubrique | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Rubrique | null>(null);

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
        router.post(`/admin/rubriques/${rubrique.id}`);
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
        <>
            <Head title={scenario.nom} />

            <div className="flex flex-col gap-6 p-4">
                <h1 className="flex items-center gap-4 text-xl font-semibold">
                    <Link href="/admin/scenarios" className="text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="size-5" />
                    </Link>
                    Scénario {scenario.nom}
                </h1>

                <section>
                    <div className="mb-10 flex items-center justify-end">
                        <Dialog open={rubriqueDialogOpen} onOpenChange={setRubriqueDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="rounded-full">+ Ajouter une section</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader className="mb-2">
                                    <DialogTitle className="flex items-center gap-2">
                                        <span className="flex size-10 items-center justify-center rounded-md border">
                                            <Pencil className="size-5" />
                                        </span>
                                        Ajouter une section
                                    </DialogTitle>
                                </DialogHeader>

                                <form onSubmit={handleRubriqueSubmit} className="flex flex-col gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="titre">Titre</Label>
                                        <Input
                                            id="titre"
                                            value={rubriqueForm.data.titre}
                                            onChange={(e) => rubriqueForm.setData('titre', e.target.value)}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="bulle_infos">Bulle d'infos</Label>
                                        <Input
                                            id="bulle_infos"
                                            value={rubriqueForm.data.bulle_infos}
                                            onChange={(e) => rubriqueForm.setData('bulle_infos', e.target.value)}
                                        />
                                    </div>

                                    <DialogFooter>
                                        <Button type="submit" disabled={rubriqueForm.processing}>
                                            Créer
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {scenario.rubriques.length === 0 ? (
                        <p className="text-muted-foreground">Aucune rubrique pour l'instant.</p>
                    ) : (
                        <ul className="mx-auto flex max-w-4xl flex-col gap-2">
                            {scenario.rubriques.map((rubrique) => (
                                <li
                                    key={rubrique.id}
                                    className="rounded-md border-b"
                                    style={{ backgroundColor: '#F8FAFC', borderColor: '#94A3B8' }}
                                >
                                    <Collapsible>
                                        <div className="flex items-center gap-2 px-4 py-2">
                                            <GripVertical className="text-muted-foreground size-4 cursor-grab" />
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
                                            <Link
                                                href={`/admin/rubriques/${rubrique.id}/questions/create`}
                                                className="text-sm hover:underline"
                                            >
                                                + Ajouter une question
                                            </Link>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </li>
                            ))}
                        </ul>
                    )}

                    <Dialog open={renameTarget !== null} onOpenChange={(open) => !open && setRenameTarget(null)}>
                        <DialogContent>
                            <DialogHeader className="mb-2">
                                <DialogTitle className="flex items-center gap-2">
                                    <span className="flex size-10 items-center justify-center rounded-md border">
                                        <Pencil className="size-5" />
                                    </span>
                                    Renommer la section
                                </DialogTitle>
                            </DialogHeader>

                            <form onSubmit={handleRenameSubmit} className="flex flex-col gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="rename_titre">Titre</Label>
                                    <Input
                                        id="rename_titre"
                                        value={renameForm.data.titre}
                                        onChange={(e) => renameForm.setData('titre', e.target.value)}
                                    />
                                </div>

                                <DialogFooter>
                                    <Button type="submit" disabled={renameForm.processing}>
                                        Enregistrer
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                        <DialogContent>
                            <DialogHeader className="mb-2">
                                <DialogTitle className="flex items-center gap-2">
                                    <span className="bg-destructive/10 text-destructive flex size-10 items-center justify-center rounded-md">
                                        <Trash2 className="size-5" />
                                    </span>
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
                </section>

                <section>
                    <h2 className="mb-2 text-lg font-medium">Conditions</h2>
                    {scenario.conditions.length === 0 ? (
                        <p className="text-muted-foreground">Aucune condition pour l'instant.</p>
                    ) : (
                        <ul className="divide-y rounded-md border">
                            {scenario.conditions.map((condition) => (
                                <li key={condition.id} className="px-4 py-2">
                                    Si <strong>{condition.question.texte}</strong> = {condition.question_option.libelle}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <form onSubmit={handleConditionSubmit} className="flex flex-wrap items-end gap-3">
                    <div className="grid gap-2">
                        <label htmlFor="question_id" className="text-sm font-medium">
                            Question
                        </label>
                        <select
                            id="question_id"
                            value={conditionForm.data.question_id}
                            onChange={(e) =>
                                conditionForm.setData({ question_id: e.target.value, question_option_id: '' })
                            }
                            className="rounded-md border px-3 py-1.5"
                        >
                            <option value="">Choisir une question</option>
                            {questions.map((question) => (
                                <option key={question.id} value={question.id}>
                                    {question.texte}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="question_option_id" className="text-sm font-medium">
                            Réponse attendue
                        </label>
                        <select
                            id="question_option_id"
                            value={conditionForm.data.question_option_id}
                            onChange={(e) => conditionForm.setData('question_option_id', e.target.value)}
                            disabled={!questionChoisie}
                            className="rounded-md border px-3 py-1.5"
                        >
                            <option value="">Choisir une réponse</option>
                            {questionChoisie?.options.map((option) => (
                                <option key={option.id} value={option.id}>
                                    {option.libelle}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" disabled={conditionForm.processing} className="rounded-md border px-4 py-1.5">
                        Ajouter la condition
                    </button>
                </form>

                <section>
                    <h2 className="mb-2 text-lg font-medium">Produits ajoutés</h2>
                    {scenario.produits.length === 0 ? (
                        <p className="text-muted-foreground">Aucun produit pour l'instant.</p>
                    ) : (
                        <ul className="divide-y rounded-md border">
                            {scenario.produits.map((produit) => (
                                <li key={produit.id} className="px-4 py-2">
                                    {produit.quantite} x {produit.produit_ref}
                                </li>
                            ))}
                        </ul>
                    )}

                    <form onSubmit={handleProduitSubmit} className="mt-3 flex flex-wrap items-end gap-3">
                        <div className="grid gap-2">
                            <label htmlFor="produit_ref" className="text-sm font-medium">
                                Référence produit
                            </label>
                            <input
                                id="produit_ref"
                                type="text"
                                value={produitForm.data.produit_ref}
                                onChange={(e) => produitForm.setData('produit_ref', e.target.value)}
                                placeholder="Ex: BAC-5PP"
                                className="rounded-md border px-3 py-1.5"
                            />
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="quantite" className="text-sm font-medium">
                                Quantité
                            </label>
                            <input
                                id="quantite"
                                type="number"
                                min={1}
                                value={produitForm.data.quantite}
                                onChange={(e) => produitForm.setData('quantite', Number(e.target.value))}
                                className="rounded-md border px-3 py-1.5"
                            />
                        </div>

                        <button type="submit" disabled={produitForm.processing} className="rounded-md border px-4 py-1.5">
                            Ajouter le produit
                        </button>
                    </form>

                </section>
            </div>

        </>
    );
}
