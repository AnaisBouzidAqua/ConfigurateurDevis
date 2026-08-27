import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';
import { useState } from 'react';
import { DialogIcon } from '@/components/dialog-icon';
import { RequiredMark } from '@/components/required-mark';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RubriquesSection from './components/RubriquesSection';
import type { Produit, Question, Rubrique } from './components/RubriquesSection';

interface Scenario {
    id: number;
    nom: string;
    famille: string;
    rubriques: Rubrique[];
}

interface Props {
    scenario: Scenario;
    questions: Question[];
    produits: Produit[];
}

export default function Show({ scenario, questions, produits }: Props) {
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

    return (
        <>
            <Head title={scenario.nom} />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/scenarios"
                            className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="size-5" />
                        </Link>
                        <div>
                            <p className="text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
                                {scenario.famille}
                            </p>
                            <h1 className="text-xl font-bold">
                                Scénario {scenario.nom}
                            </h1>
                        </div>
                    </div>

                    <Dialog
                        open={rubriqueDialogOpen}
                        onOpenChange={setRubriqueDialogOpen}
                    >
                        <DialogTrigger asChild>
                            <Button className="rounded-full">
                                + Ajouter une section
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <DialogIcon icon={Pencil} />
                                    Ajouter une section
                                </DialogTitle>
                            </DialogHeader>

                            <form
                                onSubmit={handleRubriqueSubmit}
                                className="flex flex-col gap-4"
                            >
                                <div className="grid gap-2">
                                    <Label htmlFor="titre">
                                        Titre <RequiredMark />
                                    </Label>
                                    <Input
                                        id="titre"
                                        value={rubriqueForm.data.titre}
                                        onChange={(e) =>
                                            rubriqueForm.setData(
                                                'titre',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="bulle_infos">
                                        Bulle d'infos
                                    </Label>
                                    <Input
                                        id="bulle_infos"
                                        value={rubriqueForm.data.bulle_infos}
                                        onChange={(e) =>
                                            rubriqueForm.setData(
                                                'bulle_infos',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setRubriqueDialogOpen(false)
                                        }
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={rubriqueForm.processing}
                                    >
                                        Créer
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <RubriquesSection
                    scenarioId={scenario.id}
                    rubriques={scenario.rubriques}
                    questions={questions}
                    produits={produits}
                />
            </div>
        </>
    );
}

Show.layout = (props: Props) => ({
    breadcrumbs: [
        { title: 'Scénarios', href: '/admin/scenarios' },
        {
            title: props.scenario.nom,
            href: `/admin/scenarios/${props.scenario.id}`,
        },
    ],
});
