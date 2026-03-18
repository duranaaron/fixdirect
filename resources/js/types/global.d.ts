import type { Auth } from '@/types/auth';
import type Echo from 'laravel-echo';

declare global {
    interface Window {
        Pusher: typeof import('pusher-js').default;
        Echo: Echo;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            unreadConversationsCount: number;
            [key: string]: unknown;
        };
    }
}
