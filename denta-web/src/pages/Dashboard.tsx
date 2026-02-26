import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, CalendarDays, DollarSign, Activity } from "lucide-react";
import { useAuthStore } from "../stores/auth";
import { useMyClinic } from "../hooks/useClinic";
import { usePatients } from "../hooks/usePatients";
import { useAppointments } from "../hooks/useAppointments";
import "./Dashboard.css";

export default function Dashboard() {
    const user = useAuthStore((s) => s.user);
    const navigate = useNavigate();
    const { data: clinic, isLoading: clinicLoading } = useMyClinic();
    const { data: patients = [] } = usePatients();
    const { data: appointments = [] } = useAppointments();

    // Redirect to onboarding if no clinic
    useEffect(() => {
        if (!clinicLoading && clinic === null) {
            navigate("/onboarding");
        }
    }, [clinic, clinicLoading, navigate]);

    // Count today's appointments
    const today = new Date().toISOString().split("T")[0];
    const todayAppointments = appointments.filter((a) =>
        a.date_time.startsWith(today)
    );

    const activeAppts = appointments.filter(
        (a) => a.status === "scheduled" || a.status === "confirmed" || a.status === "in_progress"
    );

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return "Buenos días";
        if (h < 18) return "Buenas tardes";
        return "Buenas noches";
    };

    const displayName =
        user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Doctor";

    const stats = [
        {
            icon: <Users size={22} />,
            label: "Pacientes",
            value: patients.length,
            color: "#3b82f6",
            bg: "rgba(59,130,246,0.08)",
        },
        {
            icon: <CalendarDays size={22} />,
            label: "Citas hoy",
            value: todayAppointments.length,
            color: "#22c55e",
            bg: "rgba(34,197,94,0.08)",
        },
        {
            icon: <DollarSign size={22} />,
            label: "Ingresos mes",
            value: "—",
            color: "#8b5cf6",
            bg: "rgba(139,92,246,0.08)",
        },
        {
            icon: <Activity size={22} />,
            label: "Citas activas",
            value: activeAppts.length,
            color: "#f59e0b",
            bg: "rgba(245,158,11,0.08)",
        },
    ];

    if (clinicLoading) {
        return (
            <div className="placeholder-page">
                <p>Cargando...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <header className="dashboard-greeting">
                <h1>
                    👋 {greeting()}, {displayName}
                </h1>
                <p>
                    {clinic
                        ? `${clinic.name} — Aquí está el resumen de tu consultorio`
                        : "Aquí está el resumen de tu consultorio"}
                </p>
            </header>

            <div className="dashboard-stats">
                {stats.map((s) => (
                    <div key={s.label} className="stat-card">
                        <div
                            className="stat-icon"
                            style={{ background: s.bg, color: s.color }}
                        >
                            {s.icon}
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Upcoming appointments today */}
            {todayAppointments.length > 0 ? (
                <div className="dashboard-section">
                    <h2>📋 Citas de hoy</h2>
                    <div className="today-list">
                        {todayAppointments.map((a) => (
                            <div key={a.id} className="today-item">
                                <span className="today-time">
                                    {new Date(a.date_time).toLocaleTimeString("es-MX", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                                <span className="today-info">
                                    {a.treatment_type || "Consulta"} — {a.duration_minutes} min
                                </span>
                                <span className={`status-badge status-badge--${a.status}`}>
                                    {a.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="dashboard-section dashboard-section--empty">
                    <p>📊 No hay citas programadas para hoy.</p>
                </div>
            )}
        </div>
    );
}
