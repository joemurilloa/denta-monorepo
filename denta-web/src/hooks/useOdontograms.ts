import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface ToothSurface {
    oclusal: string;
    mesial: string;
    distal: string;
    vestibular: string;
    lingual: string;
}

export interface Odontogram {
    id: string;
    patient_id: string;
    clinic_id: string;
    visit_date: string;
    teeth: Record<string, Partial<ToothSurface>>;
    notes: string;
    created_at: string;
}

export interface OdontogramCreate {
    patient_id: string;
    visit_date: string;
    teeth: Record<string, Partial<ToothSurface>>;
    notes?: string;
}

export function usePatientOdontograms(patientId: string | undefined) {
    return useQuery<Odontogram[]>({
        queryKey: ["odontograms", patientId],
        queryFn: () => api.get<Odontogram[]>(`/odontograms/patient/${patientId}`).then((res) => res.data),
        enabled: !!patientId,
    });
}

export function useCreateOdontogram() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: OdontogramCreate) =>
            api.post<Odontogram>("/odontograms", body).then((res) => res.data),
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: ["odontograms", data.patient_id] });
        },
    });
}
