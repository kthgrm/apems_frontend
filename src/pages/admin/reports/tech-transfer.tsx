import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Download, Building2, GraduationCap, Folder } from 'lucide-react';
import AppLayout from '@/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import api from '@/lib/axios';
import type { BreadcrumbItem, Campus, College } from '@/types';

interface TechTransfer {
    id: number;
    name: string;
    description: string | null;
    category: string | null;
    purpose: string | null;
    start_date: string | null;
    end_date: string | null;
    leader: string | null;
    created_at: string | null;
    user?: {
        id: number;
        first_name: string;
        last_name: string;
    };
    college?: {
        id: number;
        name: string;
        campus?: {
            id: number;
            name: string;
        };
    };
}

interface PaginationData {
    current_page: number;
    data: TechTransfer[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: any[];
    next_page_url: string;
    path: string;
    per_page: number;
    prev_page_url: string;
    to: number;
    total: number;
}

interface Statistics {
    total_projects: number;
    projects_by_month: Array<{ period: string; count: number }>;
}

interface ReportData {
    projects: PaginationData;
    campuses: Campus[];
    colleges: College[];
    filters: {
        campus_id?: string;
        college_id?: string;
        date_from?: string;
        date_to?: string;
        search?: string;
        sort_by?: string;
        sort_order?: string;
    };
    statistics: Statistics;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Administration',
        href: '/admin/dashboard',
    },
    {
        title: 'Reports',
        href: '/admin/reports/technology-transfers',
    },
    {
        title: 'Technology Transfers Report',
        href: '/admin/reports/technology-transfers',
    },
];

export default function TechTransferReport() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<ReportData | null>(null);

    const [localFilters, setLocalFilters] = useState({
        campus_id: searchParams.get('campus_id') || 'all',
        college_id: searchParams.get('college_id') || 'all',
        date_from: searchParams.get('date_from') || '',
        date_to: searchParams.get('date_to') || '',
        search: searchParams.get('search') || '',
        sort_by: searchParams.get('sort_by') || 'created_at',
        sort_order: searchParams.get('sort_order') || 'desc',
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

            const response = await api.get('/reports/technology-transfers', { params });

            if (response.data.success) {
                setReportData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setLocalFilters(prev => ({
            ...prev,
            [key]: value
        }));
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
            date_from: '',
            date_to: '',
            search: '',
            sort_by: 'created_at',
            sort_order: 'desc',
        });
        setSearchParams(new URLSearchParams());
    };

    const generatePDF = async () => {
        const params = new URLSearchParams();

        // Add current filters to the PDF URL
        Object.entries(localFilters).forEach(([key, value]) => {
            if (value && value !== 'all' && value !== '') {
                params.append(key, value);
            }
        });

        try {
            // Create the full URL for PDF download
            const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
            const url = `${baseURL}/reports/technology-transfers/pdf?${params.toString()}`;

            // Get the auth token from localStorage or sessionStorage
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            if (!token) {
                console.error('No authentication token found');
                return;
            }

            // Fetch the PDF with authentication
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/pdf',
                },
                credentials: 'include', // Include cookies for Sanctum
            });

            if (response.ok) {
                // Create a blob from the response
                const blob = await response.blob();

                // Create a temporary URL for the blob
                const blobUrl = window.URL.createObjectURL(blob);

                // Open PDF in a new tab
                window.open(blobUrl, '_blank');

                // Optional: Clean up the blob URL after a delay to ensure it opens
                setTimeout(() => {
                    window.URL.revokeObjectURL(blobUrl);
                }, 1000);
            } else {
                const errorText = await response.text();
                console.error('Failed to generate PDF:', response.statusText, errorText);
                // You can add a toast notification here
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            // You can add a toast notification here
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

    const { projects, campuses, colleges } = reportData;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-medium">Technology Transfers Report</h1>
                        <p className="text-muted-foreground">
                            Comprehensive overview of all technology transfer projects
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters & Search
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                            {/* Search */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search projects..."
                                        value={localFilters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Filter Selects */}
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
                            {/* Date Range */}
                            <div>
                                <label className="block text-sm font-medium mb-2">From</label>
                                <Input
                                    type="month"
                                    value={localFilters.date_from}
                                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                    placeholder="From Month"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">To</label>
                                <Input
                                    type="month"
                                    value={localFilters.date_to}
                                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                    placeholder="To Month"
                                />
                            </div>
                        </div>

                        {/* Filter Actions */}
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

                {/* Projects Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Folder className="h-5 w-5" />
                                Projects ({projects.total})
                            </div>
                            <Button onClick={generatePDF} variant='outline'>
                                <Download className="h-4 w-4" />
                                Generate PDF
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Project</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Leader</TableHead>
                                        <TableHead>College</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Created</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {projects.data.map((project) => (
                                        <TableRow key={project.id}>
                                            <TableCell className="font-medium">
                                                <p className="font-semibold">{project.name}</p>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <p className="text-sm text-muted-foreground">
                                                    {project.description || 'Unspecified'}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{project.category || 'Unspecified'}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-medium">{project.leader || 'Not assigned'}</p>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div>
                                                        <div className="flex items-center gap-1">
                                                            <Building2 className="h-3 w-3" />
                                                            <span className="text-xs">{project.college?.campus?.name || 'N/A'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <GraduationCap className="h-3 w-3" />
                                                            <span className="text-xs">{project.college?.name || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <p>{formatDate(project.start_date)}</p>
                                                    <p className="text-muted-foreground">to {formatDate(project.end_date)}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <p>{formatDate(project.created_at)}</p>
                                                    <p className="text-muted-foreground">
                                                        by {project.user ? `${project.user.first_name} ${project.user.last_name}` : 'N/A'}
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {projects.last_page > 1 && (
                            <div className="flex items-center justify-between px-2 py-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {projects.from} to {projects.to} of {projects.total} results
                                </div>
                                <div className="flex items-center space-x-2">
                                    {projects.current_page > 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(projects.current_page - 1)}
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    {projects.current_page < projects.last_page && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(projects.current_page + 1)}
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
