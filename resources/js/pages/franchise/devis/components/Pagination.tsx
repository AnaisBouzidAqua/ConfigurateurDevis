import { Link, router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';


interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    links: PaginationLink[];
    parPage: number;
    baseUrl: string;
    extraParams?: Record<string, string | number>;
}

export function Pagination({ links, parPage, baseUrl, extraParams = {} }: Props) {
    function changerParPage(value: string) {
        router.get(baseUrl, { ...extraParams, par_page: value }, { preserveState: true, preserveScroll: true });
    }

    return (
        <div className="-mt-2 flex items-center justify-between rounded-xl border-border-secondary border px-4 py-3">
            <div className="relative">
                <select
                    value={parPage}
                    onChange={(e) => changerParPage(e.target.value)}
                    className="text-foreground h-[33px] appearance-none rounded-lg border bg-background py-2 pr-9 pl-3 text-sm leading-[120%] font-medium"
                >
                    <option value="10">10 par page</option>
                    <option value="20">20 par page</option>
                    <option value="50">50 par page</option>
                </select>
                <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
            </div>

            <div className="divide-border flex h-10 items-center divide-x overflow-hidden rounded-lg border text-sm">
                <Link
                    href={links[0].url ?? '#'}
                    preserveScroll
                    className={
                        links[0].url
                            ? 'text-foreground [&_svg]:text-muted-foreground flex h-full items-center gap-1 px-1.5 text-sm leading-5 font-semibold tracking-normal'
                            : 'text-disabled [&_svg]:text-border-secondary pointer-events-none flex h-full items-center gap-1 px-1.5 text-sm leading-5 font-semibold tracking-normal'
                    }
                >
                    <ArrowLeft className="size-4" /> Précédent
                </Link>

                {links.slice(1, -1).map((link, index) => (
                    <Link
                        key={index}
                        href={link.url ?? '#'}
                        preserveScroll
                        className={
                            link.active
                                ? 'text-label bg-card flex h-full w-7 items-center justify-center text-sm leading-5 font-semibold tracking-normal'
                                : 'text-label hover:bg-muted flex h-full w-7 items-center justify-center text-sm leading-5 font-semibold tracking-normal'
                        }
                    >
                        {link.label}
                    </Link>
                ))}

                <Link
                    href={links[links.length - 1].url ?? '#'}
                    preserveScroll
                    className={
                        links[links.length - 1].url
                            ? 'text-foreground [&_svg]:text-muted-foreground flex h-full items-center gap-1 px-1.5 text-sm leading-5 font-semibold tracking-normal'
                            : 'text-disabled [&_svg]:text-border-secondary pointer-events-none flex h-full items-center gap-1 px-1.5 text-sm leading-5 font-semibold tracking-normal'
                    }
                >
                    Suivant <ArrowRight className="size-4" />
                </Link>
            </div>
        </div>
    );
}
