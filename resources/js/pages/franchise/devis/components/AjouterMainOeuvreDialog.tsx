import { useForm } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import { DialogIcon } from '@/components/dialog-icon';
import { RequiredMark } from '@/components/required-mark';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
    devisId: number;
    open: boolean;
    onClose: () => void;
}

export function AjouterMainOeuvreDialog({ devisId, open, onClose }: Props) {
    const form = useForm({
        libelle: '',
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
                            Libellé <RequiredMark />
                        </Label>
                        <Input
                            id="mo_libelle"
                            value={form.data.libelle}
                            onChange={(e) => form.setData('libelle', e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="mo_heures_chantier">Nombre d'heures chantier</Label>
                        <Input
                            id="mo_heures_chantier"
                            type="number"
                            step="0.5"
                            min={0}
                            value={form.data.nombre_heures_chantier}
                            onChange={(e) => form.setData('nombre_heures_chantier', e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="mo_heures_mini_pelle">Nombre d'heures mini-pelle</Label>
                        <Input
                            id="mo_heures_mini_pelle"
                            type="number"
                            step="0.5"
                            min={0}
                            value={form.data.nombre_heures_mini_pelle}
                            onChange={(e) => form.setData('nombre_heures_mini_pelle', e.target.value)}
                        />
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
