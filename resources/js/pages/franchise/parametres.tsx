import { Head, router, useForm } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useState } from 'react';
import { RequiredMark } from '@/components/required-mark';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TauxHoraire {
    id: number;
    libelle: string;
    montant: number;
}

interface Props {
    tauxHoraires: TauxHoraire[];
}

function TauxHoraireRow({ tauxHoraire }: { tauxHoraire: TauxHoraire }) {
    const [montant, setMontant] = useState(String(tauxHoraire.montant));

    function save() {
        router.put(`/parametres/taux-horaires/${tauxHoraire.id}`, { montant }, { preserveScroll: true });
    }

    function supprimer() {
        router.delete(`/parametres/taux-horaires/${tauxHoraire.id}`, { preserveScroll: true });
    }

    return (
        <div className="grid w-52 gap-1.5">
            <Label htmlFor={`taux_${tauxHoraire.id}`}>{tauxHoraire.libelle} (€)</Label>
            <div className="flex items-center">
                <Input
                    id={`taux_${tauxHoraire.id}`}
                    type="number"
                    step="0.01"
                    min={0}
                    value={montant}
                    onChange={(e) => setMontant(e.target.value)}
                    onBlur={save}
                />
                <button
                    type="button"
                    onClick={supprimer}
                    className="text-muted-foreground hover:text-destructive flex size-9 shrink-0 items-center justify-center rounded-md"
                    aria-label={`Supprimer le taux horaire ${tauxHoraire.libelle}`}
                >
                    <X className="size-4" />
                </button>
            </div>
        </div>
    );
}

function AjouterTauxHoraireDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
    const form = useForm({ libelle: '', montant: '' });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/parametres/taux-horaires', {
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
                    <DialogTitle>Ajouter un taux horaire</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="taux_libelle">
                            Libellé <RequiredMark />
                        </Label>
                        <Input
                            id="taux_libelle"
                            value={form.data.libelle}
                            onChange={(e) => form.setData('libelle', e.target.value)}
                            placeholder="Ex : Grue"
                        />
                        {form.errors.libelle && <p className="text-sm text-red-600">{form.errors.libelle}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="taux_montant">
                            Montant (€) <RequiredMark />
                        </Label>
                        <Input
                            id="taux_montant"
                            type="number"
                            step="0.01"
                            min={0}
                            value={form.data.montant}
                            onChange={(e) => form.setData('montant', e.target.value)}
                        />
                        {form.errors.montant && <p className="text-sm text-red-600">{form.errors.montant}</p>}
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

export default function Parametres({ tauxHoraires }: Props) {
    const [dialogOuvert, setDialogOuvert] = useState(false);

    return (
        <>
            <Head title="Paramètres" />

            <div className="flex flex-col gap-4 pt-8 pb-4 pr-6 pl-[52px] md:pr-4 md:pl-[44px]">
                <div className="flex items-center justify-between">
                    <h1 className="text-foreground text-[16px] font-bold leading-[140%] tracking-normal">
                        Taux horaires de la main d'œuvre
                    </h1>
                    <Button type="button" onClick={() => setDialogOuvert(true)}>
                        + Ajouter un taux horaire
                    </Button>
                </div>

                <div className="flex flex-wrap gap-4">
                    {tauxHoraires.map((tauxHoraire) => (
                        <TauxHoraireRow key={tauxHoraire.id} tauxHoraire={tauxHoraire} />
                    ))}
                </div>
            </div>

            <AjouterTauxHoraireDialog open={dialogOuvert} onClose={() => setDialogOuvert(false)} />
        </>
    );
}

Parametres.layout = () => ({
    breadcrumbs: [{ title: 'Paramètres', href: '/parametres' }],
});
