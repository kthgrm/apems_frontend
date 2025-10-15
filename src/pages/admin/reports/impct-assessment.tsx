import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Download, Building2, GraduationCap, BarChart3, TrendingUp, Users, Target } from 'lucide-react';
import AppLayout from '@/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import api from '@/lib/axios';
import type { BreadcrumbItem, Campus, College, ImpactAssessment } from '@/types';

type LocalFilters = {
    campus_id: string;
    college_id: string;
    search: string;
    date_from: string;
    date_to: string;
};

interface PaginationData {
    current_page: number;
    data: ImpactAssessment[];
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

interface ReportData {
    assessments: PaginationData;
    campuses: Campus[];
    colleges: College[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Administration', href: '/admin/dashboard' },
    { title: 'Reports', href: '/admin/reports/impact-assessments' },
    { title: 'Impact Assessments Report', href: '/admin/reports/impact-assessments' },
];

export default function ImpactAssessmentsReport() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<ReportData | null>(null);

    const [localFilters, setLocalFilters] = useState<LocalFilters>({
        campus_id: searchParams.get('campus_id') || 'all',
        college_id: searchParams.get('college_id') || 'all',
        search: searchParams.get('search') || '',
        date_from: searchParams.get('date_from') || '',
        date_to: searchParams.get('date_to') || '',
    });

    useEffect(() => {
        fetchReportData();
    }, [searchParams]);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            const params: any = {};

            searchParams.forEach((value, key) => {
                if (value && value !== 'all') {
                    params[key] = value;
                }
            });

            const response = await api.get('/reports/impact-assessments', { params });

            if (response.data.success) {
                setReportData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key: keyof LocalFilters, value: string) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        const params = new URLSearchParams();
        Object.entries(localFilters).forEach(([key, value]) => {
            if (value !== '' && value !== 'all') {
                params.set(key, value);
            }
        });
        setSearchParams(params);
    };

    const clearFilters = () => {
        setLocalFilters({
            campus_id: 'all',
            college_id: 'all',
            search: '',
            date_from: '',
            date_to: '',
        });
        setSearchParams(new URLSearchParams());
    };

    const generatePDF = async () => {
        const params = new URLSearchParams();
        Object.entries(localFilters).forEach(([key, value]) => {
            if (value && value !== 'all' && value !== '') {
                params.append(key, value);
            }
        });

        try {
            const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
            const url = `${baseURL}/reports/impact-assessments/pdf?${params.toString()}`;
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            if (!token) {
                console.error('No authentication token found');
                return;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/pdf',
                },
                credentials: 'include',
            });

            if (response.ok) {
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);
                window.open(blobUrl, '_blank');
                setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
            } else {
                console.error('Failed to generate PDF:', response.statusText);
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'Not specified';
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatBeneficiaries = (count: number | null | undefined) => {
        if (!count) return '0';
        return count.toLocaleString();
    };

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        setSearchParams(params);
    };

    if (loading || !reportData) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5">
                    <div className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground">Loading report data...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const { assessments, campuses, colleges } = reportData;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-medium">Impact Assessments Report</h1>
                        <p className="text-muted-foreground">
                            Comprehensive overview of all impact assessments
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters & Search
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search assessments..."
                                        value={localFilters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Campus</label>
                                <Select
                                    value={localFilters.campus_id}
                                    onValueChange={(value) => handleFilterChange('campus_id', value)}
                                >
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="Select Campus" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Campuses</SelectItem>
                                        {campuses.map((campus) => (
                                            <SelectItem key={campus.id} value={campus.id.toString()}>
                                                {campus.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2">College</label>
                                <Select
                                    value={localFilters.college_id}
                                    onValueChange={(value) => handleFilterChange('college_id', value)}
                                >
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="Select College" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Colleges</SelectItem>
                                        {colleges.map((college) => (
                                            <SelectItem key={college.id} value={college.id.toString()}>
                                                {college.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">From</label>
                                <Input
                                    type="month"
                                    value={localFilters.date_from}
                                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">To</label>
                                <Input
                                    type="month"
                                    value={localFilters.date_to}
                                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <Button onClick={applyFilters} className='flex items-center gap-2'>
                                <Search className="h-4 w-4" />
                                Apply Filters
                            </Button>
                            <Button variant="secondary" onClick={clearFilters}>
                                Clear All
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Impact Assessments ({assessments.total})
                            </div>
                            <Button onClick={generatePDF} variant='outline'>
                                <Download className="h-4 w-4 mr-2" />
                                Generate PDF
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Project & Beneficiary</TableHead>
                                        <TableHead>Geographic Coverage</TableHead>
                                        <TableHead>College</TableHead>
                                        <TableHead>Direct Impact</TableHead>
                                        <TableHead>Indirect Impact</TableHead>
                                        <TableHead>Total Impact</TableHead>
                                        <TableHead>Created</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assessments.data.map((assessment) => (
                                        <TableRow key={assessment.id}>
                                            <TableCell className="font-medium">
                                                <div>
                                                    <p className="font-semibold">{assessment.tech_transfer?.name || 'N/A'}</p>
                                                    {assessment.beneficiary && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {assessment.beneficiary.substring(0, 60)}{assessment.beneficiary.length > 60 ? '...' : ''}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Target className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-sm">{assessment.geographic_coverage || 'Not specified'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div>
                                                        <div className="flex items-center gap-1">
                                                            <Building2 className="h-3 w-3" />
                                                            <span className="text-xs">{assessment.tech_transfer?.college?.campus?.name || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <GraduationCap className="h-3 w-3" />
                                                            <span className="text-xs">{assessment.tech_transfer?.college?.name || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        <span className="font-medium">{formatBeneficiaries(assessment.num_direct_beneficiary)}</span>
                                                    </div>
                                                    <div className="text-muted-foreground text-xs mt-1">
                                                        Direct beneficiaries
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <TrendingUp className="h-3 w-3" />
                                                        <span className="font-medium">{formatBeneficiaries(assessment.num_indirect_beneficiary)}</span>
                                                    </div>
                                                    <div className="text-muted-foreground text-xs mt-1">
                                                        Indirect beneficiaries
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <BarChart3 className="h-3 w-3" />
                                                        <span className="font-bold text-primary">
                                                            {formatBeneficiaries((assessment.num_direct_beneficiary || 0) + (assessment.num_indirect_beneficiary || 0))}
                                                        </span>
                                                    </div>
                                                    <div className="text-muted-foreground text-xs mt-1">
                                                        Total impact
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <p>{formatDate(assessment.created_at)}</p>
                                                    <p className="text-muted-foreground">by {assessment.user?.first_name + ' ' + assessment.user?.last_name || 'N/A'} </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {assessments.last_page > 1 && (
                            <div className="flex items-center justify-between px-2 py-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {assessments.from} to {assessments.to} of {assessments.total} results
                                </div>
                                <div className="flex items-center space-x-2">
                                    {assessments.current_page > 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(assessments.current_page - 1)}
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    {assessments.current_page < assessments.last_page && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(assessments.current_page + 1)}
                                        >
                                            Next
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
