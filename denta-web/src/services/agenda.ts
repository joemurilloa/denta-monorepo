import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

/**
 * Hook for fetching public availability for a clinic
 */
export const usePublicAvailability = (slug: string | undefined) => {
    return useQuery({
        queryKey: ['public-availability', slug],
        queryFn: async () => {
            const res = await api.get(`/agenda/${slug}`);
            return res.data;
        },
        enabled: !!slug,
    });
};

/**
 * Hook for getting configured availability slots (doctor view)
 */
export const useConfiguredAvailability = () => {
    return useQuery({
        queryKey: ['agenda-config'],
        queryFn: async () => {
            const res = await api.get('/agenda/config');
            return res.data;
        },
    });
};
