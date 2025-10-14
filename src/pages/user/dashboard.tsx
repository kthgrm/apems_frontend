import AppLayout from "@/layout/app-layout";

export default function UserDashboard() {
    const breadcrumbs = [
        { title: 'Dashboard', href: '/user/dashboard' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                <div className="text-2xl font-bold">Welcome to the User Dashboard</div>
            </div>
        </AppLayout>
    )
}