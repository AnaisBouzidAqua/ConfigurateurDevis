<?php

namespace App\Exports;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class DevisExport implements FromQuery, WithHeadings, WithMapping
{
    public function __construct(private Builder $query)
    {
    }

    public function query(): Builder
    {
        return $this->query;
    }

    public function headings(): array
    {
        return ['Client', 'Dispositif', 'Construction', 'Date du chiffrage'];
    }

    public function map($devis): array
    {
        return [
            $devis->client_nom,
            $devis->dispositif,
            $devis->type_realisation,
            $devis->created_at?->format('d/m/Y'),
        ];
    }
}
