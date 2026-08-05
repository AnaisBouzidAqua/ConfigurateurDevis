import { useForm } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import { DialogIcon } from '@/components/dialog-icon';
import { RequiredMark } from '@/components/required-mark';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ReponseCard, type ReponseData } from './ReponseCard';
import type { Question, Rubrique, Produit } from './RubriquesSection';

interface AjouterQuestionDialogProps {
    rubrique: Rubrique | null;
    onClose: () => void;
    rubriques: Rubrique[];
    questions: Question[];
    produits: Produit[];
}

export function AjouterQuestionDialog({ rubrique, onClose, rubriques, questions, produits }: AjouterQuestionDialogProps) {
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
            questionForm.data.reponses.map((r, i) => (i === index ? { ...r, ...changes } : r)),
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
        // On clone aussi le tableau produits (pas juste le spread de original) :
        // sinon la copie et l'originale partageraient le même tableau, et modifier
        // les produits de l'une modifierait aussi ceux de l'autre.
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

        if (!rubrique) {
            return;
        }

        questionForm.post(`/admin/rubriques/${rubrique.id}/questions`, {
            onSuccess: () => {
                questionForm.reset();
                onClose();
            },
        });
    }

    return (
        <Dialog open={rubrique !== null} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <DialogIcon icon={Pencil} />
                        Ajouter une question
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleQuestionSubmit} className="flex flex-col gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="q_texte">
                            Libellé de la question <RequiredMark />
                        </Label>
                        <Input
                            id="q_texte"
                            value={questionForm.data.texte}
                            onChange={(e) => questionForm.setData('texte', e.target.value)}
                        />
                        {questionForm.errors.texte && (
                            <p className="text-sm text-red-600">{questionForm.errors.texte}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="q_infos_bulle">Infos bulle</Label>
                        <Textarea
                            id="q_infos_bulle"
                            value={questionForm.data.infos_bulle}
                            onChange={(e) => questionForm.setData('infos_bulle', e.target.value)}
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
                            produits={produits}
                            onChange={(changes) => updateReponseAt(index, changes)}
                            onDuplicate={() => duplicateReponse(index)}
                            onRemove={() => removeReponse(index)}
                            canRemove={questionForm.data.reponses.length > 1}
                        />
                    ))}

                    <div className="flex justify-center">
                        <Button type="button" variant="outline" onClick={addReponse}>
                            + Ajouter une réponse
                        </Button>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={questionForm.processing}>
                            Créer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
