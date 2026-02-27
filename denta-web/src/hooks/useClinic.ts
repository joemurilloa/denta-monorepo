import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

interface Clinic {
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

interface ClinicCreate {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
}

export function useMyClinic() {
    return useQuery<Clinic | null>({
        queryKey: ["clinic", "me"],
        queryFn: async () => {
            try {
                const { data } = await api.get<Clinic | null>("/clinics/me");
                return data;
            } catch {
                return null;
            }
        },
        staleTime: 1000 * 30, // 30 seconds
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
