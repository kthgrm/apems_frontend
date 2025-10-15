import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layout/app-layout'
import api from '@/lib/axios';
import type { InternationalPartner } from '@/types';
import { Globe, Plus } from 'lucide-react';
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { columns } from './columns';

export default function UserInternationalPartners() {
    const [partners, setPartners] = useState<InternationalPartner[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchPartners = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/international-partners');
            setPartners(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch international partners:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, []);

    const PartnerActions = () => (
        <div className="flex items-center space-x-2">
            <Button asChild>
                <Link to="/user/international-partner/create" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span className='hidden lg:block'>Add New Partnership</span>
                </Link>
            </Button>
        </div>
    );

    const handleArchived = (id: number | string) => {
        setPartners(prev => prev.filter(p => String(p.id) !== String(id)));
    };

    const breadcrumbs = [
        { title: 'International Partners', href: '/user/international-partners' },
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                {isLoading ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        Loading international partners...
                    </div>
                ) : partners && partners.length > 0 ? (
                    <>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-medium">International Partners</h1>
                                <p className="text-muted-foreground">Manage your international partnerships</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="relative overflow-hidden group hover:shadow-md transition-shadow duration-200">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/50 to-emerald-200/50" />
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                                    <CardTitle className="text-sm font-medium">
                                        Total Partnership
                                    </CardTitle>
                                    <Globe className="h-4 w-4 text-emerald-500" />
                                </CardHeader>
                                <CardContent className='relative z-10'>
                                    <div className="text-2xl font-bold text-emerald-500">{partners.length}</div>
                                    <p className="text-xs">
                                        Partnerships recorded.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Partnership List
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DataTable
                                    columns={columns(handleArchived)}
                                    data={partners}
                                    searchKey="agency_partner"
                                    searchPlaceholder="Search partners..."
                                    actionComponent={<PartnerActions />}
                                />
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="col-span-full py-8 text-muted-foreground flex items-center justify-center flex-col gap-2">
                        <div>
                            No international partners found.
                        </div>
                        <Link to="/user/international-partner/create" className="font-semibold text-emerald-500 hover:underline">
                            Create a new Partnership.
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
