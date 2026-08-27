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

export interface TauxHoraires {
    chantier: number;
    mini_pelle: number;
}

interface Props {
    devisId: number;
    open: boolean;
    onClose: () => void;
    tauxHoraires: TauxHoraires;
}

export function AjouterMainOeuvreDialog({ devisId, open, onClose, tauxHoraires }: Props) {
    const form = useForm({
        libelle: '',
        description: '',
        nombre_heures_chantier: '',
        nombre_heures_mini_pelle: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post(`/devis/${devisId}/main-oeuvre`, {
            onSuccess: () => {
                form.reset();
                onClose();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <DialogIcon icon={Pencil} />
                        Ajouter main d'œuvre
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

                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="mo_heures_chantier">
                                Nombre d'heures chantier <RequiredMark />
                            </Label>
                            <Input
                                id="mo_heures_chantier"
                                type="number"
                                step="0.5"
                                min={0}
                                value={form.data.nombre_heures_chantier}
                                onChange={(e) => form.setData('nombre_heures_chantier', e.target.value)}
                            />
                            {form.errors.nombre_heures_chantier && (
                                <p className="text-sm text-red-600">{form.errors.nombre_heures_chantier}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center gap-1.5">
                                <Label htmlFor="mo_taux_chantier" className="text-muted-foreground">
                                    Taux horaire chantier (€)
                                </Label>
                                <Tooltip>
                                    <TooltipTrigger type="button">
                                        <Info className="text-muted-foreground size-3.5" />
                                    </TooltipTrigger>
                                    <TooltipContent>La valeur est définie dans vos paramètres</TooltipContent>
                                </Tooltip>
                            </div>
                            <Input id="mo_taux_chantier" value={tauxHoraires.chantier} disabled />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                            <Label htmlFor="mo_heures_mini_pelle">
                                Nombre d'heures mini-pelle <RequiredMark />
                            </Label>
                            <Input
                                id="mo_heures_mini_pelle"
                                type="number"
                                step="0.5"
                                min={0}
                                value={form.data.nombre_heures_mini_pelle}
                                onChange={(e) => form.setData('nombre_heures_mini_pelle', e.target.value)}
                            />
                            {form.errors.nombre_heures_mini_pelle && (
                                <p className="text-sm text-red-600">{form.errors.nombre_heures_mini_pelle}</p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center gap-1.5">
                                <Label htmlFor="mo_taux_mini_pelle" className="text-muted-foreground">
                                    Taux horaire mini-pelle (€)
                                </Label>
                                <Tooltip>
                                    <TooltipTrigger type="button">
                                        <Info className="text-muted-foreground size-3.5" />
                                    </TooltipTrigger>
                                    <TooltipContent>La valeur est définie dans vos paramètres</TooltipContent>
                                </Tooltip>
                            </div>
                            <Input id="mo_taux_mini_pelle" value={tauxHoraires.mini_pelle} disabled />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            Ajouter
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
