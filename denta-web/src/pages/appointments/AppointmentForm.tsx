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
        <form onSubmit={handleSubmit}>
            {error && (
                <div className="auth-error" style={{ marginBottom: "1rem" }}>
                    <span>⚠️</span> {error}
                </div>
            )}

            <div className="form-grid">
                <div className="form-field form-field--full">
                    <label>Paciente *</label>
                    <select
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
                <div className="form-field">
                    <label>Fecha y hora *</label>
                    <input
                        type="datetime-local"
                        value={form.date_time}
                        onChange={(e) => set("date_time", e.target.value)}
                        required
                    />
                </div>
                <div className="form-field">
                    <label>Duración (min)</label>
                    <input
                        type="number"
                        min="15"
                        max="480"
                        step="15"
                        value={form.duration_minutes}
                        onChange={(e) =>
                            set("duration_minutes", parseInt(e.target.value) || 30)
                        }
                    />
                </div>
                <div className="form-field">
                    <label>Tipo de tratamiento</label>
                    <input
                        type="text"
                        value={form.treatment_type}
                        onChange={(e) => set("treatment_type", e.target.value)}
                        placeholder="Limpieza, Extracción..."
                    />
                </div>
                <div className="form-field">
                    <label>Estado</label>
                    <select
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
                <div className="form-field form-field--full">
                    <label>Notas</label>
                    <textarea
                        value={form.notes}
                        onChange={(e) => set("notes", e.target.value)}
                        placeholder="Observaciones sobre la cita..."
                    />
                </div>
            </div>

            <div className="form-actions">
                <button
                    type="submit"
                    className="btn btn-primary"
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
