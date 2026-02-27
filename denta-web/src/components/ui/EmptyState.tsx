import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl shadow-sm border border-slate-100">
            {Icon && (
                <div className="p-4 bg-slate-50 rounded-full mb-4">
                    <Icon className="w-10 h-10 text-slate-400" />
                </div>
            )}
            <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
            {description && <p className="text-slate-500 max-w-xs mx-auto mb-6">{description}</p>}
            {action && <div>{action}</div>}
        </div>
    );
}
