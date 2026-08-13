import { Link, usePage } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useTabs } from '@/hooks/use-tabs';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function TabBar({ breadcrumbs }: { breadcrumbs: BreadcrumbItemType[] }) {
    const { url } = usePage();
    const { isCurrentUrl } = useCurrentUrl();
    const isFranchise = url.startsWith('/devis') || url.startsWith('/parametres');
    const homeHref = isFranchise ? '/devis/create' : '/admin/scenarios';

    const dernier = breadcrumbs[breadcrumbs.length - 1];
    const actuel = dernier ? { title: dernier.title, href: String(dernier.href) } : null;
    const { onglets, fermer } = useTabs(actuel, isFranchise ? 'franchise' : 'admin');

    return (
        <nav aria-label="Onglets ouverts" className="flex items-center gap-1.5">
            <Link
                href={homeHref}
                className="bg-card flex h-9 items-center justify-center rounded-md px-2.5 py-1"
            >
                <img src="/images/home-line.svg" alt="Accueil" className="size-3.5" />
            </Link>

            {onglets.map((onglet) => (
                <span
                    key={onglet.href}
                    className={cn(
                        'bg-card flex h-9 items-center gap-1.5 rounded-lg py-1 pr-1.5 pl-3 text-sm leading-[120%] font-medium tracking-normal',
                        isCurrentUrl(onglet.href) ? 'text-primary' : 'text-muted-foreground',
                    )}
                >
                    <Link href={onglet.href} className="hover:underline">
                        {onglet.title}
                    </Link>
                    <button
                        type="button"
                        onClick={() => fermer(onglet.href, homeHref)}
                        className="text-muted-foreground hover:text-foreground flex size-4 items-center justify-center rounded-full"
                        aria-label={`Fermer l'onglet ${onglet.title}`}
                    >
                        <X className="size-3" />
                    </button>
                </span>
            ))}
        </nav>
    );
}
