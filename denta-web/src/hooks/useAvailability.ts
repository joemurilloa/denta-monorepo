import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface DoctorAvailability {
    id: string;
    doctor_id: string;
    clinic_id: string;
    working_days: number[];
    start_time: string;
    end_time: string;
    slot_duration_minutes: number;
    blocked_dates: string[];
}

export interface DoctorAvailabilityUpdate {
    working_days?: number[];
    start_time?: string;
    end_time?: string;
    slot_duration_minutes?: number;
    blocked_dates?: string[];
}

export interface TimeSlot {
    time: string;
    available: boolean;
}

export function useMyAvailability() {
    return useQuery<DoctorAvailability>({
        queryKey: ["availability", "me"],
        queryFn: () => api.get<DoctorAvailability>("/availability/me").then((res) => res.data),
    });
}

export function useUpdateAvailability() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: DoctorAvailabilityUpdate) =>
            api.put<DoctorAvailability>("/availability/me", body).then((res) => res.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["availability", "me"] });
        },
    });
}

export function useDoctorSlots(doctorId: string | undefined, date: string) {
    return useQuery<TimeSlot[]>({
        queryKey: ["availability", "slots", doctorId, date],
        queryFn: () =>
            api.get<TimeSlot[]>(`/availability/slots/${doctorId}?target_date=${date}`).then((res) => res.data),
        enabled: !!doctorId && !!date,
    });
}
