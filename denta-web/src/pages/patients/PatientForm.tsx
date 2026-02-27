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
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-danger/5 border border-danger/10 p-3 rounded-button text-xs text-danger flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                    <span className="text-sm">⚠️</span> {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[11px] font-extrabold text-[#000000] uppercase tracking-widest pl-1">Nombre *</label>
                    <input
                        type="text"
                        className="w-full bg-white border-2 border-slate-300 rounded-button px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/10 focus:border-accent outline-none transition-all shadow-md"
                        value={form.first_name}
                        onChange={(e) => set("first_name", e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-extrabold text-[#000000] uppercase tracking-widest pl-1">Apellido *</label>
                    <input
                        type="text"
                        className="w-full bg-white border-2 border-slate-300 rounded-button px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/10 focus:border-accent outline-none transition-all shadow-md"
                        value={form.last_name}
                        onChange={(e) => set("last_name", e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-extrabold text-[#000000] uppercase tracking-widest pl-1">Teléfono</label>
                    <input
                        type="tel"
                        className="w-full bg-white border-2 border-slate-300 rounded-button px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/10 focus:border-accent outline-none transition-all shadow-md"
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-extrabold text-[#000000] uppercase tracking-widest pl-1">Email</label>
                    <input
                        type="email"
                        className="w-full bg-white border-2 border-slate-300 rounded-button px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/10 focus:border-accent outline-none transition-all shadow-md"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-extrabold text-[#000000] uppercase tracking-widest pl-1">Fecha nacimiento</label>
                    <input
                        type="date"
                        className="w-full bg-white border-2 border-slate-300 rounded-button px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/10 focus:border-accent outline-none transition-all shadow-md"
                        value={form.date_of_birth}
                        onChange={(e) => set("date_of_birth", e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-extrabold text-[#000000] uppercase tracking-widest pl-1">Género</label>
                    <select
                        className="w-full bg-white border-2 border-slate-300 rounded-button px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/10 focus:border-accent outline-none transition-all appearance-none cursor-pointer shadow-md"
                        value={form.gender}
                        onChange={(e) => set("gender", e.target.value)}
                    >
                        <option value="">—</option>
                        <option value="male">Masculino</option>
                        <option value="female">Femenino</option>
                        <option value="other">Otro</option>
                    </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                    <label className="text-[11px] font-extrabold text-[#000000] uppercase tracking-widest pl-1">Dirección</label>
                    <input
                        type="text"
                        className="w-full bg-white border-2 border-slate-300 rounded-button px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/10 focus:border-accent outline-none transition-all shadow-md"
                        value={form.address}
                        onChange={(e) => set("address", e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-extrabold text-[#000000] uppercase tracking-widest pl-1">Aseguradora</label>
                    <input
                        type="text"
                        className="w-full bg-white border-2 border-slate-300 rounded-button px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/10 focus:border-accent outline-none transition-all shadow-md"
                        value={form.insurance_provider}
                        onChange={(e) => set("insurance_provider", e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[11px] font-extrabold text-[#000000] uppercase tracking-widest pl-1">No. Póliza</label>
                    <input
                        type="text"
                        className="w-full bg-white border-2 border-slate-300 rounded-button px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/10 focus:border-accent outline-none transition-all shadow-md"
                        value={form.insurance_number}
                        onChange={(e) => set("insurance_number", e.target.value)}
                    />
                </div>
                <div className="md:col-span-2 space-y-2">
                    <label className="text-[11px] font-extrabold text-[#000000] uppercase tracking-widest pl-1">Alergias</label>
                    <textarea
                        className="w-full bg-white border-2 border-slate-300 rounded-button px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/10 focus:border-accent outline-none transition-all min-h-[80px] resize-none shadow-md"
                        value={form.allergies}
                        onChange={(e) => set("allergies", e.target.value)}
                        placeholder="Penicilina, Látex..."
                    />
                </div>
                <div className="md:col-span-2 space-y-2">
                    <label className="text-[11px] font-extrabold text-[#000000] uppercase tracking-widest pl-1">Notas</label>
                    <textarea
                        className="w-full bg-white border-2 border-slate-300 rounded-button px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/10 focus:border-accent outline-none transition-all min-h-[80px] resize-none shadow-md"
                        value={form.notes}
                        onChange={(e) => set("notes", e.target.value)}
                    />
                </div>
            </div>

            <div className="pt-2">
                <button type="submit" className="btn btn-primary w-full h-11 flex items-center justify-center font-bold" disabled={isPending}>
                    {isPending ? "Guardando..." : patient ? "Guardar cambios" : "Crear paciente"}
                </button>
            </div>
        </form>
    );
}
