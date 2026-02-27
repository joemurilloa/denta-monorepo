import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Calendar,
    Settings,
    X,
    CalendarCheck,
} from "lucide-react";
import { useAuthStore } from "../../stores/auth";

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
    const { user } = useAuthStore();

    const displayName =
        user?.user_metadata?.full_name ||
        user?.email?.split("@")[0] ||
        "Usuario";

    return (
        <>
            {/* Sidebar Rail / Full */}
            <aside className={`sidebar flex flex-col h-screen fixed left-0 top-0 bg-surface border-r border-border z-50 transition-all duration-300 ${isOpen ? 'w-[240px]' : 'w-0 md:w-[60px] overflow-hidden'}`}>
                {/* Header */}
                <div className="h-16 flex items-center px-4 border-b border-border shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-accent rounded-lg shrink-0">
                            <span className="text-white text-lg">🦷</span>
                        </div>
                        <span className={`text-xl font-extrabold text-text-primary tracking-tight transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                            DentaApp
                        </span>
                    </div>
                    {isOpen && (
                        <button
                            onClick={onClose}
                            className="ml-auto p-1 md:hidden text-text-tertiary hover:text-text-primary"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 h-11 px-3 rounded-button transition-all duration-200 ${isActive
                                    ? "bg-accent-light text-accent"
                                    : "text-text-secondary hover:bg-subtle hover:text-text-primary"
                                }`
                            }
                            onClick={() => {
                                if (window.innerWidth < 768) onClose();
                            }}
                        >
                            <Icon size={18} className="shrink-0" />
                            <span className={`text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                                {label}
                            </span>
                        </NavLink>
                    ))}
                </nav>

                {/* Footer / User Profile */}
                <div className="p-4 border-t border-border shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-subtle flex items-center justify-center text-xs font-bold text-text-secondary shrink-0 border border-border">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className={`flex flex-col min-w-0 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                            <span className="text-xs font-semibold text-text-primary truncate">{displayName}</span>
                            <span className="text-[10px] text-text-tertiary uppercase tracking-wider">Plan Pro</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={onClose}
                />
            )}
        </>
    );
}
