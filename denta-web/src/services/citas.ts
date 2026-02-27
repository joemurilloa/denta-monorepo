import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { sileo } from 'sileo';

export interface Appointment {
    id: string;
    patient_id: string;
    patient_name?: string;
    clinic_id: string;
    date_time: string;
    treatment_type?: string;
    duration_minutes: number;
    status: 'scheduled' | 'confirmed' | 'cancelled' | 'in_progress' | 'completed';
    notes?: string;
}

/**
 * Hook for fetching appointments
 */
export const useAppointments = (filters: any = {}) => {
    return useQuery({
        queryKey: ['appointments', filters],
        queryFn: async () => {
            const res = await api.get<Appointment[]>('/appointments');
            return res.data;
        },
    });
};

/**
 * Hook for fetching a single appointment
 */
export const useAppointment = (id: string | undefined) => {
    return useQuery({
        queryKey: ['appointments', id],
        queryFn: async () => {
            const res = await api.get<Appointment>(`/appointments/${id}`);
            return res.data;
        },
        enabled: !!id,
    });
};

/**
 * Hook for creating an appointment
 */
export const useCreateAppointment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (appointmentData: Partial<Appointment>) => {
            const res = await api.post<Appointment>('/appointments', appointmentData);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            sileo.success({
                title: 'Cita programada',
                description: 'La cita ha sido agendada con éxito.'
            });
        },
        onError: (error: any) => {
            sileo.error({
                title: 'Error',
                description: error.detail || 'No se pudo programar la cita.'
            });
        }
    });
};

/**
 * Hook for updating appointment status (confirm/reject)
 */
export const useUpdateAppointmentStatus = (id: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (status: string) => {
            const res = await api.patch<Appointment>(`/appointments/${id}`, { status });
            return res.data;
        },
        onSuccess: (_, status) => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            sileo.success({
                title: 'Cita actualizada',
                description: `La cita ha sido ${status === 'confirmed' ? 'confirmada' : 'rechazada'}.`
            });
        },
        onError: (error: any) => {
            sileo.error({
                title: 'Error',
                description: error.detail || 'No se pudo actualizar la cita.'
            });
        }
    });
};
