import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
    useAppointments,
    useDeleteAppointment,
    type Appointment,
    type AppointmentStatus,
} from "../../hooks/useAppointments";
import Modal from "../../components/ui/Modal";
import AppointmentForm from "./AppointmentForm";
import "../patients/Patients.css";

const STATUS_LABELS: Record<AppointmentStatus, string> = {
    scheduled: "Programada",
    confirmed: "Confirmada",
    in_progress: "En curso",
    completed: "Completada",
    cancelled: "Cancelada",
    no_show: "No asistió",
};

export default function AppointmentsPage() {
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Appointment | null>(null);
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "">("");

    const filters = {
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        status: statusFilter || undefined,
    };

    const { data: appointments = [], isLoading } = useAppointments(filters);
    const deleteAppointment = useDeleteAppointment();

    const openCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const openEdit = (a: Appointment) => {
        setEditing(a);
        setModalOpen(true);
    };

    const handleDelete = async (a: Appointment) => {
        if (!confirm("¿Eliminar esta cita?")) return;
        await deleteAppointment.mutateAsync(a.id);
    };

    const fmt = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString("es-MX", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="page-patients">
            <div className="page-header">
                <h1>📅 Citas</h1>
                <button className="btn btn-primary" onClick={openCreate}>
                    <Plus size={18} />
                    Nueva cita
                </button>
            </div>

            {/* Filters */}
            <div className="filters-row">
                <div className="filter-field">
                    <label>Desde</label>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                    />
                </div>
                <div className="filter-field">
                    <label>Hasta</label>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                    />
                </div>
                <div className="filter-field">
                    <label>Estado</label>
                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(e.target.value as AppointmentStatus | "")
                        }
                    >
                        <option value="">Todos</option>
                        {Object.entries(STATUS_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>
                                {v}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="table-loading">Cargando citas...</div>
            ) : appointments.length === 0 ? (
                <div className="table-empty">
                    <span>📅</span>
                    <p>No hay citas registradas</p>
                    <button className="btn btn-primary" onClick={openCreate}>
                        <Plus size={16} /> Agendar primera cita
                    </button>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Fecha / Hora</th>
                                <th>Duración</th>
                                <th>Tratamiento</th>
                                <th>Estado</th>
                                <th>Notas</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((a) => (
                                <tr key={a.id}>
                                    <td className="td-name">{fmt(a.date_time)}</td>
                                    <td>{a.duration_minutes} min</td>
                                    <td>{a.treatment_type || "—"}</td>
                                    <td>
                                        <span
                                            className={`status-badge status-badge--${a.status}`}
                                        >
                                            {STATUS_LABELS[a.status]}
                                        </span>
                                    </td>
                                    <td>
                                        {a.notes
                                            ? a.notes.length > 30
                                                ? a.notes.slice(0, 30) + "..."
                                                : a.notes
                                            : "—"}
                                    </td>
                                    <td className="td-actions">
                                        <button
                                            className="icon-btn"
                                            onClick={() => openEdit(a)}
                                            title="Editar"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            className="icon-btn icon-btn--danger"
                                            onClick={() => handleDelete(a)}
                                            title="Eliminar"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create / Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? "Editar cita" : "Nueva cita"}
                width="480px"
            >
                <AppointmentForm
                    appointment={editing}
                    onSuccess={() => setModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
