import { SectionTitle } from '@/components/section-title';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export interface DossierData {
    client_nom: string;
    dispositif: string;
    nombre_batiments: string;
    capacite_eh: string;
    nombre_chambres: string;
    type_effluents: string;
    installateur: string;
    type_installateur: string;
    installateur_agree_nom: string;
    type_realisation: string;
}

interface Props {
    data: DossierData;
    onChange: (field: keyof DossierData, value: string) => void;
    disabled?: boolean;
    errors?: Partial<Record<keyof DossierData, string>>;
    dispositifExtra?: React.ReactNode;
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
    return (
        <div className="grid gap-1.5">
            <Label htmlFor={id}>{label}</Label>
            {children}
        </div>
    );
}

export default function DossierFields({ data, onChange, disabled = false, errors = {}, dispositifExtra }: Props) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <section className="flex flex-col gap-3 rounded-md border p-4">
                <SectionTitle>Client</SectionTitle>
                <Field id="client_nom" label="Dossier concernant">
                    <Input
                        id="client_nom"
                        value={data.client_nom}
                        onChange={(e) => onChange('client_nom', e.target.value)}
                        disabled={disabled}
                    />
                    {errors.client_nom && <p className="text-destructive text-xs">{errors.client_nom}</p>}
                </Field>
            </section>

            <section className="flex flex-col gap-3 rounded-md border p-4">
                <SectionTitle>Dispositif</SectionTitle>
                <Field id="dispositif" label="Dispositif">
                    <Input
                        id="dispositif"
                        value={data.dispositif}
                        onChange={(e) => onChange('dispositif', e.target.value)}
                        disabled={disabled}
                    />
                </Field>
                {dispositifExtra}
            </section>

            <section className="flex flex-col gap-3 rounded-md border p-4">
                <SectionTitle>Caractéristiques bâtiment</SectionTitle>
                <Field id="nombre_batiments" label="Nombre de bâtiments">
                    <Input
                        id="nombre_batiments"
                        type="number"
                        value={data.nombre_batiments}
                        onChange={(e) => onChange('nombre_batiments', e.target.value)}
                        disabled={disabled}
                    />
                </Field>
                <Field id="capacite_eh" label="Capacité EH">
                    <Input
                        id="capacite_eh"
                        type="number"
                        value={data.capacite_eh}
                        onChange={(e) => onChange('capacite_eh', e.target.value)}
                        disabled={disabled}
                    />
                </Field>
                <Field id="nombre_chambres" label="Nombre de chambres">
                    <Input
                        id="nombre_chambres"
                        type="number"
                        value={data.nombre_chambres}
                        onChange={(e) => onChange('nombre_chambres', e.target.value)}
                        disabled={disabled}
                    />
                </Field>
                <Field id="type_effluents" label="Type d'effluents">
                    <Input
                        id="type_effluents"
                        value={data.type_effluents}
                        onChange={(e) => onChange('type_effluents', e.target.value)}
                        disabled={disabled}
                    />
                </Field>
            </section>

            <section className="flex flex-col gap-3 rounded-md border p-4">
                <SectionTitle>Construction</SectionTitle>

                <div className="grid gap-1.5">
                    <Label>Installateur</Label>
                    <RadioGroup
                        value={data.installateur}
                        onValueChange={(value) => onChange('installateur', value)}
                        className="flex gap-4"
                        disabled={disabled}
                    >
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="vente_kit" id="installateur_vente_kit" />
                            <Label htmlFor="installateur_vente_kit">Vente de kit</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="chantier_cle_en_main" id="installateur_cle_en_main" />
                            <Label htmlFor="installateur_cle_en_main">Chantier clé en main</Label>
                        </div>
                    </RadioGroup>
                </div>

                {data.installateur === 'vente_kit' && (
                    <div className="grid gap-1.5">
                        <Label>Type d'installateur</Label>
                        <RadioGroup
                            value={data.type_installateur}
                            onValueChange={(value) => onChange('type_installateur', value)}
                            className="flex gap-4"
                            disabled={disabled}
                        >
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="autoconstructeur" id="type_installateur_auto" />
                                <Label htmlFor="type_installateur_auto">Autoconstructeur</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="installateur_agree" id="type_installateur_agree" />
                                <Label htmlFor="type_installateur_agree">Installateur agréé</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="installateur_non_agree" id="type_installateur_non_agree" />
                                <Label htmlFor="type_installateur_non_agree">Installateur non agréé</Label>
                            </div>
                        </RadioGroup>
                    </div>
                )}

                <Field id="installateur_agree_nom" label="Installateur agréé">
                    <Input
                        id="installateur_agree_nom"
                        placeholder="Entreprise DUPONT"
                        value={data.installateur_agree_nom}
                        onChange={(e) => onChange('installateur_agree_nom', e.target.value)}
                        disabled={disabled}
                    />
                </Field>

                <div className="grid gap-1.5">
                    <Label>Type de réalisation</Label>
                    <RadioGroup
                        value={data.type_realisation}
                        onValueChange={(value) => onChange('type_realisation', value)}
                        className="flex gap-4"
                        disabled={disabled}
                    >
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="chantier_cle_en_main" id="type_realisation_cle_en_main" />
                            <Label htmlFor="type_realisation_cle_en_main">Chantier clé en main</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem
                                value="accompagnement_autoconstructeur"
                                id="type_realisation_accompagnement"
                            />
                            <Label htmlFor="type_realisation_accompagnement">
                                Accompagnement de l'autoconstructeur
                            </Label>
                        </div>
                    </RadioGroup>
                </div>
            </section>
        </div>
    );
}
