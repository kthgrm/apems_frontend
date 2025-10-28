import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Download, FileText } from 'lucide-react';
import AppLayout from '@/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import api from '@/lib/axios';
import type { BreadcrumbItem } from '@/types';


interface User {
    id: number;
    first_name: string;
    last_name: string;
    name: string;
    email: string;
}

interface Resolution {
    id: number;
    title: string;
    created_at: string;
    updated_at: string;
    user: User;
}

interface PaginationData {
    current_page: number;
    data: Resolution[];
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
    total: number;
}

interface ReportData {
    resolutions: PaginationData;
    statistics: Statistics;
}


const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Administration', href: '/admin/dashboard' },
    { title: 'Reports', href: '/admin/reports/resolutions' },
    { title: 'Resolutions Report', href: '/admin/reports/resolutions' },
];

export default function ResolutionsReport() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<ReportData | null>(null);

    const [localFilters, setLocalFilters] = useState({
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

            const response = await api.get('/reports/resolutions', { params });

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
            if (value && value !== 'all' && value !== '') {
                params.set(key, value);
            }
        });

        setSearchParams(params);
    };

    const clearFilters = () => {
        setLocalFilters({
            date_from: '',
            date_to: '',
            search: '',
            sort_by: 'created_at',
            sort_order: 'desc',
        });
        setSearchParams(new URLSearchParams());
    };

    const generatePDF = async () => {
        try {
            const params = new URLSearchParams();

            // Add current filters to the PDF URL
            Object.entries(localFilters).forEach(([key, value]) => {
                if (value && value !== 'all' && value !== '') {
                    params.append(key, value);
                }
            });

            const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
            const url = `${baseURL}/reports/resolutions/pdf?${params.toString()}`;
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

    const handlePageChange = (url: string) => {
        const urlObj = new URL(url);
        const params = new URLSearchParams(urlObj.search);
        setSearchParams(params);
    };

    if (loading) {
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

    if (!reportData) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5">
                    <div className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground">No data available</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const { resolutions } = reportData;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-medium">Resolutions Report</h1>
                        <p className="text-muted-foreground">
                            Comprehensive overview of all resolutions and their status
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Search */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search resolutions..."
                                        value={localFilters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Date From */}
                            <div>
                                <label className="block text-sm font-medium mb-2">From</label>
                                <Input
                                    type="month"
                                    value={localFilters.date_from}
                                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                    placeholder="From Month"
                                />
                            </div>

                            {/* Date To */}
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

                        <div className="flex gap-2 mt-4">
                            <Button onClick={applyFilters}>
                                Apply Filters
                            </Button>
                            <Button onClick={clearFilters} variant="outline">
                                Clear Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Resolutions ({resolutions.total.toLocaleString()})
                            <Button onClick={generatePDF} variant="outline" className="ml-auto">
                                <Download className="h-4 w-4 mr-2" />
                                Export PDF
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Submitted By</TableHead>
                                        <TableHead>Created Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {resolutions.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center text-muted-foreground">
                                                No resolutions found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        resolutions.data.map((resolution: Resolution) => (
                                            <TableRow key={resolution.id}>
                                                <TableCell className="font-medium">
                                                    {resolution.id}
                                                </TableCell>
                                                <TableCell>
                                                    {resolution.title || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-semibold">
                                                            {resolution.user.first_name} {resolution.user.last_name}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {resolution.user.email}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(resolution.created_at)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {resolutions.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {resolutions.from} to {resolutions.to} of {resolutions.total} results
                                </div>
                                <div className="flex gap-2">
                                    {resolutions.links.map((link: any, index: number) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => {
                                                if (link.url) {
                                                    handlePageChange(link.url);
                                                }
                                            }}
                                            disabled={!link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
