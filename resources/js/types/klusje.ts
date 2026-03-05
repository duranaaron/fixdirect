import { User } from './auth';

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
};
