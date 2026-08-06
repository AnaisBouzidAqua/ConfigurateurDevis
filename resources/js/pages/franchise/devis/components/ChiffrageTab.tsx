import { router } from '@inertiajs/react';
import { Info } from 'lucide-react';
import { useState } from 'react';
import { SectionTitle } from '@/components/section-title';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AjouterMainOeuvreDialog } from './AjouterMainOeuvreDialog';

interface QuestionOption {
    id: number;
    libelle: string;
}

interface Question {
    id: number;
    texte: string;
    infos_bulle: string | null;
    options: QuestionOption[];
}

interface Rubrique {
    id: number;
    titre: string;
    bulle_infos: string | null;
    questions: Question[];
}

interface Scenario {
    id: number;
    nom: string;
    rubriques: Rubrique[];
}

interface DevisReponse {
    question_id: number;
    question_option_id: number;
}

interface MainOeuvre {
    id: number;
    libelle: string;
    nombre_heures_chantier: number;
    nombre_heures_mini_pelle: number;
    cout: number;
}

interface Props {
    devisId: number;
    scenario: Scenario | null;
    reponses: DevisReponse[];
    visibleQuestionIds: number[];
    mainOeuvres: MainOeuvre[];
}

export default function ChiffrageTab({ devisId, scenario, reponses, visibleQuestionIds, mainOeuvres }: Props) {
    const [answers, setAnswers] = useState<Record<number, string>>(
        Object.fromEntries(reponses.map((r) => [r.question_id, String(r.question_option_id)])),
    );
    const [mainOeuvreDialogOpen, setMainOeuvreDialogOpen] = useState(false);

    function setAnswer(questionId: number, optionId: string) {
        setAnswers((prev) => ({ ...prev, [questionId]: optionId }));

        router.post(
            `/devis/${devisId}/reponses`,
            { question_id: questionId, question_option_id: Number(optionId) },
            { preserveState: true, preserveScroll: true },
        );
    }

    const visibleRubriques = (scenario?.rubriques ?? [])
        .map((rubrique) => ({
            ...rubrique,
            questions: rubrique.questions.filter((question) => visibleQuestionIds.includes(question.id)),
        }))
        .filter((rubrique) => rubrique.questions.length > 0);

    if (!scenario) {
        return (
            <p className="text-muted-foreground text-sm">
                Aucun scénario n'est associé à ce devis pour l'instant.
            </p>
        );
    }

    return (
        <div className="grid grid-cols-[200px_1fr] gap-6">
            <nav className="flex flex-col gap-1">
                {visibleRubriques.map((rubrique) => (
                    <a
                        key={rubrique.id}
                        href={`#rubrique-${rubrique.id}`}
                        className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md px-2 py-1.5 text-sm"
                    >
                        {rubrique.titre}
                    </a>
                ))}
            </nav>

            <div className="flex flex-col gap-4">
                {visibleRubriques.map((rubrique) => (
                    <section
                        key={rubrique.id}
                        id={`rubrique-${rubrique.id}`}
                        className="flex flex-col gap-4 rounded-md border p-4"
                    >
                        <div className="flex items-center gap-1.5">
                            <SectionTitle>{rubrique.titre}</SectionTitle>
                            {rubrique.bulle_infos && (
                                <Tooltip>
                                    <TooltipTrigger type="button">
                                        <Info className="text-muted-foreground size-3.5" />
                                    </TooltipTrigger>
                                    <TooltipContent>{rubrique.bulle_infos}</TooltipContent>
                                </Tooltip>
                            )}
                        </div>

                        {rubrique.questions.map((question) => (
                            <div key={question.id} className="grid gap-1.5">
                                <div className="flex items-center gap-1.5">
                                    <Label>{question.texte}</Label>
                                    {question.infos_bulle && (
                                        <Tooltip>
                                            <TooltipTrigger type="button">
                                                <Info className="text-muted-foreground size-3.5" />
                                            </TooltipTrigger>
                                            <TooltipContent>{question.infos_bulle}</TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>

                                <RadioGroup
                                    value={answers[question.id] ?? ''}
                                    onValueChange={(value) => setAnswer(question.id, value)}
                                    className="flex flex-wrap gap-4"
                                >
                                    {question.options.map((option) => (
                                        <div key={option.id} className="flex items-center gap-2">
                                            <RadioGroupItem
                                                value={String(option.id)}
                                                id={`q${question.id}_o${option.id}`}
                                            />
                                            <Label htmlFor={`q${question.id}_o${option.id}`}>{option.libelle}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                        ))}
                    </section>
                ))}

                {mainOeuvres.length > 0 && (
                    <section className="flex flex-col gap-3 rounded-md border p-4">
                        <SectionTitle>Main d'œuvre</SectionTitle>
                        <ul className="flex flex-col gap-2">
                            {mainOeuvres.map((mo) => (
                                <li key={mo.id} className="grid grid-cols-[1fr_auto_auto] items-start gap-x-4 text-sm">
                                    <span className="text-muted-foreground">{mo.libelle}</span>
                                    <span className="text-foreground">{mo.nombre_heures_chantier}h chantier</span>
                                    <span className="text-foreground">{mo.nombre_heures_mini_pelle}h mini-pelle</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <div className="flex justify-center">
                    <Button type="button" onClick={() => setMainOeuvreDialogOpen(true)}>
                        + Ajouter main d'œuvre
                    </Button>
                </div>
            </div>

            <AjouterMainOeuvreDialog
                devisId={devisId}
                open={mainOeuvreDialogOpen}
                onClose={() => setMainOeuvreDialogOpen(false)}
            />
        </div>
    );
}
