import { useForm } from '@inertiajs/react';
import { Check, ChevronsUpDown, Package } from 'lucide-react';
import { useState } from 'react';
import { DialogIcon } from '@/components/dialog-icon';
import { RequiredMark } from '@/components/required-mark';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { ArticleCatalogue, CategorieLigne } from '../types';

const LIBELLES: Record<CategorieLigne, { singulier: string; ajouter: string }> = {
    prestation: {
        singulier: 'prestation de service',
        ajouter: 'Ajouter une prestation de service',
    },
    fourniture: {
        singulier: 'fourniture',
        ajouter: 'Ajouter une fourniture',
    },
};

interface Props {
    devisId: number;
    categorie: CategorieLigne;
    articles: ArticleCatalogue[];
    open: boolean;
    onClose: () => void;
}

export function LigneCatalogueDialog({ devisId, categorie, articles, open, onClose }: Props) {
    const libelles = LIBELLES[categorie];

    const form = useForm({
        categorie,
        produit_ref: '',
        quantite: '1',
    });

    const [comboboxOuvert, setComboboxOuvert] = useState(false);
    const articleSelectionne = articles.find((a) => a.ref === form.data.produit_ref);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        form.post(`/devis/${devisId}/lignes`, {
            onSuccess: () => {
                form.reset();
                onClose();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <DialogIcon icon={Package} />
                        {libelles.ajouter}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="ligne_article">
                            {categorie === 'prestation' ? 'Prestation' : 'Fourniture'} <RequiredMark />
                        </Label>
                        <Popover open={comboboxOuvert} onOpenChange={setComboboxOuvert}>
                            <PopoverTrigger asChild>
                                <Button
                                    id="ligne_article"
                                    type="button"
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={comboboxOuvert}
                                    className={cn(
                                        'text-foreground hover:text-foreground w-full min-w-0 justify-between rounded-md border bg-transparent px-3 py-1 font-normal shadow-xs',
                                        comboboxOuvert ? 'border-ring ring-ring/50 ring-[3px]' : 'border-input hover:bg-transparent',
                                        !articleSelectionne && 'text-muted-foreground hover:text-muted-foreground',
                                    )}
                                >
                                    <span className="min-w-0 truncate">
                                        {articleSelectionne ? articleSelectionne.nom : `Choisir une ${libelles.singulier}`}
                                    </span>
                                    <ChevronsUpDown className="text-muted-foreground size-4 shrink-0" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                <Command>
                                    <CommandInput placeholder="Rechercher par nom ou référence" />
                                    <CommandList>
                                        <CommandEmpty>Aucun résultat.</CommandEmpty>
                                        <CommandGroup>
                                            {articles.map((article) => {
                                                const estSelectionne = article.ref === form.data.produit_ref;

                                                return (
                                                    <CommandItem
                                                        key={article.ref}
                                                        value={`${article.nom} ${article.ref}`}
                                                        onSelect={() => {
                                                            form.setData('produit_ref', estSelectionne ? '' : article.ref);
                                                            setComboboxOuvert(false);
                                                        }}
                                                    >
                                                        <Check className={cn('size-4', estSelectionne ? 'opacity-100' : 'opacity-0')} />
                                                        <span className="flex-1">{article.nom}</span>
                                                        <span className="text-muted-foreground text-xs">
                                                            {article.prix.toFixed(2)} €
                                                        </span>
                                                    </CommandItem>
                                                );
                                            })}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {form.errors.produit_ref && <p className="text-sm text-red-600">{form.errors.produit_ref}</p>}
                    </div>

                    <div className="grid w-32 gap-2">
                        <Label htmlFor="ligne_quantite">
                            Quantité <RequiredMark />
                        </Label>
                        <Input
                            id="ligne_quantite"
                            type="number"
                            min={1}
                            step={1}
                            value={form.data.quantite}
                            onChange={(e) => form.setData('quantite', e.target.value)}
                        />
                        {form.errors.quantite && <p className="text-sm text-red-600">{form.errors.quantite}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            Ajouter
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
