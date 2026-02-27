import { useState } from "react";
import { Search, Plus, Pencil, Trash2, ChevronRight, Users } from "lucide-react";
import {
    usePatients,
    useDeletePatient,
    type Patient,
} from "../../hooks/usePatients";
import Modal from "../../components/ui/Modal";
import PatientForm from "./PatientForm";
import EmptyState from "../../components/ui/EmptyState";

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

    const openEdit = (e: React.MouseEvent, p: Patient) => {
        e.stopPropagation();
        setEditing(p);
        setModalOpen(true);
    };

    const handleDelete = async (e: React.MouseEvent, p: Patient) => {
        e.stopPropagation();
        if (!confirm(`¿Eliminar a ${p.first_name} ${p.last_name}?`)) return;
        await deletePatient.mutateAsync(p.id);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Content is handled by Topbar, but search/action bar is here */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface p-2 pr-4 pl-4 rounded-card border border-border shadow-premium sticky top-[72px] z-20 backdrop-blur-md bg-surface/90">
                <div className="relative w-full sm:max-w-md">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        className="w-full pl-10 pr-4 py-2 bg-transparent text-sm focus:outline-none placeholder:text-text-tertiary"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
                <button className="btn btn-primary w-full sm:w-auto" onClick={openCreate}>
                    <Plus size={18} className="mr-2" />
                    Nuevo paciente
                </button>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="flex flex-col items-center py-20 gap-3">
                    <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
                    <p className="text-sm font-medium text-text-secondary">Cargando pacientes...</p>
                </div>
            ) : patients.length === 0 ? (
                <div className="py-20">
                    <EmptyState
                        icon={Users}
                        title="Sin resultados"
                        description={search ? `No encontramos pacientes que coincidan con "${search}"` : "Aún no tienes pacientes registrados en tu clínica."}
                        action={!search && <button className="btn btn-primary" onClick={openCreate}>Agregar primer paciente</button>}
                    />
                </div>
            ) : (
                <div className="grid gap-3">
                    {patients.map((p) => (
                        <div
                            key={p.id}
                            className="group flex flex-col md:flex-row md:items-center justify-between p-4 bg-surface border border-border rounded-card hover:bg-subtle transition-all cursor-pointer shadow-premium hover:shadow-md"
                            onClick={() => {/* Navigate to detail */ }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-accent-light text-accent flex items-center justify-center font-bold border border-accent/10 shrink-0">
                                    {(p.first_name?.charAt(0) || '') + (p.last_name?.charAt(0) || '')}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
                                        {p.first_name} {p.last_name}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <p className="text-xs text-text-secondary font-medium">{p.phone || "Sin teléfono"}</p>
                                        <span className="w-1 h-1 rounded-full bg-border" />
                                        <p className="text-xs text-text-secondary font-medium truncate">{p.email || "Sin correo"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-6 mt-4 md:mt-0 border-t md:border-t-0 border-border pt-4 md:pt-0">
                                <div className="flex flex-col items-end md:items-center">
                                    <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Registrado</p>
                                    <p className="text-xs font-mono font-medium text-text-secondary mt-0.5">
                                        {new Date(p.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        className="p-2 text-text-tertiary hover:text-accent hover:bg-accent-light rounded-button transition-all"
                                        onClick={(e) => openEdit(e, p)}
                                        title="Editar"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        className="p-2 text-text-tertiary hover:text-danger hover:bg-danger/5 rounded-button transition-all"
                                        onClick={(e) => handleDelete(e, p)}
                                        title="Eliminar"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <span className="w-px h-4 bg-border mx-1 hidden md:block" />
                                    <ChevronRight size={18} className="text-text-tertiary group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create / Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? "Editar paciente" : "Nuevo paciente"}
                width="540px"
            >
                <div className="p-2">
                    <PatientForm
                        patient={editing}
                        onSuccess={() => setModalOpen(false)}
                    />
                </div>
            </Modal>
        </div>
    );
}
