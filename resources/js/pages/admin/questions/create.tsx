import { Head, useForm } from '@inertiajs/react';

interface Rubrique {
    id: number;
    titre: string;
    scenario: {
        id: number;
        nom: string;
    };
}

interface Props {
    rubrique: Rubrique;
}

export default function Create({ rubrique }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        texte: '',
        infos_bulle: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(`/admin/rubriques/${rubrique.id}/questions`, {
            onSuccess: () => reset(),
        });
    }

    return (
        <>
            <Head title={`Ajouter une question — ${rubrique.titre}`} />

            <div className="flex flex-col gap-6 p-4">
                <p className="text-muted-foreground text-sm">
                    Scénario {rubrique.scenario.nom} | Section {rubrique.titre}
                </p>

                <h1 className="text-2xl font-semibold">Ajouter une question</h1>

                <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4">
                    <div className="grid gap-2">
                        <label htmlFor="texte" className="text-sm font-medium">
                            Libellé de la question
                        </label>
                        <input
                            id="texte"
                            type="text"
                            value={data.texte}
                            onChange={(e) => setData('texte', e.target.value)}
                            className="rounded-md border px-3 py-1.5"
                        />
                        {errors.texte && <p className="text-sm text-red-600">{errors.texte}</p>}
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="infos_bulle" className="text-sm font-medium">
                            Infos bulle
                        </label>
                        <textarea
                            id="infos_bulle"
                            value={data.infos_bulle}
                            onChange={(e) => setData('infos_bulle', e.target.value)}
                            className="rounded-md border px-3 py-1.5"
                        />
                    </div>

                    <button type="submit" disabled={processing} className="self-start rounded-md border px-4 py-1.5">
                        Créer
                    </button>
                </form>
            </div>
        </>
    );
}
