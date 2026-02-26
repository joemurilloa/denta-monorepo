import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthState {
    session: Session | null;
    user: User | null;
    loading: boolean;
    initialized: boolean;

    initialize: () => void;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, fullName: string) => Promise<void>;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    session: null,
    user: null,
    loading: true,
    initialized: false,

    initialize: () => {
        if (get().initialized) return;

        // Get current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            set({
                session,
                user: session?.user ?? null,
                loading: false,
                initialized: true,
            });
        });

        // Listen for auth changes
        supabase.auth.onAuthStateChange((_event, session) => {
            set({
                session,
                user: session?.user ?? null,
                loading: false,
            });
        });
    },

    signIn: async (email, password) => {
        set({ loading: true });
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            set({ loading: false });
            throw error;
        }

        set({
            session: data.session,
            user: data.user,
            loading: false,
        });
    },

    signUp: async (email, password, fullName) => {
        set({ loading: true });
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
            },
        });

        if (error) {
            set({ loading: false });
            throw error;
        }

        set({
            session: data.session,
            user: data.user,
            loading: false,
        });
    },

    signOut: async () => {
        set({ loading: true });
        await supabase.auth.signOut();
        set({ session: null, user: null, loading: false });
    },
}));
