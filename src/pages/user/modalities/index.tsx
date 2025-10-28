import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layout/app-layout'
import api from '@/lib/axios';
import type { Modalities } from '@/types';
import { Radio, Plus } from 'lucide-react';
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { columns } from './columns';

export default function UserModalities() {
    const [modalities, setModalities] = useState<Modalities[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchModalities = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/modalities');
            setModalities(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch modalities:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchModalities();
    }, []);

    const ModalityActions = () => (
        <div className="flex items-center space-x-2">
            <Button asChild>
                <Link to="/user/modalities/create" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span className='hidden lg:block'>Add New Modality</span>
                </Link>
            </Button>
        </div>
    );

    const handleArchived = (id: number | string) => {
        setModalities(prev => prev.filter(m => String(m.id) !== String(id)));
    };

    const breadcrumbs = [
        { title: 'Modalities', href: '/user/modalities' },
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                {isLoading ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        Loading modalities...
                    </div>
                ) : modalities && modalities.length > 0 ? (
                    <>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-medium">Project Modalities</h1>
                                <p className="text-muted-foreground">Manage your project delivery modalities</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <Card className="relative overflow-hidden group hover:shadow-md transition-shadow duration-200 text-white">
                                <div className="absolute inset-0 bg-gradient-to-b from-amber-400 to-orange-600" />
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                                    <CardTitle className="text-sm font-medium">
                                        Total Modalities
                                    </CardTitle>
                                    <Radio className="h-4 w-4" />
                                </CardHeader>
                                <CardContent className='relative z-10'>
                                    <div className="text-2xl font-bold">{modalities.length}</div>
                                    <p className="text-xs">
                                        Project delivery modalities
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Modality List
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DataTable
                                    columns={columns(handleArchived)}
                                    data={modalities}
                                    searchKey="modality"
                                    searchPlaceholder="Search modalities..."
                                    actionComponent={<ModalityActions />}
                                />
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="col-span-full py-8 text-muted-foreground flex items-center justify-center flex-col gap-2">
                        <div>
                            No modalities found.
                        </div>
                        <Link to="/user/modalities/create" className="font-semibold text-cyan-500 hover:underline">
                            Create a new Modality.
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
