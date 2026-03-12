import { User } from './auth';

// 1. We definiëren eerst wat een afbeelding precies is
export type KlusjeImage = {
    id: number;
    klusje_id: number;
    image_path: string;
    is_primary: boolean;
    created_at: string;
    updated_at: string;
};

export type Klusje = {
    id: number;
    user_id: number;
    title: string;
    category: string;
    location: string;
    date: string;
    compensation: string;
    description: string;
    status: string;
    created_at: string;
    updated_at: string;
    user?: User;
    images?: KlusjeImage[]; 
};