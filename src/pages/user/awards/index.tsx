import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layout/app-layout'
import api from '@/lib/axios';
import type { Award } from '@/types';
import { Trophy, Plus } from 'lucide-react';
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { columns } from './columns';

export default function UserAwards() {
    const [awards, setAwards] = useState<Award[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchAwards = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('user/awards');
            setAwards(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch awards:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAwards();
    }, []);

    const AwardActions = () => (
        <div className="flex items-center space-x-2">
            <Button asChild>
                <Link to="/user/awards-recognition/create" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span className='hidden lg:block'>Add New Award</span>
                </Link>
            </Button>
        </div>
    );

    const handleArchived = (id: number | string) => {
        setAwards(prev => prev.filter(a => String(a.id) !== String(id)));
    };

    const breadcrumbs = [
        { title: 'Awards & Recognitions', href: '/user/awards-recognition' },
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                {isLoading ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        Loading awards...
                    </div>
                ) : awards && awards.length > 0 ? (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-medium">Awards & Recognitions</h1>
                                <p className="text-muted-foreground">Manage your awards and recognitions</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="relative overflow-hidden group hover:shadow-md transition-shadow duration-200 text-white">
                                <div className="absolute inset-0 bg-gradient-to-b from-amber-300 to-yellow-400" />
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                                    <CardTitle className="text-sm font-medium">
                                        Total
                                    </CardTitle>
                                    <Trophy className="h-4 w-4" />
                                </CardHeader>
                                <CardContent className='relative z-10'>
                                    <div className="text-2xl font-bold">{awards.length}</div>
                                    <p className="text-xs">
                                        Submitted awards
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Award List
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DataTable
                                    columns={columns(handleArchived)}
                                    data={awards}
                                    searchKey="award_name"
                                    searchPlaceholder="Search awards..."
                                    actionComponent={<AwardActions />}
                                />
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="col-span-full py-8 text-muted-foreground flex items-center justify-center flex-col gap-2">
                        <div>
                            No awards found.
                        </div>
                        <Link to="/user/awards-recognition/create" className="font-semibold text-amber-500 hover:underline">
                            Create a new Award.
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
