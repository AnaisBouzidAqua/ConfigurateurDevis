import { Head, useForm } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Parametre {
    taux_horaire_chantier: number;
    taux_horaire_mini_pelle: number;
}

interface Props {
    parametre: Parametre;
}

export default function Parametres({ parametre }: Props) {
    const { data, setData, put, errors } = useForm({
        taux_horaire_chantier: String(parametre.taux_horaire_chantier),
        taux_horaire_mini_pelle: String(parametre.taux_horaire_mini_pelle),
    });

    function save() {
        put('/parametres', { preserveScroll: true });
    }

    return (
        <>
            <Head title="Paramètres" />

            <div className="flex flex-col gap-4 pt-8 pb-4 pr-6 pl-[52px] md:pr-4 md:pl-[44px]">
                <h1 className="text-foreground text-[16px] font-bold leading-[140%] tracking-normal">
                    Taux horaires de la main d'œuvre
                </h1>

                <div className="grid max-w-md grid-cols-2 gap-4">
                    <div className="grid gap-1.5">
                        <Label htmlFor="taux_horaire_chantier">Taux horaires chantier (€)</Label>
                        <Input
                            id="taux_horaire_chantier"
                            type="number"
                            step="0.01"
                            min={0}
                            value={data.taux_horaire_chantier}
                            onChange={(e) => setData('taux_horaire_chantier', e.target.value)}
                            onBlur={save}
                        />
                        {errors.taux_horaire_chantier && (
                            <p className="text-destructive text-xs">{errors.taux_horaire_chantier}</p>
                        )}
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="taux_horaire_mini_pelle">Taux horaires mini-pelle (€)</Label>
                        <Input
                            id="taux_horaire_mini_pelle"
                            type="number"
                            step="0.01"
                            min={0}
                            value={data.taux_horaire_mini_pelle}
                            onChange={(e) => setData('taux_horaire_mini_pelle', e.target.value)}
                            onBlur={save}
                        />
                        {errors.taux_horaire_mini_pelle && (
                            <p className="text-destructive text-xs">{errors.taux_horaire_mini_pelle}</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

Parametres.layout = () => ({
    breadcrumbs: [{ title: 'Paramètres', href: '/parametres' }],
});
