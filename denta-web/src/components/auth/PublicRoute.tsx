import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/auth";

/**
 * For routes that should NOT be accessible when logged in (e.g., Login, Signup)
 */
export default function PublicRoute() {
    const { session, loading, initialized } = useAuthStore();

    if (!initialized || loading) {
        return null; // Or a spinner
    }

    if (session) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
