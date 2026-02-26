import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface Patient {
    id: string;
    clinic_id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string | null;
    gender: "male" | "female" | "other" | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    insurance_provider: string | null;
    insurance_number: string | null;
    allergies: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string | null;
}

export interface PatientCreate {
    first_name: string;
    last_name: string;
    date_of_birth?: string;
    gender?: string;
    phone?: string;
    email?: string;
    address?: string;
    insurance_provider?: string;
    insurance_number?: string;
    allergies?: string;
    notes?: string;
}

export type PatientUpdate = Partial<PatientCreate>;

export function usePatients(search?: string) {
    return useQuery<Patient[]>({
        queryKey: ["patients", search],
        queryFn: async () => {
            const params = search ? `?search=${encodeURIComponent(search)}` : "";
            const { data } = await api.get<Patient[]>(`/patients/${params}`);
            return data;
        },
    });
}

export function useCreatePatient() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: PatientCreate) =>
            api.post<Patient>("/patients/", body).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["patients"] });
        },
    });
}

export function useUpdatePatient() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...body }: PatientUpdate & { id: string }) =>
            api.patch<Patient>(`/patients/${id}`, body).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["patients"] });
        },
    });
}

export function useDeletePatient() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.delete(`/patients/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["patients"] });
        },
    });
}
