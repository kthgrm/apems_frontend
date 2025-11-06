import { DataTable } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AppLayout from '@/layout/app-layout'
import api from '@/lib/axios'
import type { BreadcrumbItem, Campus } from '@/types'
import { Plus, School } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { columns } from './columns'

export default function Campus() {
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await api.get('/campuses');
                setCampuses(res.data.data);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    const onDelete = (deletedCampusId: number | string) => {
        setCampuses((prevCampuses) => prevCampuses.filter(campus => campus.id !== deletedCampusId));
    }

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Campus', href: '/admin/campus' },
    ]

    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                {isLoading ? (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                        Loading campuses...
                    </div>
                ) : campuses && campuses.length > 0 ? (
                    <>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-semibold">Campus Management</h1>
                            </div>
                        </div>

                        {/* Stats Card */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Campus</CardTitle>
                                    <School className="h-4 text-stone-600" />
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {campuses.length}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Data Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    Campus List
                                    <Button asChild className='bg-blue-500 hover:bg-blue-600'>
                                        <Link to="/admin/campus/create">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Campus
                                        </Link>
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DataTable
                                    columns={columns(onDelete)}
                                    data={campuses}
                                    searchKey="name"
                                    searchPlaceholder="Search campus..."
                                />
                            </CardContent>
                        </Card>
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