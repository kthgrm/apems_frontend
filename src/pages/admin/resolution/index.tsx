import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layout/app-layout'
import api from '@/lib/axios';
import type { Resolution } from '@/types';
import { Activity, Calendar, FileText, Plus } from 'lucide-react';
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { columns } from './columns';

export default function Resolution() {
    const [resolutions, setResolutions] = useState<Resolution[]>([]);
    const [isLoading, setisLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setisLoading(true);
            try {
                const response = await api.get(`/resolutions`);
                setResolutions(response.data.data);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setisLoading(false);
            }
        }

        fetchData();
    }, []);

    const handleArchived = (id: number | string) => {
        setResolutions(prev => prev.filter(r => String(r.id) !== String(id)));
    };

    const expiredCount = resolutions.filter(r => new Date(r.expiration) < new Date()).length;
    const expiringSoonCount = resolutions.filter(r => {
        const expirationDate = new Date(r.expiration);
        const currentDate = new Date();
        return !((expirationDate < currentDate)) && (expirationDate.getTime() - currentDate.getTime()) < (30 * 24 * 60 * 60 * 1000);
    }).length;
    const activeCount = resolutions.length - expiredCount - expiringSoonCount;

    const breadcrumbs = [
        { title: 'Resolution', href: '/admin/resolution' },
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                {isLoading ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        Loading resolutions...
                    </div>
                ) : resolutions && resolutions.length > 0 ? (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold">Resolutions</h1>
                                <p className="text-gray-600">
                                    Manage and track all project resolutions
                                </p>
                            </div>
                            <Button asChild>
                                <Link to="/admin/resolution/create">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Resolution
                                </Link>
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Resolutions</CardTitle>
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{resolutions.length}</div>
                                    <p className="text-xs text-muted-foreground">All resolutions</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active</CardTitle>
                                    <Activity className="h-4 w-4 text-green-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">{activeCount}</div>
                                    <p className="text-xs text-muted-foreground">Currently active</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                                    <Calendar className="h-4 w-4 text-yellow-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-yellow-600">{expiringSoonCount}</div>
                                    <p className="text-xs text-muted-foreground">Within 30 days</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Expired</CardTitle>
                                    <Calendar className="h-4 w-4 text-red-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-600">{expiredCount}</div>
                                    <p className="text-xs text-muted-foreground">Past expiration</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Data Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Resolution List</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DataTable
                                    columns={columns(handleArchived)}
                                    data={resolutions}
                                    searchKey="resolution_number"
                                    searchPlaceholder="Search resolutions..."
                                />
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        No resolutions found.
                    </div>
                )}
            </div>
        </AppLayout>
    )
}