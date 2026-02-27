import supabase from './supabase';

export const authService = {
    async login(email: string, password: string) {
        return await supabase.auth.signInWithPassword({ email, password });
    },

    async signup(email: string, password: string, metadata: any = {}) {
        return await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        });
    },

    async logout() {
        return await supabase.auth.signOut();
    },

    async getSession() {
        const { data } = await supabase.auth.getSession();
        return data.session;
    },

    async getUser() {
        const { data } = await supabase.auth.getUser();
        return data.user;
    }
};
