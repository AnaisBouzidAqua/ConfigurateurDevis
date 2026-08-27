import { usePage } from '@inertiajs/react';

/**
 * Distingue les routes côté franchisé (/devis, /parametres) des routes admin,
 * pour adapter la nav, la couleur de sidebar et le contexte des onglets.
 */
export function useIsFranchise(): boolean {
    const { url } = usePage();

    return url.startsWith('/devis') || url.startsWith('/parametres');
}
