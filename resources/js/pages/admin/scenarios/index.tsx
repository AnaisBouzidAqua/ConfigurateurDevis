import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Scenario {
    id: number;
    nom: string;
}

interface Props {
    scenarios: Scenario[];
}

export default function Index({ scenarios }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        nom: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/admin/scenarios', {
            onSuccess: () => reset(),
        });
    }

    return (
        <>
            <Head title="Scénarios" />

            <div className="flex flex-col gap-6 p-4">
                <h1 className="text-2xl font-semibold">Scénarios</h1>

                {scenarios.length === 0 ? (
                    <p className="text-muted-foreground">Aucun scénario pour l'instant.</p>
                ) : (
                    <ul className="divide-y rounded-md border">
                        {scenarios.map((scenario) => (
                            <li key={scenario.id} className="px-4 py-2">
                                {scenario.nom}
                            </li>
                        ))}
                    </ul>
                )}

                <form onSubmit={handleSubmit} className="flex items-end gap-3">
                    <div className="grid gap-2">
                        <Label htmlFor="nom">Nom du scénario</Label>
                        <Input
                            id="nom"
                            value={data.nom}
                            onChange={(e) => setData('nom', e.target.value)}
                            placeholder="Ex: Installation avec relevage"
                        />
                        <InputError message={errors.nom} />
                    </div>

                    <Button type="submit" disabled={processing}>
                        Créer
                    </Button>
                </form>
            </div>
        </>
    );
}
