import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import DossierFields from './components/DossierFields';

interface Scenario {
    id: number;
    famille: string;
    nom: string;
}

interface Props {
    scenarios: Scenario[];
}

export default function Create({ scenarios }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        scenario_id: '',
        client_nom: '',
        dispositif: '',
        nombre_batiments: '',
        capacite_eh: '',
        nombre_chambres: '',
        type_effluents: '',
        installateur: '',
        type_installateur: '',
        installateur_agree_nom: '',
        type_realisation: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/devis');
    }

    return (
        <>
            <Head title="Nouveau chiffrage" />

            <div className="flex flex-col gap-4 pt-8 pb-4 pr-6 pl-[52px] md:pr-4 md:pl-[44px]">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex gap-6 border-b border-border">
                            <span className="border-b-2 border-primary pb-2 text-sm font-medium text-primary">
                                Dossier
                            </span>
                            <span className="cursor-not-allowed pb-2 text-sm text-muted-foreground">Chiffrage</span>
                        </div>

                        <Button
                            type="submit"
                            form="devis-create-form"
                            disabled={processing}
                        >
                            Suivant
                        </Button>
                    </div>

                    <form id="devis-create-form" onSubmit={handleSubmit}>
                        <DossierFields
                            data={data}
                            onChange={(field, value) => setData(field, value)}
                            errors={errors}
                            dispositifExtra={
                                <div className="grid gap-1.5">
                                    <label htmlFor="scenario_id" className="text-label text-sm font-medium">
                                        Scénario (temporaire, en attendant AquaConnect)
                                    </label>
                                    {scenarios.length === 0 ? (
                                        <p className="text-muted-foreground text-sm">Aucun chiffrage paramétré.</p>
                                    ) : (
                                        <select
                                            id="scenario_id"
                                            value={data.scenario_id}
                                            onChange={(e) => setData('scenario_id', e.target.value)}
                                            className="rounded-md border px-3 py-1.5 text-sm"
                                        >
                                            <option value="">Aucun</option>
                                            {scenarios.map((scenario) => (
                                                <option key={scenario.id} value={scenario.id}>
                                                    {scenario.famille} — {scenario.nom}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            }

                        />
                    </form>
                </div>
            </div>
        </>
    );
}

Create.layout = () => ({
    breadcrumbs: [{ title: 'Nouveau chiffrage', href: '/devis/create' }],
});
