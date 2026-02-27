import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, LogOut, User, ChevronDown, Bell } from "lucide-react";
import { useAuthStore } from "../../stores/auth";

interface TopbarProps {
    onMenuToggle: () => void;
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
    const { user, signOut } = useAuthStore();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
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
        <header className="topbar">
            <div className="flex items-center gap-4">
                <button
                    className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
                    onClick={onMenuToggle}
                    aria-label="Abrir menú"
                >
                    <Menu size={22} />
                </button>
            </div>

            <div className="flex items-center gap-2">
                <button className="p-2.5 rounded-full text-slate-400 hover:bg-slate-50 transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="h-8 w-[1px] bg-slate-100 mx-2 hidden md:block"></div>

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        className="flex items-center gap-2 p-1.5 pl-2 rounded-full hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                        onClick={() => setDropdownOpen((o) => !o)}
                    >
                        <span className="hidden md:block text-sm font-semibold text-slate-700">{displayName}</span>
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-sm">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                            <div className="px-4 py-3 border-b border-slate-50 mb-1">
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Cuenta</p>
                                <p className="text-sm font-semibold text-slate-800 truncate">{user?.email}</p>
                            </div>
                            <button
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                onClick={() => {
                                    setDropdownOpen(false);
                                    navigate("/configuracion");
                                }}
                            >
                                <User size={18} className="text-slate-400" />
                                <span>Mi perfil</span>
                            </button>
                            <div className="h-[1px] bg-slate-50 my-1"></div>
                            <button
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
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
