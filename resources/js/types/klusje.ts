import type { User } from './auth';

export type KlusjeImage = {
    id: number;
    klusje_id: number;
    image_path: string;
    is_primary: boolean;
    created_at: string;
    updated_at: string;
};

export type KlusjeStatus = 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export type Klusje = {
    id: number;
    user_id: number;
    assigned_klusser_id?: number | null;
    title: string;
    category: string;
    location: string;
    date: string;
    compensation: string;
    description: string;
    status: KlusjeStatus;
    completed_at?: string | null;
    cancelled_at?: string | null;
    created_at: string;
    updated_at: string;
    user?: User;
    assigned_klusser?: User | null;
    images?: KlusjeImage[];
};
