import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    trend?: string;
    color?: string;
}

export default function StatsCard({ icon: Icon, label, value, trend, color = '#0ea5e9' }: StatsCardProps) {
    return (
        <div className="card flex items-center gap-4 transition-transform hover:scale-[1.02]">
            <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${color}15`, color: color }}
            >
                <Icon size={24} />
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">{value}</span>
                    {trend && (
                        <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-lg">
                            {trend}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
