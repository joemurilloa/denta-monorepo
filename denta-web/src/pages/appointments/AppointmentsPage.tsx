import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, Calendar, Clock, ChevronRight, Activity } from "lucide-react";
import {
    useAppointments,
    useDeleteAppointment,
    type Appointment,
    type AppointmentStatus,
} from "../../hooks/useAppointments";
import { useMyBookings, useUpdateBookingStatus } from "../../hooks/useBookings";
import { getWhatsAppLink } from "../../lib/whatsapp";
import Modal from "../../components/ui/Modal";
import AppointmentForm from "./AppointmentForm";
import EmptyState from "../../components/ui/EmptyState";

const STATUS_LABELS: Record<AppointmentStatus, string> = {
    scheduled: "Programada",
    confirmed: "Confirmada",
    in_progress: "En curso",
    completed: "Completada",
    cancelled: "Cancelada",
    no_show: "No asistió",
};

const STATUS_STYLING: Record<AppointmentStatus, string> = {
    scheduled: "bg-accent-light text-accent",
    confirmed: "bg-success-light text-success",
    in_progress: "bg-indigo-50 text-indigo-600",
    completed: "bg-slate-50 text-slate-600",
    cancelled: "bg-danger/5 text-danger",
    no_show: "bg-amber-50 text-amber-600",
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
    const { data: bookings = [] } = useMyBookings();

    const deleteAppointment = useDeleteAppointment();
    const updateBookingStatus = useUpdateBookingStatus();

    const openCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const openEdit = (e: React.MouseEvent, a: Appointment) => {
        e.stopPropagation();
        setEditing(a);
        setModalOpen(true);
    };

    const handleDelete = async (e: React.MouseEvent, a: Appointment) => {
        e.stopPropagation();
        if (!confirm("¿Eliminar esta cita?")) return;
        await deleteAppointment.mutateAsync(a.id);
    };

    const handleBookingAction = async (booking: any, status: "confirmed" | "rejected") => {
        try {
            const result = await updateBookingStatus.mutateAsync({ id: booking.id, status });

            if (status === "confirmed" && result) {
                const waUrl = getWhatsAppLink(result);
                if (waUrl) {
                    window.open(waUrl, "_blank");
                }
            }
        } catch (err) { }
    };

    const pendingBookings = bookings.filter(b => b.status === "pending");

    const fmt = (iso: string) => {
        const d = new Date(iso);
        return {
            date: d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }),
            time: d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
            raw: d
        };
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center sticky top-[72px] z-20 backdrop-blur-md bg-surface/90 p-3 px-4 border border-border rounded-card shadow-premium">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Desde</span>
                        <input
                            type="date"
                            className="bg-subtle border border-border rounded-button px-2 py-1 text-xs focus:ring-1 focus:ring-accent outline-none"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Hasta</span>
                        <input
                            type="date"
                            className="bg-subtle border border-border rounded-button px-2 py-1 text-xs focus:ring-1 focus:ring-accent outline-none"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-subtle border border-border rounded-button px-2 py-1 text-xs focus:ring-1 focus:ring-accent outline-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | "")}
                    >
                        <option value="">Todos los estados</option>
                        {Object.entries(STATUS_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                        ))}
                    </select>
                </div>
                <button className="btn btn-primary w-full sm:w-auto" onClick={openCreate}>
                    <Plus size={18} className="mr-2" />
                    Agendar cita
                </button>
            </div>

            {/* Solicitudes Pendientes */}
            {pendingBookings.length > 0 && (
                <section className="animate-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                        <h2 className="text-lg font-semibold text-text-primary tracking-tight">Solicitudes Pendientes</h2>
                        <span className="bg-warning-light text-warning text-xs font-bold px-2 py-0.5 rounded-full">{pendingBookings.length}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pendingBookings.map(b => (
                            <div key={b.id} className="bg-surface border border-warning/20 p-5 rounded-card shadow-premium relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-warning/40" />
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold text-text-primary">{b.patient_name}</h3>
                                        <p className="text-xs text-text-tertiary flex items-center gap-1 mt-0.5">
                                            <Calendar size={12} /> {b.requested_date} • {b.requested_time}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-xs text-text-secondary line-clamp-2 mb-5 min-h-[2.5rem] italic">"{b.reason || "Cita de diagnóstico"}"</p>
                                <div className="flex gap-2">
                                    <button
                                        className="flex-1 bg-accent text-white h-9 rounded-button text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-accent/90 transition-all active:scale-95"
                                        onClick={() => handleBookingAction(b, "confirmed")}
                                    >
                                        <Check size={14} /> Confirmar
                                    </button>
                                    <button
                                        className="w-9 h-9 border border-border text-text-tertiary rounded-button flex items-center justify-center hover:bg-danger/5 hover:text-danger hover:border-danger/20 transition-all"
                                        onClick={() => handleBookingAction(b, "rejected")}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Appointment List */}
            {isLoading ? (
                <div className="flex flex-col items-center py-20 gap-3">
                    <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                    <p className="text-sm font-medium text-text-secondary">Cargando citas...</p>
                </div>
            ) : appointments.length === 0 ? (
                <div className="py-20">
                    <EmptyState
                        icon={Calendar}
                        title="Sin citas registradas"
                        description="Tu agenda está libre por ahora. Agrega una cita para comenzar."
                        action={<button className="btn btn-primary" onClick={openCreate}>Agendar primera cita</button>}
                    />
                </div>
            ) : (
                <div className="grid gap-3">
                    {appointments.map((a) => {
                        const dateInfo = fmt(a.date_time);
                        return (
                            <div
                                key={a.id}
                                className="group flex flex-col md:flex-row md:items-center justify-between p-4 bg-surface border border-border rounded-card hover:bg-subtle transition-all cursor-pointer shadow-premium hover:shadow-md"
                                onClick={() => openEdit(null as any, a)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-card bg-subtle flex flex-col items-center justify-center text-text-secondary font-mono border border-border">
                                        <span className="text-[10px] uppercase font-bold leading-none mb-0.5 opacity-60">
                                            {dateInfo.raw.toLocaleDateString('es-MX', { month: 'short' })}
                                        </span>
                                        <span className="text-base font-bold leading-none">
                                            {dateInfo.raw.getDate()}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">
                                                {a.patient?.full_name || a.patient_name || 'Paciente sin nombre'}
                                            </h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLING[a.status]}`}>
                                                {STATUS_LABELS[a.status]}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 mt-1 text-xs text-text-secondary font-medium">
                                            <span className="flex items-center gap-1"><Clock size={12} className="text-text-tertiary" /> {dateInfo.time} ({a.duration_minutes} min)</span>
                                            <span className="flex items-center gap-1"><Activity size={12} className="text-text-tertiary" /> {a.treatment_type || "General"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-6 mt-4 md:mt-0 border-t md:border-t-0 border-border pt-4 md:pt-0">
                                    <div className="flex-1 md:flex-none">
                                        <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Notas</p>
                                        <p className="text-xs text-text-secondary mt-0.5 line-clamp-1 italic max-w-[200px]">
                                            {a.notes || "Sin notas"}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            className="p-2 text-text-tertiary hover:text-accent hover:bg-accent-light rounded-button transition-all"
                                            onClick={(e) => openEdit(e, a)}
                                            title="Editar"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            className="p-2 text-text-tertiary hover:text-danger hover:bg-danger/5 rounded-button transition-all"
                                            onClick={(e) => handleDelete(e, a)}
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <span className="w-px h-4 bg-border mx-1 hidden md:block" />
                                        <ChevronRight size={18} className="text-text-tertiary group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create / Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? "Editar cita" : "Nueva cita"}
                width="480px"
            >
                <div className="p-2">
                    <AppointmentForm
                        appointment={editing}
                        onSuccess={() => setModalOpen(false)}
                    />
                </div>
            </Modal>
        </div>
    );
}
