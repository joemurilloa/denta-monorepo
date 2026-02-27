import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { sileo } from 'sileo';

export interface Patient {
    id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email?: string;
    phone?: string;
    clinic_id: string;
}

/**
 * Hook for fetching all patients
 */
export const usePatients = () => {
    return useQuery({
        queryKey: ['patients'],
        queryFn: async () => {
            const res = await api.get<Patient[]>('/patients');
            return res.data;
        },
    });
};

/**
 * Hook for fetching a single patient by ID
 */
export const usePatient = (id: string | undefined) => {
    return useQuery({
        queryKey: ['patients', id],
        queryFn: async () => {
            const res = await api.get<Patient>(`/patients/${id}`);
            return res.data;
        },
        enabled: !!id,
    });
};

/**
 * Hook for creating a new patient
 */
export const useCreatePatient = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (patientData: Partial<Patient>) => {
            const res = await api.post<Patient>('/patients', patientData);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            sileo.success({
                title: 'Paciente creado',
                description: 'El paciente ha sido registrado correctamente.'
            });
        },
        onError: (error: any) => {
            sileo.error({
                title: 'Error',
                description: error.detail || 'No se pudo crear el paciente.'
            });
        }
    });
};

/**
 * Hook for updating a patient
 */
export const useUpdatePatient = (id: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (patientData: Partial<Patient>) => {
            const res = await api.patch<Patient>(`/patients/${id}`, patientData);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients', id] });
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            sileo.success({
                title: 'Paciente actualizado',
                description: 'Los datos del paciente han sido guardados.'
            });
        },
        onError: (error: any) => {
            sileo.error({
                title: 'Error',
                description: error.detail || 'No se pudo actualizar el paciente.'
            });
        }
    });
};
