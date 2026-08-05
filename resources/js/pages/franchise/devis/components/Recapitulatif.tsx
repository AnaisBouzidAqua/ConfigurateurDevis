import { SectionTitle } from '@/components/section-title';

interface Ligne {
    produit_ref: string;
    quantite: number;
    nom: string;
    prix: number | null;
}

interface Props {
    lignes: Ligne[];
}

export default function Recapitulatif({ lignes }: Props) {
    const totalHt = lignes.reduce((sum, ligne) => sum + ligne.quantite * (ligne.prix ?? 0), 0);

    return (
        <aside className="w-80 shrink-0 rounded-md border p-4">
            <SectionTitle>Récapitulatif</SectionTitle>

            {lignes.length === 0 ? (
                <p className="text-muted-foreground mt-3 text-sm">Aucun produit pour l'instant.</p>
            ) : (
                <ul className="mt-3 mb-4 flex flex-col gap-2">
                    {lignes.map((ligne) => (
                        <li key={ligne.produit_ref} className="flex items-start justify-between gap-2 text-sm">
                            <span>
                                ×{ligne.quantite} {ligne.nom}
                            </span>
                            <span className="text-muted-foreground shrink-0">
                                {ligne.prix !== null ? `${(ligne.quantite * ligne.prix).toFixed(2)} €` : '—'}
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            <div className="flex justify-between border-t pt-3 text-sm font-semibold">
                <span>Total HT</span>
                <span>{totalHt.toFixed(2)} €</span>
            </div>
        </aside>
    );
}
