import { useState } from "react";
import { useParams } from "react-router-dom";
import { useDoctorSlots } from "../../hooks/useAvailability";
import { useCreateBooking } from "../../hooks/useBookings";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Calendar as CalendarIcon, Clock, User, Phone, MessageSquare, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import { sileo } from "sileo";
import "./PublicAgenda.css";

interface DoctorInfo {
    id: string;
    first_name: string;
    last_name: string;
    clinic_name?: string;
}

export default function PublicAgendaPage() {
    const { slug } = useParams<{ slug: string }>();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [step, setStep] = useState(1); // 1: Date/Time, 2: Form, 3: Success

    const [form, setForm] = useState({
        name: "",
        phone: "",
        reason: "",
    });

    // Fetch doctor info
    const { data: doctor } = useQuery<DoctorInfo>({
        queryKey: ["doctor", slug],
        queryFn: () => api.get<DoctorInfo>(`/auth/doctor/${slug}`).then(res => res.data),
        enabled: !!slug,
    });

    const { data: slots = [], isLoading: isLoadingSlots } = useDoctorSlots(slug, selectedDate);
    const createBooking = useCreateBooking();

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!slug || !selectedTime) return;

        try {
            await createBooking.mutateAsync({
                doctor_id: slug,
                patient_name: form.name,
                patient_phone: form.phone,
                reason: form.reason,
                requested_date: selectedDate,
                requested_time: selectedTime,
            });
            setStep(3);
        } catch (err) {
            sileo.error({ title: "Error", description: "No se pudo procesar tu reserva." });
        }
    };

    if (!doctor) return <div className="public-loading">Cargando perfil del doctor...</div>;

    return (
        <div className="public-agenda-container">
            <header className="public-header">
                <div className="avatar-placeholder">
                    {doctor.first_name[0]}{doctor.last_name[0]}
                </div>
                <h1>Dr. {doctor.first_name} {doctor.last_name}</h1>
                <p className="text-slate-500">{doctor.clinic_name || "Clínica Dental"}</p>
            </header>

            <main className="public-card shadow-xl">
                {step === 1 && (
                    <div className="step-content animate-fade-in">
                        <section className="section">
                            <h2 className="flex items-center gap-2 mb-4 font-semibold text-lg">
                                <CalendarIcon size={20} className="text-primary" />
                                Selecciona un día
                            </h2>
                            <input
                                type="date"
                                className="public-date-input"
                                value={selectedDate}
                                min={new Date().toISOString().split("T")[0]}
                                onChange={e => setSelectedDate(e.target.value)}
                            />
                        </section>

                        <section className="section mt-6">
                            <h2 className="flex items-center gap-2 mb-4 font-semibold text-lg">
                                <Clock size={20} className="text-primary" />
                                Horarios disponibles
                            </h2>
                            {isLoadingSlots ? (
                                <div className="text-center py-8 text-slate-400">Buscando horarios...</div>
                            ) : slots.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl">
                                    No hay horarios disponibles para este día.
                                </div>
                            ) : (
                                <div className="slots-grid">
                                    {slots.map(slot => (
                                        <button
                                            key={slot.time}
                                            disabled={!slot.available}
                                            className={`slot-btn ${selectedTime === slot.time ? 'active' : ''}`}
                                            onClick={() => setSelectedTime(slot.time)}
                                        >
                                            {slot.time}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </section>

                        <footer className="public-footer mt-8">
                            <button
                                className="btn btn-primary w-full py-4 rounded-2xl text-lg font-semibold shadow-lg shadow-sky-100"
                                disabled={!selectedTime}
                                onClick={() => setStep(2)}
                            >
                                Continuar
                                <ChevronRight size={20} />
                            </button>
                        </footer>
                    </div>
                )}

                {step === 2 && (
                    <form onSubmit={handleBooking} className="step-content animate-fade-in">
                        <button className="back-btn mb-6" onClick={() => setStep(1)}>
                            <ChevronLeft size={20} />
                            Volver a horarios
                        </button>

                        <h2 className="text-xl font-bold mb-6">Tus datos</h2>

                        <div className="space-y-4">
                            <div className="form-field">
                                <label className="flex items-center gap-2">
                                    <User size={16} /> Nombre Completo
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="public-input"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="Ej: Juan Pérez"
                                />
                            </div>
                            <div className="form-field">
                                <label className="flex items-center gap-2">
                                    <Phone size={16} /> Teléfono
                                </label>
                                <input
                                    type="tel"
                                    required
                                    className="public-input"
                                    value={form.phone}
                                    onChange={e => setForm({ ...form, phone: e.target.value })}
                                    placeholder="Ej: 5512345678"
                                />
                            </div>
                            <div className="form-field">
                                <label className="flex items-center gap-2">
                                    <MessageSquare size={16} /> Motivo de consulta
                                </label>
                                <textarea
                                    className="public-input min-h-[100px]"
                                    value={form.reason}
                                    onChange={e => setForm({ ...form, reason: e.target.value })}
                                    placeholder="Breve descripción..."
                                />
                            </div>
                        </div>

                        <footer className="public-footer mt-8">
                            <button
                                type="submit"
                                className="btn btn-primary w-full py-4 rounded-2xl text-lg font-semibold shadow-lg shadow-sky-100"
                                disabled={createBooking.isPending}
                            >
                                {createBooking.isPending ? "Procesando..." : "Solicitar Cita"}
                            </button>
                        </footer>
                    </form>
                )}

                {step === 3 && (
                    <div className="step-content text-center py-12 animate-fade-in">
                        <div className="success-icon mb-6 m-auto">
                            <CheckCircle2 size={64} className="text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">¡Solicitud Enviada!</h2>
                        <p className="text-slate-600 mb-8 max-w-xs mx-auto">
                            Tu solicitud ha sido enviada al consultorio. El doctor confirmará tu cita pronto.
                        </p>
                        <button
                            className="btn btn-secondary w-full py-4 rounded-2xl"
                            onClick={() => window.location.reload()}
                        >
                            Agendar otra cita
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
