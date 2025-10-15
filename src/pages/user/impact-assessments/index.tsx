import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layout/app-layout'
import api from '@/lib/axios';
import type { ImpactAssessment } from '@/types';
import { Target, Plus } from 'lucide-react';
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { columns } from './columns';

export default function UserImpactAssessments() {
    const [assessments, setAssessments] = useState<ImpactAssessment[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchAssessments = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/impact-assessments');
            setAssessments(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch impact assessments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAssessments();
    }, []);

    const AssessmentActions = () => (
        <div className="flex items-center space-x-2">
            <Button asChild>
                <Link to="/user/impact-assessment/create" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span className='hidden lg:block'>Add New Assessment</span>
                </Link>
            </Button>
        </div>
    );

    const handleArchived = (id: number | string) => {
        setAssessments(prev => prev.filter(a => String(a.id) !== String(id)));
    };

    const breadcrumbs = [
        { title: 'Impact Assessments', href: '/user/impact-assessments' },
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                {isLoading ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        Loading impact assessments...
                    </div>
                ) : assessments && assessments.length > 0 ? (
                    <>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-medium">Impact Assessments</h1>
                                <p className="text-muted-foreground">Manage your impact assessments</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="relative overflow-hidden group hover:shadow-md transition-shadow duration-200">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-100/50 to-purple-200/50" />
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                                    <CardTitle className="text-sm font-medium">
                                        Total Assessments
                                    </CardTitle>
                                    <Target className="h-4 w-4 text-purple-500" />
                                </CardHeader>
                                <CardContent className='relative z-10'>
                                    <div className="text-2xl font-bold text-purple-500">{assessments.length}</div>
                                    <p className="text-xs">
                                        Active assessments
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Assessment List
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DataTable
                                    columns={columns(handleArchived)}
                                    data={assessments}
                                    searchKey="project_name"
                                    searchPlaceholder="Search by project name..."
                                    actionComponent={<AssessmentActions />}
                                />
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="col-span-full py-8 text-muted-foreground flex items-center justify-center flex-col gap-2">
                        <div>
                            No impact assessments found.
                        </div>
                        <Link to="/user/impact-assessments/create" className="font-semibold text-purple-500 hover:underline">
                            Create a new Assessment.
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
