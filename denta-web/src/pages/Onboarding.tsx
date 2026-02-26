import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateClinic } from "../hooks/useClinic";
import "./auth/Auth.css";

export default function Onboarding() {
    const navigate = useNavigate();
    const createClinic = useCreateClinic();

    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            await createClinic.mutateAsync({
                name,
                address: address || undefined,
                phone: phone || undefined,
            });
            navigate("/");
        } catch (err: any) {
            let msg = "Error al crear clínica";
            if (err.detail) {
                msg = Array.isArray(err.detail)
                    ? err.detail.map((d: any) => d.msg).join(", ")
                    : err.detail;
            } else if (err.message) {
                msg = err.message;
            }
            setError(msg);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <span className="auth-logo">🏥</span>
                    <h1 className="auth-title">Configura tu clínica</h1>
                    <p className="auth-subtitle">
                        Ingresa los datos de tu consultorio para comenzar
                    </p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && (
                        <div className="auth-error">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <div className="auth-field">
                        <label htmlFor="clinicName">Nombre de la clínica *</label>
                        <input
                            id="clinicName"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Consultorio Dental Sonrisas"
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="clinicAddress">Dirección</label>
                        <input
                            id="clinicAddress"
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Av. Principal #123, Col. Centro"
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="clinicPhone">Teléfono</label>
                        <input
                            id="clinicPhone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+52 55 1234 5678"
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-btn"
                        disabled={createClinic.isPending}
                    >
                        {createClinic.isPending ? "Creando..." : "Crear clínica"}
                    </button>
                </form>
            </div>
        </div>
    );
}
