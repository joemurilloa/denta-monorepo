import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Calendar,
    Settings,
    X,
    CalendarCheck,
} from "lucide-react";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const NAV_ITEMS = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/pacientes", icon: Users, label: "Pacientes" },
    { to: "/citas", icon: Calendar, label: "Citas" },
    { to: "/agenda/configurar", icon: CalendarCheck, label: "Disponibilidad" },
    { to: "/configuracion", icon: Settings, label: "Configuración" },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    return (
        <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
            {/* Header */}
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="flex items-center justify-center bg-primary rounded-xl p-1.5">
                        <span className="text-white text-xl">🦷</span>
                    </div>
                    <span className="sidebar-logo__text">DentaApp</span>
                </div>
                <button
                    className="sidebar-close md:hidden"
                    onClick={onClose}
                    aria-label="Cerrar menú"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? "sidebar-link--active" : ""}`
                        }
                        onClick={onClose}
                    >
                        <Icon size={20} />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="mt-auto p-6 border-t border-slate-50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500">
                        JD
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold">Dr. Dentista</span>
                        <span className="text-xs text-slate-400 font-medium">Plan Pro</span>
                    </div>
                </div>
                <span className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">DentaApp v0.1.0</span>
            </div>
        </aside>
    );
}
