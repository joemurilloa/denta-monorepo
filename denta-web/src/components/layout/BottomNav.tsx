import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Settings } from 'lucide-react';

export default function BottomNav() {
    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/pacientes', icon: Users, label: 'Pacientes' },
        { to: '/citas', icon: Calendar, label: 'Citas' },
        { to: '/configuracion', icon: Settings, label: 'Config' },
    ];

    return (
        <nav className="bottom-nav md:hidden">
            {navItems.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                        `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`
                    }
                >
                    <item.icon className="w-6 h-6" />
                    <span className="text-[10px] font-medium mt-1">{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
}
