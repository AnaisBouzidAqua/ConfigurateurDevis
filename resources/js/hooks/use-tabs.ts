import { router } from '@inertiajs/react';
import { useCallback, useState } from 'react';

export interface Onglet {
    href: string;
    title: string;
}

export type Espace = 'franchise' | 'admin';

function cleStockage(espace: Espace): string {
    return `onglets-ouverts-${espace}`;
}

function lireOnglets(espace: Espace): Onglet[] {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const brut = window.localStorage.getItem(cleStockage(espace));

        return brut ? JSON.parse(brut) : [];
    } catch {
        return [];
    }
}

function ecrireOnglets(espace: Espace, onglets: Onglet[]) {
    window.localStorage.setItem(cleStockage(espace), JSON.stringify(onglets));
}

export function useTabs(actuel: Onglet | null, espace: Espace) {
    const [onglets, setOnglets] = useState<Onglet[]>(() => lireOnglets(espace));
    const [dernierHrefSynchronise, setDernierHrefSynchronise] = useState<string | null>(null);
    const [espacePrecedent, setEspacePrecedent] = useState(espace);

    // Bascule entre les onglets franchisé et admin sans les mélanger —
    // pattern "adjusting state during render" (pas de useEffect).
    if (espace !== espacePrecedent) {
        setEspacePrecedent(espace);
        setDernierHrefSynchronise(null);
        setOnglets(lireOnglets(espace));
    }

    // Ajoute/actualise l'onglet courant dès que la page change — même
    // pattern, pour éviter un rendu en cascade.
    if (actuel && actuel.href !== dernierHrefSynchronise) {
        setDernierHrefSynchronise(actuel.href);
        setOnglets((precedents) => {
            const existeDeja = precedents.some((onglet) => onglet.href === actuel.href);
            const suivants = existeDeja
                ? precedents.map((onglet) => (onglet.href === actuel.href ? actuel : onglet))
                : [...precedents, actuel];

            ecrireOnglets(espace, suivants);

            return suivants;
        });
    }

    const fermer = useCallback(
        (href: string, hrefRepli: string) => {
            setOnglets((precedents) => {
                const index = precedents.findIndex((onglet) => onglet.href === href);
                const suivants = precedents.filter((onglet) => onglet.href !== href);
                ecrireOnglets(espace, suivants);

                if (href === actuel?.href) {
                    const cible = precedents[index - 1] ?? precedents[index + 1] ?? null;
                    router.visit(cible ? cible.href : hrefRepli);
                }

                return suivants;
            });
        },
        [actuel, espace],
    );

    return { onglets, fermer };
}
