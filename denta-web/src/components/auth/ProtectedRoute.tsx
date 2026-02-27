import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/auth";
import { useMyClinic } from "../../hooks/useClinic";

export default function ProtectedRoute() {
    const { session, loading, initialized } = useAuthStore();
    const location = useLocation();
    const { data: clinic, isLoading: clinicLoading } = useMyClinic();

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

    // Still loading clinic info
    if (clinicLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner" />
                <p>Verificando clínica...</p>
            </div>
        );
    }

    // Authenticated but no clinic → redirect to onboarding
    // (unless already on the onboarding page)
    if (!clinic && location.pathname !== "/onboarding") {
        return <Navigate to="/onboarding" replace />;
    }

    return <Outlet />;
}
