import type { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin-sidebar';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Props {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AdminLayout({ children, breadcrumbs }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:flex-row md:p-6">
                <aside className="md:w-56 md:shrink-0">
                    <AdminSidebar />
                </aside>
                <main className="min-w-0 flex-1">{children}</main>
            </div>
        </AppLayout>
    );
}
