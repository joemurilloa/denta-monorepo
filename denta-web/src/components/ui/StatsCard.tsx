import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    trend?: string;
    color?: string;
}

export default function StatsCard({ icon: Icon, label, value, trend, color = '#1a6ef5' }: StatsCardProps) {
    return (
        <div className="bg-surface border border-border rounded-card shadow-premium p-4 flex items-center gap-4 transition-all hover:translate-y-[-2px]">
            <div
                className="w-10 h-10 md:w-12 md:h-12 rounded-card flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${color}15`, color: color }}
            >
                <Icon size={20} className="md:size-6" />
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest truncate">
                    {label}
                </span>
                <div className="flex items-baseline gap-2">
                    <span className="text-xl md:text-2xl font-mono font-bold text-text-primary tracking-tight">
                        {value}
                    </span>
                    {trend && (
                        <span className="text-[10px] font-bold text-success bg-success-light px-1.5 py-0.5 rounded-full">
                            {trend}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
