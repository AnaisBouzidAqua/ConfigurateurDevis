import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

const formateurEuros = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
});

/** Formate un montant en euros à la française (ex : 22228.71 → "22 228,71 €"). */
export function formatEuros(montant: number): string {
    return formateurEuros.format(montant);
}
