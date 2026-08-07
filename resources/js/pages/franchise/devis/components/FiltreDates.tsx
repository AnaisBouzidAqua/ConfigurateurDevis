import { router } from '@inertiajs/react';
import { format, isToday } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Props {
    dateDebut: string | null;
    dateFin: string | null;
    recherche: string | null;
    parPage: number;
    tri: string;
    direction: 'asc' | 'desc';
}

function versRange(dateDebut: string | null, dateFin: string | null): DateRange | undefined {
    return dateDebut ? { from: new Date(dateDebut), to: dateFin ? new Date(dateFin) : undefined } : undefined;
}

export function FiltreDates({ dateDebut, dateFin, recherche, parPage, tri, direction }: Props) {
    const [open, setOpen] = useState(false);
    const [selection, setSelection] = useState<DateRange | undefined>(versRange(dateDebut, dateFin));

    useEffect(() => {
        setSelection(versRange(dateDebut, dateFin));
    }, [dateDebut, dateFin]);

    function onSelect(nouvelleSelection: DateRange | undefined) {
        setSelection(nouvelleSelection);

        if (!nouvelleSelection?.from || !nouvelleSelection?.to) {
            return;
        }

        router.get(
            '/devis',
            {
                recherche: recherche ?? '',
                par_page: parPage,
                tri,
                direction,
                date_debut: format(nouvelleSelection.from, 'yyyy-MM-dd'),
                date_fin: format(nouvelleSelection.to, 'yyyy-MM-dd'),
            },
            { preserveState: true, preserveScroll: true },
        );
        setOpen(false);
    }

    const label = selection?.from
        ? `${format(selection.from, 'dd/MM/yyyy')} - ${!selection.to || isToday(selection.to) ? "Aujourd'hui" : format(selection.to, 'dd/MM/yyyy')}`
        : 'Sélectionner une période';

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger className="text-foreground [&_svg]:text-foreground flex h-10 items-center gap-2 rounded-lg border px-3 text-sm leading-[120%] font-medium">
                <CalendarIcon className="size-4" />
                {label}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="range" selected={selection} onSelect={onSelect} numberOfMonths={2} />
            </PopoverContent>
        </Popover>
    );
}
