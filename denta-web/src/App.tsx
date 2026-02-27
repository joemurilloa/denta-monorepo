import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useAuthStore } from "./stores/auth";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";
import AppLayout from "./components/layout/AppLayout";
import SileoToaster from "./components/ui/Sileo";

// Pages
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import PatientsPage from "./pages/patients/PatientsPage";
import PatientDetailPage from "./pages/patients/PatientDetailPage";
import AppointmentsPage from "./pages/appointments/AppointmentsPage";
import AgendaConfigPage from "./pages/agenda/AgendaConfigPage";
import PublicAgendaPage from "./pages/agenda/PublicAgendaPage";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
        },
    },
});

function AppRoutes() {
    const initialize = useAuthStore((s) => s.initialize);

    useEffect(() => {
        initialize();
    }, [initialize]);

    return (
        <Routes>
            {/* Public (Always available) */}
            <Route path="/agenda/:slug" element={<PublicAgendaPage />} />

            {/* Public (Only if NOT logged in) */}
            <Route element={<PublicRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/registro" element={<SignupPage />} />
                <Route path="/signup" element={<SignupPage />} />
            </Route>

            {/* Protected (Require login) */}
            <Route element={<ProtectedRoute />}>
                <Route path="/onboarding" element={<Onboarding />} />
                <Route element={<AppLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />

                    {/* Pacientes */}
                    <Route path="/pacientes" element={<PatientsPage />} />
                    <Route path="/pacientes/:id" element={<PatientDetailPage />} />

                    {/* Citas */}
                    <Route path="/citas" element={<AppointmentsPage />} />

                    {/* Agenda */}
                    <Route path="/agenda/configurar" element={<AgendaConfigPage />} />

                    {/* Configuración */}
                    <Route path="/configuracion" element={<SettingsPage />} />
                </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}


function SettingsPage() {
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">🛠️ Configuración</h1>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm max-w-2xl">
                <p className="text-slate-600 mb-4">Gestiona la configuración de tu clínica y cuenta.</p>
                <div className="space-y-4">
                    <button className="flex items-center justify-between w-full p-4 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                        <span className="font-medium">Perfil de la Clínica</span>
                        <span className="text-slate-400">→</span>
                    </button>
                    <button className="flex items-center justify-between w-full p-4 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                        <span className="font-medium">Horarios de Atención</span>
                        <span className="text-slate-400">→</span>
                    </button>
                    <button className="flex items-center justify-between w-full p-4 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                        <span className="font-medium">Notificaciones</span>
                        <span className="text-slate-400">→</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <SileoToaster />
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </QueryClientProvider>
    );
}
