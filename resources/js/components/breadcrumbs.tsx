import { Link } from '@inertiajs/react';
import { Home } from 'lucide-react';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function Breadcrumbs({
    breadcrumbs,
}: {
    breadcrumbs: BreadcrumbItemType[];
}) {
    if (breadcrumbs.length === 0) {
        return null;
    }

    return (
        <nav aria-label="Fil d'ariane" className="flex items-center gap-1.5">
            <Link
                href="/admin/scenarios"
                className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground hover:text-foreground"
            >
                <Home className="size-3.5" />
            </Link>

            {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1;

                return isLast ? (
                    <span
                        key={index}
                        className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-primary"
                    >
                        {item.title}
                    </span>
                ) : (
                    <Link
                        key={index}
                        href={item.href}
                        className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-primary hover:bg-primary/10"
                    >
                        {item.title}
                    </Link>
                );
            })}
        </nav>
    );
}
