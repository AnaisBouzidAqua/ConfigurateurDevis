import { Head, Link} from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Scenario {
    id: number;
    famille: string | null;
    nom: string;
    updated_at: string;
}

interface Props {
    scenarios: Scenario[];
}

export default function Index({ scenarios }: Props) {
    return (
        <>
            <Head title="Scénarios" />

            <div className="flex flex-col gap-6 p-4">

                {scenarios.length === 0 ? (
                    <p className="text-muted-foreground">Aucun scénario pour l'instant.</p>
                ) : (
                    <div className="mx-auto grid w-fit grid-cols-1 gap-4 sm:grid-cols-2">

                        {scenarios.map((scenario) => (
                            <Card key={scenario.id} className="relative">
                                <Link
                                    href={`/admin/scenarios/${scenario.id}`}
                                    className="text-muted-foreground hover:text-foreground absolute top-4 right-4"
                                    aria-label={`Aperçu de ${scenario.nom}`}
                                >
                                    <Eye className="size-4" />
                                </Link>
                                <CardHeader className="text-center">
                                    {scenario.famille && (
                                        <p className="text-sm font-semibold" style={{ color: '#64748B' }}>
                                            {scenario.famille}
                                        </p>
                                    )}
                                    <CardTitle>{scenario.nom}</CardTitle>
                                </CardHeader>

                                <CardContent className="flex justify-center">
                                    <Link href={`/admin/scenarios/${scenario.id}`}>
                                        <Button className="rounded-full">Éditer</Button>
                                    </Link>
                                </CardContent>
                                <CardFooter className="justify-center">
                                    <span className="text-sm" style={{ color: '#CBD5E1' }}>
                                        Dernière mise à jour :{' '}
                                        {new Date(scenario.updated_at).toLocaleDateString('fr-FR')}
                                    </span>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
