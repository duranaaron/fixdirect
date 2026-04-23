import type { User } from './auth';
import type { Klusje } from './klusje';

export type Message = {
    id: number;
    conversation_id: number;
    user_id: number;
    body: string;
    read_at: string | null;
    created_at: string;
    updated_at: string;
    user?: Pick<User, 'id' | 'name'>;
};

export type PriceProposal = {
    id: number;
    conversation_id: number;
    user_id: number;
    amount: string;
    scheduled_at: string;
    status: 'pending' | 'accepted' | 'declined';
    responded_at: string | null;
    created_at: string;
    updated_at: string;
    user?: Pick<User, 'id' | 'name'>;
};

export type Conversation = {
    id: number;
    klusje_id: number;
    starter_id: number;
    owner_id: number;
    created_at: string;
    updated_at: string;
    klusje?: Pick<Klusje, 'id' | 'title'>;
    starter?: Pick<User, 'id' | 'name'>;
    owner?: Pick<User, 'id' | 'name'>;
    latest_message?: Message;
    unread_count?: number;
    price_proposals?: PriceProposal[];
};

