import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAuthStore } from "../stores/auth";

export interface Clinic {
    id: string;
    owner_id: string;
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    logo_url: string | null;
    created_at: string;
    updated_at: string | null;
}

export interface ClinicCreate {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
}

// ... rest of the file stays same

export function useMyClinic() {
    const { session } = useAuthStore();
    return useQuery<Clinic | null>({
        queryKey: ["clinic", "me"],
        queryFn: async () => {
            try {
                const { data } = await api.get<Clinic | null>("/clinics/me");
                return data;
            } catch (err) {
                console.error("Error fetching clinic:", err);
                return null;
            }
        },
        enabled: !!session,
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });
}

export function useCreateClinic() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: ClinicCreate) =>
            api.post<Clinic>("/clinics", body).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["clinic"] });
        },
    });
}
