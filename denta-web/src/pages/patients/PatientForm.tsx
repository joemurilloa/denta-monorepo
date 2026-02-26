import { useState, type FormEvent } from "react";
import {
    useCreatePatient,
    useUpdatePatient,
    type Patient,
    type PatientCreate,
} from "../../hooks/usePatients";

interface PatientFormProps {
    patient: Patient | null;
    onSuccess: () => void;
}

export default function PatientForm({ patient, onSuccess }: PatientFormProps) {
    const createPatient = useCreatePatient();
    const updatePatient = useUpdatePatient();

    const [form, setForm] = useState<PatientCreate>({
        first_name: patient?.first_name || "",
        last_name: patient?.last_name || "",
        phone: patient?.phone || "",
        email: patient?.email || "",
        date_of_birth: patient?.date_of_birth || "",
        gender: patient?.gender || "",
        address: patient?.address || "",
        insurance_provider: patient?.insurance_provider || "",
        insurance_number: patient?.insurance_number || "",
        allergies: patient?.allergies || "",
        notes: patient?.notes || "",
    });
    const [error, setError] = useState("");

    const set = (field: string, value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        // Clean empty strings to undefined
        const cleaned: Record<string, string | undefined> = {};
        for (const [k, v] of Object.entries(form)) {
            cleaned[k] = v || undefined;
        }

        try {
            if (patient) {
                await updatePatient.mutateAsync({
                    id: patient.id,
                    ...cleaned,
                });
            } else {
                await createPatient.mutateAsync(
                    cleaned as unknown as PatientCreate
                );
            }
            onSuccess();
        } catch (err: any) {
            console.error("Error saving patient:", err);
            let msg = "Error al guardar";
            if (err.detail) {
                msg = Array.isArray(err.detail)
                    ? err.detail.map((d: any) => d.msg).join(", ")
                    : err.detail;
            } else if (err.message) {
                msg = err.message;
            }
            setError(msg);
        }
    };

    const isPending = createPatient.isPending || updatePatient.isPending;

    return (
        <form onSubmit={handleSubmit}>
            {error && (
                <div className="auth-error" style={{ marginBottom: "1rem" }}>
                    <span>⚠️</span> {error}
                </div>
            )}

            <div className="form-grid">
                <div className="form-field">
                    <label>Nombre *</label>
                    <input
                        type="text"
                        value={form.first_name}
                        onChange={(e) => set("first_name", e.target.value)}
                        required
                    />
                </div>
                <div className="form-field">
                    <label>Apellido *</label>
                    <input
                        type="text"
                        value={form.last_name}
                        onChange={(e) => set("last_name", e.target.value)}
                        required
                    />
                </div>
                <div className="form-field">
                    <label>Teléfono</label>
                    <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                    />
                </div>
                <div className="form-field">
                    <label>Email</label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                    />
                </div>
                <div className="form-field">
                    <label>Fecha nacimiento</label>
                    <input
                        type="date"
                        value={form.date_of_birth}
                        onChange={(e) => set("date_of_birth", e.target.value)}
                    />
                </div>
                <div className="form-field">
                    <label>Género</label>
                    <select
                        value={form.gender}
                        onChange={(e) => set("gender", e.target.value)}
                    >
                        <option value="">—</option>
                        <option value="male">Masculino</option>
                        <option value="female">Femenino</option>
                        <option value="other">Otro</option>
                    </select>
                </div>
                <div className="form-field form-field--full">
                    <label>Dirección</label>
                    <input
                        type="text"
                        value={form.address}
                        onChange={(e) => set("address", e.target.value)}
                    />
                </div>
                <div className="form-field">
                    <label>Aseguradora</label>
                    <input
                        type="text"
                        value={form.insurance_provider}
                        onChange={(e) => set("insurance_provider", e.target.value)}
                    />
                </div>
                <div className="form-field">
                    <label>No. Póliza</label>
                    <input
                        type="text"
                        value={form.insurance_number}
                        onChange={(e) => set("insurance_number", e.target.value)}
                    />
                </div>
                <div className="form-field form-field--full">
                    <label>Alergias</label>
                    <textarea
                        value={form.allergies}
                        onChange={(e) => set("allergies", e.target.value)}
                        placeholder="Penicilina, Látex..."
                    />
                </div>
                <div className="form-field form-field--full">
                    <label>Notas</label>
                    <textarea
                        value={form.notes}
                        onChange={(e) => set("notes", e.target.value)}
                    />
                </div>
            </div>

            <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={isPending}>
                    {isPending ? "Guardando..." : patient ? "Guardar cambios" : "Crear paciente"}
                </button>
            </div>
        </form>
    );
}
