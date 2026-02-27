import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import {
    User,
    Calendar,
    Activity,
    ChevronLeft,
    Clock,
    FileText
} from "lucide-react";
import DentalChart from "../../components/odontogram/DentalChart";
import { useCreateOdontogram, usePatientOdontograms } from "../../hooks/useOdontograms";
import "./Patients.css";

interface Patient {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    birth_date?: string;
}

export default function PatientDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<"info" | "odontogram" | "history">("info");

    const { data: patient, isLoading } = useQuery<Patient>({
        queryKey: ["patient", id],
        queryFn: () => api.get<Patient>(`/patients/${id}`).then(res => res.data),
        enabled: !!id,
    });

    const { data: odontograms = [] } = usePatientOdontograms(id);
    const createOdontogram = useCreateOdontogram();

    if (isLoading) return <div className="p-8 text-center text-slate-400">Cargando paciente...</div>;
    if (!patient) return <div className="p-8 text-center text-slate-400">Paciente no encontrado</div>;

    const handleSaveOdontogram = async (data: any) => {
        await createOdontogram.mutateAsync({
            patient_id: id!,
            visit_date: new Date().toISOString().split('T')[0],
            teeth: data.teeth,
            notes: data.notes
        });
    };

    return (
        <div className="patient-detail-container animate-fade-in">
            <header className="detail-header flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate("/pacientes")}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">
                        {patient.first_name} {patient.last_name}
                    </h1>
                    <p className="text-slate-500 flex items-center gap-2">
                        <User size={16} /> ID: {patient.id.slice(0, 8)}
                    </p>
                </div>
            </header>

            <nav className="detail-tabs flex gap-2 mb-8 p-1 bg-slate-100/50 rounded-2xl w-fit">
                <button
                    className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
                    onClick={() => setActiveTab('info')}
                >
                    <FileText size={18} /> Información
                </button>
                <button
                    className={`tab-btn ${activeTab === 'odontogram' ? 'active' : ''}`}
                    onClick={() => setActiveTab('odontogram')}
                >
                    <Activity size={18} /> Odontograma
                </button>
                <button
                    className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    <Clock size={18} /> Historial
                </button>
            </nav>

            <section className="tab-content">
                {activeTab === 'info' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-lg mb-4 text-slate-800">Datos Personales</h3>
                            <div className="space-y-4">
                                <InfoItem label="Email" value={patient.email || "No registrado"} />
                                <InfoItem label="Teléfono" value={patient.phone || "No registrado"} />
                                <InfoItem label="Fecha Nacimiento" value={patient.birth_date || "No registrado"} />
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-lg mb-4 text-slate-800">Resumen Médico</h3>
                            <p className="text-slate-500 italic">No hay notas médicas recientes.</p>
                        </div>
                    </div>
                )}

                {activeTab === 'odontogram' && (
                    <div className="animate-slide-up">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800">Nuevo Diagnóstico</h2>
                            <p className="text-sm text-slate-400">Fecha: {new Date().toLocaleDateString()}</p>
                        </div>
                        <DentalChart
                            patientId={id!}
                            onSave={handleSaveOdontogram}
                            initialData={odontograms[0] ? {
                                teeth: odontograms[0].teeth,
                                notes: odontograms[0].notes
                            } : undefined}
                        />
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-4 animate-slide-up">
                        <h2 className="text-xl font-bold mb-4">Evolución del Odontograma</h2>
                        {odontograms.length === 0 ? (
                            <div className="p-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                                No se encontraron registros anteriores.
                            </div>
                        ) : (
                            odontograms.map(o => (
                                <div key={o.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{new Date(o.visit_date).toLocaleDateString()}</p>
                                            <p className="text-sm text-slate-500">{o.notes || "Sin notas"}</p>
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-secondary py-2 px-4 text-sm"
                                        onClick={() => {
                                            setActiveTab('odontogram');
                                            // More complex logic would set specific history to view
                                        }}
                                    >
                                        Ver Detalle
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}

function InfoItem({ label, value }: { label: string, value: string }) {
    return (
        <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</span>
            <span className="text-slate-700 font-medium">{value}</span>
        </div>
    );
}
