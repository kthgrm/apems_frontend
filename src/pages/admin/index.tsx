import AppLayout from '@/layout/app-layout'
import type { BreadcrumbItem } from '@/types'

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
]

export default function AdminDashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                <div className="text-2xl font-bold">Welcome to the Admin Dashboard</div>
            </div>
        </AppLayout>
    )
}