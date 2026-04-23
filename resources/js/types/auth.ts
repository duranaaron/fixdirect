export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    profile_photo_path?: string | null;
    bio?: string | null;
    location?: string | null;
    phone?: string | null;
    rating_avg?: string | null;
    rating_count?: number;
    is_admin?: boolean;
    suspended_at?: string | null;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
