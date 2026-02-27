import { useState, useEffect } from "react";
import { useMyAvailability, useUpdateAvailability } from "../../hooks/useAvailability";
import { useAuthStore } from "../../stores/auth";
import { sileo } from "sileo";
import { Save, Calendar, Clock, Copy, ExternalLink, ShieldAlert } from "lucide-react";
import "./Agenda.css";

const DAYS = [
    { id: 1, name: "Lunes" },
    { id: 2, name: "Martes" },
    { id: 3, name: "Miércoles" },
    { id: 4, name: "Jueves" },
    { id: 5, name: "Viernes" },
    { id: 6, name: "Sábado" },
    { id: 7, name: "Domingo" },
];

export default function AgendaConfigPage() {
    const { data: config, isLoading } = useMyAvailability();
    const updateAvailability = useUpdateAvailability();
    const user = useAuthStore(s => s.user);

    const [days, setDays] = useState<number[]>([]);
    const [startTime, setStartTime] = useState("08:00");
    const [endTime, setEndTime] = useState("18:00");
    const [slotDuration, setSlotDuration] = useState(30);

    useEffect(() => {
        if (config) {
            setDays(config.working_days);
            setStartTime(config.start_time.slice(0, 5));
            setEndTime(config.end_time.slice(0, 5));
            setSlotDuration(config.slot_duration_minutes);
        }
    }, [config]);

    const toggleDay = (id: number) => {
        setDays(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
    };

    const handleSave = async () => {
        try {
            await updateAvailability.mutateAsync({
                working_days: days,
                start_time: startTime,
                end_time: endTime,
                slot_duration_minutes: slotDuration,
            });
            sileo.success({
                title: "Configuración guardada",
                description: "Tu disponibilidad ha sido actualizada correctamente."
            });
        } catch (err) {
            sileo.error({
                title: "Error",
                description: "No se pudo guardar la configuración."
            });
        }
    };

    const publicUrl = `${window.location.origin}/agenda/${user?.id}`;

    const copyUrl = () => {
        navigator.clipboard.writeText(publicUrl);
        sileo.success({ title: "Copiado", description: "URL copiada al portapapeles" });
    };

    if (isLoading) return <div className="p-8">Cargando configuración...</div>;

    return (
        <div className="page-agenda-config">
            <div className="page-header">
                <div>
                    <h1 className="text-2xl font-bold">📅 Configuración de Agenda</h1>
                    <p className="text-slate-500">Define cuándo estás disponible para citas públicas.</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={updateAvailability.isPending}
                >
                    <Save size={18} />
                    {updateAvailability.isPending ? "Guardando..." : "Guardar cambios"}
                </button>
            </div>

            <div className="config-grid">
                {/* Public Link Card */}
                <div className="config-card config-card--highlight">
                    <div className="card-header">
                        <ExternalLink size={20} className="text-sky-500" />
                        <h3>Tu Link de Reservas</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">
                        Comparte este link con tus pacientes para que agenden sus citas directamente.
                    </p>
                    <div className="url-copy-box">
                        <code className="text-xs truncate">{publicUrl}</code>
                        <button onClick={copyUrl} type="button" title="Copiar URL">
                            <Copy size={16} />
                        </button>
                    </div>
                </div>

                {/* Working Days */}
                <div className="config-card">
                    <div className="card-header">
                        <Calendar size={20} className="text-indigo-500" />
                        <h3>Días Laborales</h3>
                    </div>
                    <div className="days-picker">
                        {DAYS.map(day => (
                            <button
                                key={day.id}
                                className={`day-btn ${days.includes(day.id) ? 'active' : ''}`}
                                onClick={() => toggleDay(day.id)}
                            >
                                {day.name.slice(0, 1)}
                                <span className="day-full-name">{day.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Hours & Duration */}
                <div className="config-card">
                    <div className="card-header">
                        <Clock size={20} className="text-amber-500" />
                        <h3>Horarios y Duración</h3>
                    </div>
                    <div className="hours-grid">
                        <div className="form-field">
                            <label>Hora Inicio</label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                            />
                        </div>
                        <div className="form-field">
                            <label>Hora Fin</label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={e => setEndTime(e.target.value)}
                            />
                        </div>
                        <div className="form-field form-field--full">
                            <label>Duración de Cita (minutos)</label>
                            <select
                                value={slotDuration}
                                onChange={e => setSlotDuration(Number(e.target.value))}
                            >
                                <option value={15}>15 minutos</option>
                                <option value={30}>30 minutos</option>
                                <option value={45}>45 minutos</option>
                                <option value={60}>60 minutos</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="config-card bg-slate-50 border-none shadow-none">
                    <div className="flex gap-3">
                        <ShieldAlert className="text-slate-400 shrink-0" size={24} />
                        <div className="text-sm text-slate-500 space-y-2">
                            <p><strong>Nota:</strong> Los slots ocupados por citas existentes en tu calendario no se mostrarán en la página pública.</p>
                            <p>Asegúrate de mantener tu agenda actualizada para evitar conflictos.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
