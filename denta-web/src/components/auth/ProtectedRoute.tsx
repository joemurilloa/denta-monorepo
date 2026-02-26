import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/auth";

export default function ProtectedRoute() {
    const { session, loading, initialized } = useAuthStore();

    // Still loading initial session
    if (!initialized || loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner" />
                <p>Cargando...</p>
            </div>
        );
    }

    // Not authenticated → redirect to login
    if (!session) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
