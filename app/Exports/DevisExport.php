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
        return ['Client', 'Dispositif', "Nombre d'EH", 'Construction', "Type d'installateur", 'Total HT', 'Date de chiffrage'];
    }

    public function map($devis): array
    {
        return [
            $devis->client_nom,
            $devis->dispositif,
            $devis->capacite_eh,
            match ($devis->installateur) {
                'vente_kit' => 'Vente de kit',
                'chantier_cle_en_main' => 'Chantier clé en main',
                default => null,
            },
            $devis->installateur === 'chantier_cle_en_main' ? null : match ($devis->type_installateur) {
                'autoconstructeur' => 'Autoconstructeur',
                'installateur_agree' => 'Installateur agréé',
                'installateur_non_agree' => 'Installateur non agréé',
                default => null,
            },
            $devis->total_ht,
            $devis->created_at?->format('d/m/Y'),
        ];
    }
}
