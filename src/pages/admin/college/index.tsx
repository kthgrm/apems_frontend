import { DataTable } from '@/components/data-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AppLayout from '@/layout/app-layout'
import api from '@/lib/axios'
import { asset } from '@/lib/utils'
import type { BreadcrumbItem, Campus, College } from '@/types'
import { Building, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { columns } from './columns'

export default function College() {
    const [colleges, setColleges] = useState<College[]>([]);
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchParams] = useSearchParams();

    const campusId = searchParams.get('campus');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            if (!campusId) {
                try {
                    const res = await api.get('/campuses');
                    setCampuses(res.data.data);
                } catch (error) {
                    console.error("Failed to fetch data:", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                try {
                    const res = await api.get(`/relationships/campuses/${campusId}/colleges`);
                    setSelectedCampus(res.data.campus);
                    setColleges(res.data.data);
                } catch (error) {
                    console.error("Failed to fetch data:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        }

        fetchData();
    }, [campusId]);

    const onDelete = (deletedCollegeId: number | string) => {
        setColleges((prevColleges) => prevColleges.filter(college => college.id !== deletedCollegeId));
    }

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'College', href: '/admin/college' },
    ]

    if (campusId) {
        return (
            <AppLayout breadcrumbs={breadcrumbs} >
                {isLoading ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        Loading colleges...
                    </div>
                ) : (
                    selectedCampus ? (
                        <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div>
                                        <h1 className="text-2xl font-semibold">{selectedCampus?.name} Campus</h1>
                                        <p className="text-muted-foreground">
                                            Manage colleges for this campus
                                        </p>
                                    </div>
                                </div>
                                <Button asChild className='bg-blue-500 hover:bg-blue-600'>
                                    <Link to={`/admin/college/create?campus=${selectedCampus?.id}`}>
                                        <Plus className="h-4 w-4" />
                                        Add College
                                    </Link>
                                </Button>
                            </div>

                            {/* Data Table */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Colleges List</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <DataTable
                                        columns={columns(onDelete)}
                                        data={colleges}
                                        searchKey="name"
                                        searchPlaceholder="Search colleges..."
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="col-span-full text-center py-8 text-muted-foreground">
                            <p>Campus not found.</p>
                        </div>
                    )
                )}
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                {isLoading ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        Loading campuses...
                    </div>
                ) : campuses && campuses.length > 0 ? (
                    <>
                        <h1 className="text-2xl font-bold">Campus</h1>
                        <div className="grid auto-rows-min gap-4 md:grid-cols-3 lg:grid-cols-4">
                            {campuses.map((campus) => (
                                <Card key={campus.id} className="hover:shadow-lg transition-shadow duration-200">
                                    <Link to={`/admin/college?campus=${campus.id}`}>
                                        <CardContent className="p-6">
                                            <div className="flex flex-col items-center gap-3">
                                                <Avatar className="size-24">
                                                    <AvatarImage src={asset(campus.logo)} alt="College logo" />
                                                    <AvatarFallback><Building className='p-0.5' /></AvatarFallback>
                                                </Avatar>
                                                <span className='text-lg font-medium'>{campus.name}</span>
                                            </div>
                                        </CardContent>
                                    </Link>
                                </Card>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        <p>No campuses found.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}