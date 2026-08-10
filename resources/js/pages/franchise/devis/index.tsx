import { Head, Link, router, useForm } from '@inertiajs/react';
import { Archive, ArrowDown, ArrowUp, FileSpreadsheet, FileText, MoreVertical, Search } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuIconTrigger,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { FiltreDates } from './components/FiltreDates';
import { Pagination } from './components/Pagination';

interface Devis {
    id: number;
    client_nom: string | null;
    dispositif: string | null;
    type_realisation: string | null;
    created_at: string;
}

interface Paginated<T> {
    data: T[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
}

interface Props {
    devis: Paginated<Devis>;
    recherche: string | null;
    parPage: number;
    tri: string;
    direction: 'asc' | 'desc';
    dateDebut: string | null;
    dateFin: string | null;
}

export default function Index({ devis, recherche, parPage, tri, direction, dateDebut, dateFin }: Props) {
    const { data, setData, get } = useForm({ recherche: recherche ?? '' });

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        get('/devis', { preserveState: true });
    }

    function archiver(id: number) {
        router.put(`/devis/${id}/archiver`);
    }

    const colonnes: { key: string; label: string }[] = [
        { key: 'client_nom', label: 'Client' },
        { key: 'dispositif', label: 'Dispositif' },
        { key: 'type_realisation', label: 'Construction' },
        { key: 'created_at', label: 'Date du chiffrage' },
    ];

    function trier(colonne: string) {
        const nouvelleDirection = tri === colonne && direction === 'asc' ? 'desc' : 'asc';

        router.get(
            '/devis',
            { recherche: recherche ?? '', par_page: parPage, tri: colonne, direction: nouvelleDirection },
            { preserveState: true, preserveScroll: true },
        );
    }

    return (
        <>
            <Head title="Historique des chiffrages" />

            <div className="flex flex-col gap-4 pt-8 pb-4 pr-6 pl-[52px] md:pr-4 md:pl-[44px]">
                <div className="bg-card rounded-xl p-4">
                    <form onSubmit={handleSearch} className="bg-background flex h-10 items-center justify-between rounded-lg">

                        <FiltreDates
                            dateDebut={dateDebut}
                            dateFin={dateFin}
                            recherche={recherche}
                            parPage={parPage}
                            tri={tri}
                            direction={direction}
                        />
                        <div className="relative w-64">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                            <Input
                                value={data.recherche}
                                onChange={(e) => setData('recherche', e.target.value)}
                                placeholder="Rechercher"
                                className="pl-9"
                            />
                        </div>
                    </form>
                </div>



                <div className="overflow-hidden rounded-xl border-1 border-border-secondary ">
                    <table className="w-full table-fixed text-sm">

                        <thead>
                            <tr className="bg-card text-muted-foreground border-b border-border-secondary text-left">
                                {colonnes.map((colonne) => (
                                    <th key={colonne.key} className="px-4 py-3 text-xs leading-4 font-bold">
                                        <button type="button" onClick={() => trier(colonne.key)} className="text-muted-foreground flex items-center gap-1">
                                            {colonne.label}
                                            {tri === colonne.key && direction === 'asc' ? (
                                                <ArrowUp className="size-3" />
                                            ) : (
                                                <ArrowDown className="size-3" />
                                            )}
                                        </button>
                                    </th>
                                ))}

                                <th className="w-10 px-2 py-3 text-right">
                                    <a
                                        href={`/devis/export?${new URLSearchParams({
                                            recherche: recherche ?? '',
                                            tri,
                                            direction,
                                            date_debut: dateDebut ?? '',
                                            date_fin: dateFin ?? '',
                                        }).toString()}`}
                                        className="inline-flex"
                                        title="Exporter en Excel"
                                    >
                                        <img src="/images/excel-icon.svg" alt="Exporter en Excel" className="size-5" />
                                    </a>
                                </th>




                            </tr>
                        </thead>
                        <tbody>
                            {devis.data.map((row) => (
                                <tr key={row.id} className="border-b border-border-secondary last:border-0">
                                    <td className="text-muted-foreground px-4 py-4 font-bold leading-5">
                                        {row.client_nom ?? '—'}
                                    </td>
                                    <td className="text-muted-foreground px-4 py-4">{row.dispositif ?? '—'}</td>
                                    <td className="text-muted-foreground px-4 py-4">{row.type_realisation ?? '—'}</td>
                                    <td className="text-muted-foreground px-4 py-4">
                                        {new Date(row.created_at).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-2 py-4">
                                        <DropdownMenu>
                                            <DropdownMenuIconTrigger>
                                                <MoreVertical className="size-4" />
                                            </DropdownMenuIconTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/devis/${row.id}?tab=chiffrage`}>
                                                        <FileText /> Voir le chiffrage
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/devis/${row.id}?tab=dossier`}>
                                                        <FileText /> Voir le dossier
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem variant="destructive" onClick={() => archiver(row.id)}>
                                                    <Archive /> Archiver
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {devis.data.length === 0 && (
                    <EmptyState
                        icon={FileText}
                        title={recherche || dateDebut ? 'Aucun résultat pour ces critères.' : "Aucun chiffrage pour l'instant."}
                        description={recherche || dateDebut ? 'Essaie une autre recherche.' : undefined}
                        bordered={false}
                    />
                )}

                <Pagination
                    links={devis.links}
                    parPage={parPage}
                    baseUrl="/devis"
                    extraParams={{
                        recherche: recherche ?? '',
                        tri,
                        direction,
                        date_debut: dateDebut ?? '',
                        date_fin: dateFin ?? '',
                    }}
                />


            </div>
        </>
    );
}

Index.layout = () => ({
    breadcrumbs: [{ title: 'Historique des chiffrages', href: '/devis' }],
});
