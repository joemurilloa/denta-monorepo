import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, LogOut, User, ChevronDown } from "lucide-react";
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
            <button
                className="topbar-menu-btn"
                onClick={onMenuToggle}
                aria-label="Abrir menú"
            >
                <Menu size={22} />
            </button>

            <div className="topbar-spacer" />

            {/* User dropdown */}
            <div className="topbar-user" ref={dropdownRef}>
                <button
                    className="topbar-user__trigger"
                    onClick={() => setDropdownOpen((o) => !o)}
                >
                    <div className="topbar-avatar">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="topbar-user__name">{displayName}</span>
                    <ChevronDown size={16} />
                </button>

                {dropdownOpen && (
                    <div className="topbar-dropdown">
                        <button
                            className="topbar-dropdown__item"
                            onClick={() => {
                                setDropdownOpen(false);
                                navigate("/settings");
                            }}
                        >
                            <User size={16} />
                            <span>Mi perfil</span>
                        </button>
                        <button
                            className="topbar-dropdown__item topbar-dropdown__item--danger"
                            onClick={handleSignOut}
                        >
                            <LogOut size={16} />
                            <span>Cerrar sesión</span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
