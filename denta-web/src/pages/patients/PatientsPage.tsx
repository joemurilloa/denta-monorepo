import { useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import {
    usePatients,
    useDeletePatient,
    type Patient,
} from "../../hooks/usePatients";
import Modal from "../../components/ui/Modal";
import PatientForm from "./PatientForm";
import "./Patients.css";

export default function PatientsPage() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Patient | null>(null);

    const { data: patients = [], isLoading } = usePatients(debouncedSearch);
    const deletePatient = useDeletePatient();

    // Simple debounce
    let debounceTimer: ReturnType<typeof setTimeout>;
    const handleSearch = (val: string) => {
        setSearch(val);
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => setDebouncedSearch(val), 300);
    };

    const openCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const openEdit = (p: Patient) => {
        setEditing(p);
        setModalOpen(true);
    };

    const handleDelete = async (p: Patient) => {
        if (!confirm(`¿Eliminar a ${p.first_name} ${p.last_name}?`)) return;
        await deletePatient.mutateAsync(p.id);
    };

    return (
        <div className="page-patients">
            <div className="page-header">
                <h1>👥 Pacientes</h1>
                <button className="btn btn-primary" onClick={openCreate}>
                    <Plus size={18} />
                    Nuevo paciente
                </button>
            </div>

            {/* Search */}
            <div className="search-bar">
                <Search size={18} className="search-bar__icon" />
                <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="table-loading">Cargando pacientes...</div>
            ) : patients.length === 0 ? (
                <div className="table-empty">
                    <span>📋</span>
                    <p>No hay pacientes registrados</p>
                    <button className="btn btn-primary" onClick={openCreate}>
                        <Plus size={16} /> Agregar primer paciente
                    </button>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Teléfono</th>
                                <th>Email</th>
                                <th>Género</th>
                                <th>Registrado</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map((p) => (
                                <tr key={p.id}>
                                    <td className="td-name">
                                        {p.first_name} {p.last_name}
                                    </td>
                                    <td>{p.phone || "—"}</td>
                                    <td>{p.email || "—"}</td>
                                    <td>
                                        {p.gender === "male"
                                            ? "M"
                                            : p.gender === "female"
                                                ? "F"
                                                : p.gender || "—"}
                                    </td>
                                    <td>
                                        {new Date(p.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="td-actions">
                                        <button
                                            className="icon-btn"
                                            onClick={() => openEdit(p)}
                                            title="Editar"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            className="icon-btn icon-btn--danger"
                                            onClick={() => handleDelete(p)}
                                            title="Eliminar"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create / Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? "Editar paciente" : "Nuevo paciente"}
                width="540px"
            >
                <PatientForm
                    patient={editing}
                    onSuccess={() => setModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
