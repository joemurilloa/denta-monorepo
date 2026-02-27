import { useState, type FormEvent } from "react";
import {
    useCreateAppointment,
    useUpdateAppointment,
    type Appointment,
    type AppointmentCreate,
} from "../../hooks/useAppointments";
import { usePatients } from "../../hooks/usePatients";
import { useAuthStore } from "../../stores/auth";

interface AppointmentFormProps {
    appointment: Appointment | null;
    onSuccess: () => void;
}

export default function AppointmentForm({
    appointment,
    onSuccess,
}: AppointmentFormProps) {
    const createAppointment = useCreateAppointment();
    const updateAppointment = useUpdateAppointment();
    const { data: patients = [] } = usePatients();
    const user = useAuthStore((s) => s.user);

    // Format datetime-local from ISO
    const toLocal = (iso: string) => {
        const d = new Date(iso);
        const offset = d.getTimezoneOffset();
        const local = new Date(d.getTime() - offset * 60000);
        return local.toISOString().slice(0, 16);
    };

    const [form, setForm] = useState({
        patient_id: appointment?.patient_id || "",
        date_time: appointment ? toLocal(appointment.date_time) : "",
        duration_minutes: appointment?.duration_minutes || 30,
        treatment_type: appointment?.treatment_type || "",
        notes: appointment?.notes || "",
        status: appointment?.status || "scheduled",
    });
    const [error, setError] = useState("");

    const set = (field: string, value: string | number) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        const body: AppointmentCreate = {
            patient_id: form.patient_id,
            dentist_id: user?.id || "",
            date_time: new Date(form.date_time).toISOString(),
            duration_minutes: form.duration_minutes,
            treatment_type: form.treatment_type || undefined,
            notes: form.notes || undefined,
            status: form.status as AppointmentCreate["status"],
        };

        try {
            if (appointment) {
                await updateAppointment.mutateAsync({
                    id: appointment.id,
                    ...body,
                });
            } else {
                await createAppointment.mutateAsync(body);
            }
            onSuccess();
        } catch (err: any) {
            console.error("Error saving appointment:", err);
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

    const isPending =
        createAppointment.isPending || updateAppointment.isPending;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-danger/5 border border-danger/10 p-3 rounded-button text-xs text-danger flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                    <span className="text-sm">⚠️</span> {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-2">
                    <label className="text-[11px] font-extrabold text-[#000000] uppercase tracking-widest pl-1">Paciente *</label>
                    <select
                        className="w-full bg-white border-2 border-slate-300 rounded-button px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all appearance-none cursor-pointer"
                        value={form.patient_id}
                        onChange={(e) => set("patient_id", e.target.value)}
                        required
                    >
                        <option value="">Seleccionar paciente...</option>
                        {patients.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.first_name} {p.last_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-extrabold text-[#000000] uppercase tracking-widest pl-1">Fecha y hora *</label>
                    <input
                        type="datetime-local"
                        className="w-full bg-white border-2 border-slate-300 rounded-button px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                        value={form.date_time}
                        onChange={(e) => set("date_time", e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-extrabold text-[#000000] uppercase tracking-widest pl-1">Duración (min)</label>
                    <input
                        type="number"
                        min="15"
                        max="480"
                        step="15"
                        className="w-full bg-white border-2 border-slate-300 rounded-button px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                        value={form.duration_minutes}
                        onChange={(e) =>
                            set("duration_minutes", parseInt(e.target.value) || 30)
                        }
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-extrabold text-[#000000] uppercase tracking-widest pl-1">Tratamiento</label>
                    <input
                        type="text"
                        className="w-full bg-white border-2 border-slate-300 rounded-button px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                        value={form.treatment_type}
                        onChange={(e) => set("treatment_type", e.target.value)}
                        placeholder="Ej. Limpieza, Extracción..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-extrabold text-[#000000] uppercase tracking-widest pl-1">Estado</label>
                    <select
                        className="w-full bg-white border-2 border-slate-300 rounded-button px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all appearance-none cursor-pointer"
                        value={form.status}
                        onChange={(e) => set("status", e.target.value)}
                    >
                        <option value="scheduled">Programada</option>
                        <option value="confirmed">Confirmada</option>
                        <option value="in_progress">En curso</option>
                        <option value="completed">Completada</option>
                        <option value="cancelled">Cancelada</option>
                        <option value="no_show">No asistió</option>
                    </select>
                </div>

                <div className="md:col-span-2 space-y-2">
                    <label className="text-[11px] font-extrabold text-[#000000] uppercase tracking-widest pl-1">Notas</label>
                    <textarea
                        className="w-full bg-white border-2 border-slate-300 rounded-button px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all min-h-[100px] resize-none"
                        value={form.notes}
                        onChange={(e) => set("notes", e.target.value)}
                        placeholder="Observaciones sobre la cita..."
                    />
                </div>
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    className="btn btn-primary w-full h-11 flex items-center justify-center"
                    disabled={isPending}
                >
                    {isPending
                        ? "Guardando..."
                        : appointment
                            ? "Guardar cambios"
                            : "Agendar cita"}
                </button>
            </div>
        </form>
    );
}
