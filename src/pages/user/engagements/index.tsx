import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layout/app-layout'
import api from '@/lib/axios';
import type { Engagement } from '@/types';
import { Globe, Plus } from 'lucide-react';
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { columns } from './columns';

export default function UserEngagements() {
    const [engagements, setEngagements] = useState<Engagement[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchEngagements = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('user/engagements');
            setEngagements(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch engagements:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEngagements();
    }, []);

    const EngagementActions = () => (
        <div className="flex items-center space-x-2">
            <Button asChild>
                <Link to="/user/engagements/create" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span className='hidden lg:block'>New Engagement</span>
                </Link>
            </Button>
        </div>
    );

    const handleArchived = (id: number | string) => {
        setEngagements(prev => prev.filter(p => String(p.id) !== String(id)));
    };

    const breadcrumbs = [
        { title: 'Engagements', href: '/user/engagements' },
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                {isLoading ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        Loading engagements...
                    </div>
                ) : engagements && engagements.length > 0 ? (
                    <>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-medium">Engagements</h1>
                                <p className="text-muted-foreground">Manage your engagements</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="relative overflow-hidden group hover:shadow-md transition-shadow duration-200 text-white">
                                <div className="absolute inset-0 bg-gradient-to-b from-emerald-400 to-green-600" />
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                                    <CardTitle className="text-sm font-medium">
                                        Total
                                    </CardTitle>
                                    <Globe className="h-4 w-4" />
                                </CardHeader>
                                <CardContent className='relative z-10'>
                                    <div className="text-2xl font-bold">{engagements.length}</div>
                                    <p className="text-xs">
                                        Submitted Engagements
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Engagement List
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DataTable
                                    columns={columns(handleArchived)}
                                    data={engagements}
                                    searchKey="agency_partner"
                                    searchPlaceholder="Search partners..."
                                    actionComponent={<EngagementActions />}
                                />
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="col-span-full py-8 text-muted-foreground flex items-center justify-center flex-col gap-2">
                        <div>
                            No engagements found.
                        </div>
                        <Link to="/user/engagements/create" className="font-semibold text-emerald-500 hover:underline">
                            Create a new Engagement.
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
