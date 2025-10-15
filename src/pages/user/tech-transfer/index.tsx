import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layout/app-layout'
import api from '@/lib/axios';
import type { Resolution, TechnologyTransfer } from '@/types';
import { Activity, Calendar, FileText, Folder, Plus } from 'lucide-react';
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { columns } from './columns';

export default function UserTechTransfer() {
    const [techTransfers, setTechTransfers] = useState<TechnologyTransfer[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchTechTransfers = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/tech-transfers');
            setTechTransfers(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch technology transfers:', error);
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        fetchTechTransfers();
    }, []);

    const ProjectActions = () => (
        <div className="flex items-center space-x-2">
            <Button asChild>
                <Link to="/user/technology-transfer/create" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span className='hidden lg:block'>Add New Project</span>
                </Link>
            </Button>
        </div>
    );

    const handleArchived = (id: number | string) => {
        setTechTransfers(prev => prev.filter(p => String(p.id) !== String(id)));
    };

    const breadcrumbs = [
        { title: 'Technology Transfers', href: '/user/technology-transfer' },
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                {isLoading ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        Loading technology transfers...
                    </div>
                ) : techTransfers && techTransfers.length > 0 ? (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-medium">Projects</h1>
                                <p className="text-muted-foreground">Manage your technology transfer projects</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="relative overflow-hidden group hover:shadow-md transition-shadow duration-200">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-blue-200/50" />
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                                    <CardTitle className="text-sm font-medium">
                                        Total Projects
                                    </CardTitle>
                                    <Folder className="h-4 w-4 text-blue-500" />
                                </CardHeader>
                                <CardContent className='relative z-10'>
                                    <div className="text-2xl font-bold text-blue-500">{techTransfers.length}</div>
                                    <p className="text-xs">
                                        Active projects
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Project List
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DataTable
                                    columns={columns(handleArchived)}
                                    data={techTransfers}
                                    searchKey="name"
                                    searchPlaceholder="Search projects..."
                                    actionComponent={<ProjectActions />}
                                />
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="col-span-full py-8 text-muted-foreground flex items-center justify-center flex-col gap-2">
                        <div>
                            No tech transfers found.
                        </div>
                        <Link to="/user/technology-transfer/create" className="font-semibold text-blue-500 hover:underline">
                            Create a new Tech Transfer.
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}