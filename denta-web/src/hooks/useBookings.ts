import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface Booking {
    id: string;
    clinic_id: string;
    doctor_id: string;
    patient_name: string;
    patient_phone: string;
    reason?: string;
    requested_date: string;
    requested_time: string;
    status: "pending" | "confirmed" | "rejected";
    created_at: string;
    clinic_name?: string;
    clinic_address?: string;
}

export interface BookingCreate {
    doctor_id: string;
    patient_name: string;
    patient_phone: string;
    reason?: string;
    requested_date: string;
    requested_time: string;
}

export function useMyBookings() {
    return useQuery<Booking[]>({
        queryKey: ["bookings", "me"],
        queryFn: () => api.get<Booking[]>("/bookings/me").then((res) => res.data),
    });
}

export function useCreateBooking() {
    return useMutation({
        mutationFn: (body: BookingCreate) =>
            api.post<Booking>("/bookings", body).then((res) => res.data),
    });
}

export function useUpdateBookingStatus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: "confirmed" | "rejected" }) =>
            api.patch<Booking>(`/bookings/${id}`, { status }).then((res) => res.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["bookings", "me"] });
            qc.invalidateQueries({ queryKey: ["appointments"] });
            qc.invalidateQueries({ queryKey: ["patients"] });
        },
    });
}
