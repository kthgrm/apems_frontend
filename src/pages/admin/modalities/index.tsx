import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/axios";
import { asset } from "@/lib/utils";
import type { College as BaseCollege, Campus as BaseCampus, BreadcrumbItem } from "@/types";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Building, Globe, Radio, Tv } from "lucide-react";
import AppLayout from "@/layout/app-layout";
import { DataTable } from "@/components/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { columns } from "./columns";


type College = BaseCollege & {
    modalities_count: number;
};

type Campus = BaseCampus & {
    modalities_count: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Modality',
        href: '/admin/modalities',
    },
]

export default function Modality() {
    const [colleges, setColleges] = useState<College[]>([]);
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);
    const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
    const [modalities, setModalities] = useState<any[]>([]);
    const [totalModalities, setTotalModalities] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [invalidSelection, setInvalidSelection] = useState(false);
    const [searchParams] = useSearchParams();

    // Extract multiple parameters
    const campusId = searchParams.get('campus');
    const collegeId = searchParams.get('college');

    useEffect(() => {
        const getCampusCollege = async (collegeIdParam: string | null) => {
            try {
                const collegeRes = await api.get(`/colleges/${collegeIdParam}`);
                const collegeData = collegeRes.data.data;

                // Ensure the college has a campus and it matches the provided campusId
                if (!collegeData || !collegeData.campus || String(collegeData.campus.id) !== String(campusId)) {
                    return { valid: false };
                }

                return { valid: true, college: collegeData, campus: collegeData.campus };
            } catch (error) {
                return { valid: false };
            }
        };

        const fetchData = async () => {
            setIsLoading(true);
            try {
                if (!campusId) {
                    // Fetch all campuses if no campus is selected
                    const res = await api.get(`/campuses`);
                    // console.log(res.data.data);
                    setCampuses(res.data.data);
                } else {
                    const res = await api.get(`/relationships/campuses/${campusId}/colleges`);
                    // console.log(res.data.data);
                    setColleges(res.data.data);

                    try {
                        if (collegeId) {
                            setIsLoading(true);

                            // Validate that the college belongs to the campus
                            const validation = await getCampusCollege(collegeId);
                            if (!validation.valid) {
                                setInvalidSelection(true);
                                setSelectedCollege(null);
                                setSelectedCampus(null);
                                setModalities([]);
                                setTotalModalities(0);
                            } else {
                                setInvalidSelection(false);
                                setSelectedCollege(validation.college);
                                setSelectedCampus(validation.campus);

                                // Fetch modalities for the validated college and campus
                                const modalitiesRes = await api.get(`/modalities`, {
                                    params: {
                                        college_id: collegeId,
                                        campus: campusId,
                                    }
                                });
                                console.log(modalitiesRes);
                                setModalities(modalitiesRes.data.data);
                                setTotalModalities(modalitiesRes.data.data.length);
                            }
                        }
                    } catch (error) {
                        console.error("Failed to fetch modalities:", error);
                        setInvalidSelection(true);
                        setModalities([]);
                        setTotalModalities(0);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [campusId, collegeId]);

    const handleArchived = (id: number | string) => {
        setModalities(prev => prev.filter(p => String(p.id) !== String(id)));
        setTotalModalities(prev => Math.max(0, prev - 1));
    };

    const tvCount = modalities.filter(modality => modality.tv_channel).length;
    const radioCount = modalities.filter(modality => modality.radio).length;
    const onlineCount = modalities.filter(modality => modality.online_link).length;

    if (campusId && collegeId) {
        return (
            <AppLayout breadcrumbs={breadcrumbs} >
                {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Loading Modalities...
                    </div>
                ) : (
                    invalidSelection ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>Invalid campus or college selection.</p>
                        </div>
                    ) : (selectedCampus && selectedCollege ? (
                        <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                            <Card className="bg-gradient-to-t from-amber-500/80 to-red-700/80 text-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="h-5 w-5" />
                                        Department
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex items-start gap-3">
                                            {selectedCampus?.logo && (
                                                <Avatar className="size-12">
                                                    <AvatarImage src={asset(selectedCampus.logo)} alt="Campus logo" />
                                                    <AvatarFallback><Building className='p-0.5' /></AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div>
                                                <h3 className="font-semibold text-lg">{selectedCampus?.name}</h3>
                                                <p className="text-sm">Campus</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            {selectedCollege?.logo && (
                                                <Avatar className="size-12">
                                                    <AvatarImage src={asset(selectedCollege.logo)} alt="College logo" />
                                                    <AvatarFallback><Building className='p-0.5' /></AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div>
                                                <h3 className="font-semibold text-lg">{selectedCollege?.name}</h3>
                                                <p className="text-sm">
                                                    College{selectedCollege?.code && ` • ${selectedCollege.code}`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Statistics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Total Modalities
                                        </CardTitle>
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{totalModalities}</div>
                                        <p className="text-xs text-muted-foreground">
                                            Active modalities
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            TV Channels
                                        </CardTitle>
                                        <Tv className="h-4 w-4 text-blue-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-blue-700">
                                            {tvCount}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Television broadcast
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Radio Stations
                                        </CardTitle>
                                        <Radio className="h-4 w-4 text-green-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-green-700">
                                            {radioCount}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Radio broadcast
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Online Platforms
                                        </CardTitle>
                                        <Globe className="h-4 w-4 text-purple-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-purple-700">
                                            {onlineCount}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Digital platforms
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Data Table */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Modalities List</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <DataTable
                                        columns={columns(handleArchived)}
                                        data={modalities}
                                        searchKey="partner_agency"
                                        searchPlaceholder="Search by partner agency..."
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>Invalid campus or college selection.</p>
                        </div>
                    ))
                )}
            </AppLayout>
        );
    }

    if (campusId) {
        return (
            <AppLayout breadcrumbs={breadcrumbs} >
                <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                    {isLoading ? (
                        <div className="col-span-full text-center py-8 text-muted-foreground">
                            Loading colleges...
                        </div>
                    ) : colleges && colleges.length > 0 ? (
                        <>
                            <h1 className="text-2xl font-bold">College</h1>

                            <div className="grid auto-rows-min gap-4 md:grid-cols-3 lg:grid-cols-4">
                                {colleges.map((college) => (
                                    <Card key={college.id} className="hover:shadow-lg transition-shadow duration-200">
                                        <Link to={`/admin/modalities?campus=${campusId}&college=${college.id}`} className="flex flex-col items-center gap-2">
                                            <CardContent>
                                                <div className="flex flex-col items-center gap-2 justify-between text-center">
                                                    <Avatar className="size-24">
                                                        <AvatarImage src={asset(college.logo)} alt="College logo" />
                                                        <AvatarFallback><Building className='p-0.5' /></AvatarFallback>
                                                    </Avatar>
                                                    <p className='text-md font-medium'>{college.code}</p>
                                                    <p className='text-sm'>{college.name}</p>
                                                </div>
                                            </CardContent>
                                            <Badge
                                                variant="secondary"
                                                className="px-3 py-1 text-sm font-medium bg-muted"
                                            >
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                    </svg>
                                                    {college.modalities_count} Modalit{college.modalities_count > 1 ? "ies" : "y"}
                                                </span>
                                            </Badge>
                                        </Link>
                                    </Card>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="col-span-full text-center py-8 text-muted-foreground">
                            <p>No colleges found for this campus.</p>
                        </div>
                    )}
                </div>
            </AppLayout>
        );
    }

    // Campus selection view (default)
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
                                    <Link to={`/admin/modalities?campus=${campus.id}`}>
                                        <CardContent className="p-6">
                                            <div className="flex flex-col items-center gap-3">
                                                <Avatar className="size-24">
                                                    <AvatarImage src={asset(campus.logo)} alt="College logo" />
                                                    <AvatarFallback><Building className='p-0.5' /></AvatarFallback>
                                                </Avatar>
                                                <span className='text-lg font-medium'>{campus.name}</span>
                                                <Badge
                                                    variant="secondary"
                                                    className="px-3 py-1 text-sm font-medium bg-muted"
                                                >
                                                    <span className="flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                        </svg>
                                                        {campus.modalities_count} Modalit{campus.modalities_count > 1 ? "ies" : "y"}
                                                    </span>
                                                </Badge>
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
    );
}