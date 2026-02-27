import { useNavigate } from "react-router-dom";
import { Users, Calendar, DollarSign, Activity, ChevronRight, Plus } from "lucide-react";

import { useAuthStore } from "../stores/auth";
import { usePatients, Patient } from "../services/pacientes";
import { useAppointments, Appointment } from "../services/citas";
import StatsCard from "../components/ui/StatsCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import EmptyState from "../components/ui/EmptyState";

export default function Dashboard() {
    const user = useAuthStore((s) => s.user);
    const navigate = useNavigate();

    // In Module 5, we assume the user is already authenticated
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
                <p className="mt-4 text-slate-500 font-medium">Preparando tu resumen...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        {greeting()}, {displayName} 👋
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">
                        Aquí está lo que está pasando hoy en tu consultorio.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/pacientes/nuevo')}
                    className="btn btn-primary shadow-lg shadow-blue-100"
                >
                    <Plus size={20} className="mr-2" />
                    Nuevo Paciente
                </button>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    icon={Users}
                    label="Pacientes"
                    value={patients?.length || 0}
                    color="#0ea5e9"
                />
                <StatsCard
                    icon={Calendar}
                    label="Citas Hoy"
                    value={todayAppointments.length}
                    color="#10b981"
                />
                <StatsCard
                    icon={Activity}
                    label="Activas"
                    value={activeAppts.length}
                    color="#f59e0b"
                />
                <StatsCard
                    icon={DollarSign}
                    label="Ingresos"
                    value="$0.00"
                    color="#8b5cf6"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upcoming Appointments */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800">Citas de hoy</h2>
                        <button
                            onClick={() => navigate('/citas')}
                            className="text-sm font-semibold text-primary hover:underline flex items-center"
                        >
                            Ver todas <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {todayAppointments.length > 0 ? (
                            todayAppointments.map((appt: Appointment) => (
                                <div key={appt.id} className="card flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/citas/${appt.id}`)}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex flex-col items-center justify-center text-slate-600 font-bold">
                                            <span className="text-[10px] uppercase leading-none mb-0.5">
                                                {new Date(appt.date_time).toLocaleDateString('es-MX', { month: 'short' })}
                                            </span>
                                            <span className="text-base leading-none">
                                                {new Date(appt.date_time).getDate()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{appt.patient_name || 'Paciente sin nombre'}</p>
                                            <p className="text-xs text-slate-400 font-medium">
                                                {new Date(appt.date_time).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} • {appt.treatment_type || 'General'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${appt.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                        {appt.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <EmptyState
                                icon={Calendar}
                                title="Sin citas para hoy"
                                description="No tienes citas programadas para el resto del día."
                                action={<button onClick={() => navigate('/citas')} className="btn btn-primary px-6">Programar Cita</button>}
                            />
                        )}
                    </div>
                </section>

                {/* Recent Patients */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800">Pacientes recientes</h2>
                        <button
                            onClick={() => navigate('/pacientes')}
                            className="text-sm font-semibold text-primary hover:underline flex items-center"
                        >
                            Ver todos <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {patients && patients.length > 0 ? (
                            patients.slice(0, 4).map((patient: Patient) => (
                                <div key={patient.id} className="card flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/pacientes/${patient.id}`)}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 text-primary flex items-center justify-center font-bold text-sm">
                                            {patient.full_name?.charAt(0) || 'P'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{patient.full_name}</p>
                                            <p className="text-xs text-slate-400 font-medium">{patient.email || 'Sin correo'}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-300" />
                                </div>
                            ))
                        ) : (
                            <EmptyState
                                icon={Users}
                                title="Sin pacientes aún"
                                description="Comienza registrando a tu primer paciente."
                                action={<button onClick={() => navigate('/pacientes/nuevo')} className="btn btn-primary px-6">Registrar Paciente</button>}
                            />
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
