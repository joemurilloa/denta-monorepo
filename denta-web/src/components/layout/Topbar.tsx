import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, LogOut, User, ChevronDown, Bell } from "lucide-react";
import { useAuthStore } from "../../stores/auth";

interface TopbarProps {
    onMenuToggle: () => void;
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
    const { user, signOut } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Dynamic title based on path
    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes("pacientes")) return "Pacientes";
        if (path.includes("citas")) return "Citas";
        if (path.includes("agenda")) return "Disponibilidad";
        if (path.includes("configuracion")) return "Configuración";
        return "Resumen";
    };

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const displayName =
        user?.user_metadata?.full_name ||
        user?.email?.split("@")[0] ||
        "Usuario";

    const handleSignOut = async () => {
        await signOut();
        navigate("/login");
    };

    return (
        <header className="sticky top-0 h-16 bg-surface/80 backdrop-blur-md border-b border-border z-30 px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button
                    className="p-2 -ml-2 rounded-button text-text-tertiary hover:bg-subtle hover:text-text-primary transition-all md:hidden"
                    onClick={onMenuToggle}
                >
                    <Menu size={20} />
                </button>
                <h1 className="text-xl font-bold text-text-primary tracking-tight">
                    {getPageTitle()}
                </h1>
            </div>

            <div className="flex items-center gap-3">
                <button className="hidden sm:flex p-2 rounded-full text-text-tertiary hover:bg-subtle hover:text-text-primary transition-all relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-surface"></span>
                </button>

                <div className="hidden sm:block h-6 w-px bg-border mx-1"></div>

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-subtle transition-all"
                        onClick={() => setDropdownOpen((o) => !o)}
                    >
                        <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold shadow-sm">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                        <span className="hidden md:block text-sm font-medium text-text-primary">{displayName}</span>
                        <ChevronDown size={14} className={`text-text-tertiary transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-surface rounded-card shadow-premium border border-border py-2 z-50 animate-in fade-in slide-in-from-top-2">
                            <div className="px-4 py-2 border-b border-border mb-1">
                                <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Sesión actual</p>
                                <p className="text-sm font-medium text-text-primary truncate">{user?.email}</p>
                            </div>
                            <button
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-subtle transition-colors"
                                onClick={() => {
                                    setDropdownOpen(false);
                                    navigate("/configuracion");
                                }}
                            >
                                <User size={18} />
                                <span>Mi cuenta</span>
                            </button>
                            <button
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger/5 transition-colors"
                                onClick={handleSignOut}
                            >
                                <LogOut size={18} />
                                <span>Cerrar sesión</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
