import { useNavigate } from "react-router-dom";
import { Users, Calendar, Activity, ChevronRight, Plus } from "lucide-react";

import { useAuthStore } from "../stores/auth";
import { usePatients, Patient } from "../services/pacientes";
import { useAppointments, Appointment } from "../services/citas";
import StatsCard from "../components/ui/StatsCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";

export default function Dashboard() {
    const user = useAuthStore((s) => s.user);
    const navigate = useNavigate();

    const { data: patients, isLoading: patientsLoading } = usePatients();
    const { data: appointments, isLoading: appointmentsLoading } = useAppointments();

    const today = new Date().toISOString().split("T")[0];
    const todayAppointments = appointments?.filter((a: Appointment) =>
        a.date_time.startsWith(today)
    ) || [];

    const activeAppts = appointments?.filter(
        (a: Appointment) => a.status === "scheduled" || a.status === "confirmed"
    ) || [];

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Buenos días";
        if (h < 18) return "Buenas tardes";
        return "Buenas noches";
    };

    const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Doctor";

    if (patientsLoading || appointmentsLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-text-secondary font-medium">Preparando tu resumen...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/50 pb-8">
                <div>
                    <h1 className="text-4xl text-text-primary">
                        {greeting()}, {displayName}
                    </h1>
                    <p className="text-text-secondary mt-1 font-medium text-sm">
                        Hoy • {todayAppointments.length > 0 ? `${todayAppointments.length} cita${todayAppointments.length > 1 ? 's' : ''} confirmada${todayAppointments.length > 1 ? 's' : ''}` : 'Sin citas programadas'}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/pacientes/nuevo')}
                    className="btn btn-primary h-11"
                >
                    <Plus size={18} className="mr-2" />
                    Nuevo Paciente
                </button>
            </header>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatsCard
                    icon={Users}
                    label="Pacientes"
                    value={patients?.length || 0}
                    color="#1a6ef5"
                />
                <StatsCard
                    icon={Calendar}
                    label="Citas hoy"
                    value={todayAppointments.length}
                    color="#059669"
                />
                <StatsCard
                    icon={Activity}
                    label="Activas"
                    value={activeAppts.length}
                    color="#d97706"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                {/* Upcoming Appointments (60%) */}
                <section className="lg:col-span-3 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl text-text-primary">Citas de hoy</h2>
                        <button
                            onClick={() => navigate('/citas')}
                            className="text-xs font-bold text-accent hover:text-accent/80 flex items-center gap-1 transition-colors"
                        >
                            Ver todas <ChevronRight size={14} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {todayAppointments.length > 0 ? (
                            todayAppointments.map((appt: Appointment) => (
                                <div
                                    key={appt.id}
                                    className="group flex items-center justify-between p-4 bg-surface border border-border/50 hover:border-accent/30 hover:shadow-premium transition-all cursor-pointer rounded-card"
                                    onClick={() => navigate(`/citas/${appt.id}`)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-card bg-subtle/50 flex flex-col items-center justify-center text-text-secondary font-mono border border-border/30">
                                            <span className="text-[10px] uppercase font-bold leading-none mb-0.5">
                                                {new Date(appt.date_time).toLocaleDateString('es-MX', { month: 'short' })}
                                            </span>
                                            <span className="text-base font-bold leading-none">
                                                {new Date(appt.date_time).getDate()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-text-primary">{appt.patient_name || 'Paciente sin nombre'}</p>
                                            <p className="text-[11px] text-text-tertiary font-bold tracking-tight mt-0.5">
                                                {new Date(appt.date_time).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} • {appt.treatment_type || 'General'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-tight ${appt.status === 'confirmed' ? 'bg-success-light text-success' : 'bg-warning-light text-warning'
                                            }`}>
                                            {appt.status}
                                        </span>
                                        <ChevronRight size={16} className="text-text-tertiary group-hover:text-text-primary transition-colors" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-10 bg-surface rounded-card border border-dashed border-border flex items-center justify-center">
                                <EmptyState
                                    icon={Calendar}
                                    title="Sin citas para hoy"
                                    description="No tienes citas programadas para el resto del día."
                                    action={<button onClick={() => navigate('/citas')} className="btn btn-primary">Programar Cita</button>}
                                />
                            </div>
                        )}
                    </div>
                </section>

                {/* Recent Patients (40%) */}
                <section className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl text-text-primary">Pacientes recientes</h2>
                        <button
                            onClick={() => navigate('/pacientes')}
                            className="text-xs font-bold text-accent hover:text-accent/80 flex items-center gap-1 transition-colors"
                        >
                            Ver todos <ChevronRight size={14} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {patients && patients.length > 0 ? (
                            patients.slice(0, 5).map((patient: Patient) => (
                                <div
                                    key={patient.id}
                                    className="flex items-center justify-between p-4 bg-surface border border-border/50 hover:border-accent/30 hover:shadow-premium transition-all cursor-pointer rounded-card"
                                    onClick={() => navigate(`/pacientes/${patient.id}`)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-accent-light text-accent flex items-center justify-center font-extrabold text-xs border border-accent/10">
                                            {patient.full_name?.charAt(0) || 'P'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-text-primary">{patient.full_name}</p>
                                            <p className="text-[11px] text-text-tertiary font-bold tracking-tight mt-0.5">{patient.email || 'Sin correo'}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={14} className="text-text-tertiary" />
                                </div>
                            ))
                        ) : (
                            <EmptyState
                                icon={Users}
                                title="Sin pacientes aún"
                                description="Comienza registrando a tu primer paciente."
                                action={<button onClick={() => navigate('/pacientes/nuevo')} className="btn btn-primary">Registrar Paciente</button>}
                            />
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
