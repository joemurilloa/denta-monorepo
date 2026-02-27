import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface Appointment {
    id: string;
    clinic_id: string;
    patient_id: string;
    dentist_id: string;
    date_time: string;
    duration_minutes: number;
    treatment_type: string | null;
    notes: string | null;
    status: AppointmentStatus;
    created_at: string;
    updated_at: string | null;
}

export type AppointmentStatus =
    | "scheduled"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "no_show";

export interface AppointmentCreate {
    patient_id: string;
    dentist_id: string;
    date_time: string;
    duration_minutes?: number;
    treatment_type?: string;
    notes?: string;
    status?: AppointmentStatus;
}

export type AppointmentUpdate = Partial<AppointmentCreate>;

export interface AppointmentFilters {
    date_from?: string;
    date_to?: string;
    status?: AppointmentStatus;
}

export function useAppointments(filters?: AppointmentFilters) {
    return useQuery<Appointment[]>({
        queryKey: ["appointments", filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters?.date_from) params.set("date_from", filters.date_from);
            if (filters?.date_to) params.set("date_to", filters.date_to);
            if (filters?.status) params.set("status", filters.status);
            const qs = params.toString();
            const { data } = await api.get<Appointment[]>(
                `/appointments${qs ? `?${qs}` : ""}`
            );
            return data;
        },
    });
}

export function useCreateAppointment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: AppointmentCreate) =>
            api.post<Appointment>("/appointments", body).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["appointments"] });
        },
    });
}

export function useUpdateAppointment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...body }: AppointmentUpdate & { id: string }) =>
            api.patch<Appointment>(`/appointments/${id}`, body).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["appointments"] });
        },
    });
}

export function useDeleteAppointment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.delete(`/appointments/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["appointments"] });
        },
    });
}
