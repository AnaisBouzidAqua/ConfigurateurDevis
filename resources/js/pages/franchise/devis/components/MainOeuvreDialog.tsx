import { useForm } from '@inertiajs/react';
import { Info, Pencil } from 'lucide-react';
import { DialogIcon } from '@/components/dialog-icon';
import { RequiredMark } from '@/components/required-mark';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface TauxHoraire {
    id: number;
    libelle: string;
    montant: number;
}

export interface MainOeuvre {
    id: number;
    libelle: string;
    description: string | null;
    heures: { taux_horaire_id: number; libelle: string; nombre_heures: number }[];
    cout: number;
}

interface Props {
    devisId: number;
    open: boolean;
    onClose: () => void;
    tauxHoraires: TauxHoraire[];
    /** Ligne à éditer ; absent (ou null) = création d'une nouvelle ligne. */
    mainOeuvre?: MainOeuvre | null;
}

export function MainOeuvreDialog({ devisId, open, onClose, tauxHoraires, mainOeuvre }: Props) {
    const form = useForm({
        libelle: mainOeuvre?.libelle ?? '',
        description: mainOeuvre?.description ?? '',
        heures: tauxHoraires.map((taux) => ({
            taux_horaire_id: taux.id,
            nombre_heures:
                mainOeuvre?.heures.find((h) => h.taux_horaire_id === taux.id)?.nombre_heures.toString() ?? '',
        })),
    });

    function setNombreHeures(index: number, value: string) {
        const heures = [...form.data.heures];
        heures[index] = { ...heures[index], nombre_heures: value };
        form.setData('heures', heures);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                form.reset();
                onClose();
            },
        };

        if (mainOeuvre) {
            form.put(`/devis/${devisId}/main-oeuvre/${mainOeuvre.id}`, options);
        } else {
            form.post(`/devis/${devisId}/main-oeuvre`, options);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <DialogIcon icon={Pencil} />
                        {mainOeuvre ? 'Modifier main d’œuvre' : 'Ajouter main d’œuvre'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="mo_libelle">
                            Titre <RequiredMark />
                        </Label>
                        <Input
                            id="mo_libelle"
                            value={form.data.libelle}
                            onChange={(e) => form.setData('libelle', e.target.value)}
                            placeholder="Indiquez un titre synthétique"
                        />
                        {form.errors.libelle && <p className="text-sm text-red-600">{form.errors.libelle}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="mo_description">
                            Description <RequiredMark />
                        </Label>
                        <Textarea
                            id="mo_description"
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            rows={3}
                            placeholder="Décrivez la prestation qui s'affichera sur le devis"
                        />
                        {form.errors.description && <p className="text-sm text-red-600">{form.errors.description}</p>}
                    </div>

                    {form.errors.heures && <p className="text-sm text-red-600">{form.errors.heures}</p>}

                    {tauxHoraires.map((taux, index) => (
                        <div key={taux.id} className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor={`mo_heures_${taux.id}`}>
                                    Nombre d'heures {taux.libelle} <RequiredMark />
                                </Label>
                                <Input
                                    id={`mo_heures_${taux.id}`}
                                    type="number"
                                    step="0.5"
                                    min={0}
                                    value={form.data.heures[index]?.nombre_heures ?? ''}
                                    onChange={(e) => setNombreHeures(index, e.target.value)}
                                />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center gap-1.5">
                                    <Label htmlFor={`mo_taux_${taux.id}`} className="text-muted-foreground">
                                        Taux horaire {taux.libelle} (€)
                                    </Label>
                                    <Tooltip>
                                        <TooltipTrigger type="button">
                                            <Info className="text-muted-foreground size-3.5" />
                                        </TooltipTrigger>
                                        <TooltipContent>La valeur est définie dans vos paramètres</TooltipContent>
                                    </Tooltip>
                                </div>
                                <Input id={`mo_taux_${taux.id}`} value={taux.montant} disabled />
                            </div>
                        </div>
                    ))}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {mainOeuvre ? 'Enregistrer' : 'Ajouter'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
