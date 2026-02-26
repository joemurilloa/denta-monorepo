import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    CalendarDays,
    Settings,
    X,
} from "lucide-react";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const NAV_ITEMS = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/patients", icon: Users, label: "Pacientes" },
    { to: "/appointments", icon: CalendarDays, label: "Citas" },
    { to: "/settings", icon: Settings, label: "Configuración" },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    return (
        <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
            {/* Header */}
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <span className="sidebar-logo__icon">🦷</span>
                    <span className="sidebar-logo__text">DentaApp</span>
                </div>
                <button
                    className="sidebar-close"
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
                        end={to === "/"}
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
            <div className="sidebar-footer">
                <span className="sidebar-version">v0.1.0</span>
            </div>
        </aside>
    );
}
