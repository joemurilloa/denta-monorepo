import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "./stores/auth";

// Layout & guards
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

// Pages
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 2, // 2 min
            retry: 1,
        },
    },
});

function AppRoutes() {
    const { initialize } = useAuthStore();

    useEffect(() => {
        initialize();
    }, [initialize]);

    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route
                        path="/patients"
                        element={<PlaceholderPage title="Pacientes" emoji="👥" />}
                    />
                    <Route
                        path="/appointments"
                        element={<PlaceholderPage title="Citas" emoji="📅" />}
                    />
                    <Route
                        path="/settings"
                        element={<PlaceholderPage title="Configuración" emoji="⚙️" />}
                    />
                </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

/** Temporary placeholder for pages not yet implemented */
function PlaceholderPage({ title, emoji }: { title: string; emoji: string }) {
    return (
        <div className="placeholder-page">
            <span className="placeholder-page__emoji">{emoji}</span>
            <h2>{title}</h2>
            <p>Esta sección estará disponible en el próximo módulo.</p>
        </div>
    );
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </QueryClientProvider>
    );
}
