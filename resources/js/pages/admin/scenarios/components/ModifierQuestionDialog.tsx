import { useForm } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import { DialogIcon } from '@/components/dialog-icon';
import { RequiredMark } from '@/components/required-mark';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ReponseCard  } from './ReponseCard';
import type {ReponseData} from './ReponseCard';
import type { Question, Rubrique, Produit } from './RubriquesSection';

interface ModifierQuestionDialogProps {
    question: Question;
    onClose: () => void;
    rubriques: Rubrique[];
    questions: Question[];
    produits: Produit[];

}

export function ModifierQuestionDialog({ question, onClose, rubriques, questions, produits }: ModifierQuestionDialogProps) {
    const questionForm = useForm({
        texte: question.texte,
        infos_bulle: question.infos_bulle ?? '',
        reponses: question.options.map((option) => ({
            libelle: option.libelle,
            rubrique_suivante_id: option.rubrique_suivante_id?.toString() ?? '',
            question_suivante_id: option.question_suivante_id?.toString() ?? '',
            produits: option.produits.map((produit) => ({
                produit_ref: produit.produit_ref,
                quantite: produit.quantite,
            })),
        })),
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

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        questionForm.put(`/admin/questions/${question.id}`, {
            onSuccess: onClose,
        });
    }

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <DialogIcon icon={Pencil} />
                        Modifier la question
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="edit_q_texte">
                            Libellé de la question <RequiredMark />
                        </Label>
                        <Input
                            id="edit_q_texte"
                            value={questionForm.data.texte}
                            onChange={(e) => questionForm.setData('texte', e.target.value)}
                        />
                        {questionForm.errors.texte && (
                            <p className="text-sm text-red-600">{questionForm.errors.texte}</p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit_q_infos_bulle">Infos bulle</Label>
                        <Textarea
                            id="edit_q_infos_bulle"
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
                            Enregistrer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
