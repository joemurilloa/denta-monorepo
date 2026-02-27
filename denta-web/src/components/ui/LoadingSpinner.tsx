export default function LoadingSpinner({ size = 'md', color = '#0ea5e9' }: { size?: 'sm' | 'md' | 'lg', color?: string }) {
    const sizes = {
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <div className="flex items-center justify-center p-4">
            <div
                className={`${sizes[size]} animate-spin rounded-full border-t-2 border-b-2`}
                style={{ borderColor: `${color} transparent ${color} transparent` }}
            />
        </div>
    );
}
