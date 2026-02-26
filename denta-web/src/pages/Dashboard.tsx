import { Users, CalendarDays, DollarSign, Activity } from "lucide-react";
import { useAuthStore } from "../stores/auth";

export default function Dashboard() {
    const { user } = useAuthStore();

    const displayName =
        user?.user_metadata?.full_name ||
        user?.email?.split("@")[0] ||
        "Doctor";

    return (
        <div className="dashboard">
            <div className="dashboard-greeting">
                <h1>👋 Buen día, {displayName}</h1>
                <p>Aquí está el resumen de tu consultorio</p>
            </div>

            <div className="dashboard-grid">
                <div className="stat-card stat-card--blue">
                    <div className="stat-card__icon">
                        <Users size={22} />
                    </div>
                    <div className="stat-card__content">
                        <span className="stat-card__value">—</span>
                        <span className="stat-card__label">Pacientes</span>
                    </div>
                </div>

                <div className="stat-card stat-card--green">
                    <div className="stat-card__icon">
                        <CalendarDays size={22} />
                    </div>
                    <div className="stat-card__content">
                        <span className="stat-card__value">—</span>
                        <span className="stat-card__label">Citas hoy</span>
                    </div>
                </div>

                <div className="stat-card stat-card--purple">
                    <div className="stat-card__icon">
                        <DollarSign size={22} />
                    </div>
                    <div className="stat-card__content">
                        <span className="stat-card__value">—</span>
                        <span className="stat-card__label">Ingresos mes</span>
                    </div>
                </div>

                <div className="stat-card stat-card--amber">
                    <div className="stat-card__icon">
                        <Activity size={22} />
                    </div>
                    <div className="stat-card__content">
                        <span className="stat-card__value">—</span>
                        <span className="stat-card__label">Tratamientos activos</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-placeholder">
                <p>📊 Aquí aparecerán gráficos y resúmenes cuando conectes tu Supabase.</p>
            </div>
        </div>
    );
}
