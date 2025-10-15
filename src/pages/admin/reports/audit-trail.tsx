import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, User, Activity, Download } from 'lucide-react';
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
import type { BreadcrumbItem } from '@/types';

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

interface AuditLog {
    id: number;
    user_type: string;
    user_id: number;
    action: string;
    auditable_type: string;
    auditable_id: number;
    old_values: any;
    new_values: any;
    description: string;
    created_at: string;
    updated_at: string;
    user: User;
}

interface PaginationData {
    current_page: number;
    data: AuditLog[];
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}

interface ReportData {
    auditLogs: PaginationData;
    actions: string[];
    auditableTypes: string[];
}

type LocalFilters = {
    search: string;
    action: string;
    auditable_type: string;
    date_from: string;
    date_to: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reports', href: '/admin/reports/audit-trail' },
    { title: 'Audit Trail', href: '/admin/reports/audit-trail' },
];

export default function AuditTrailIndex() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<ReportData | null>(null);

    const [localFilters, setLocalFilters] = useState<LocalFilters>({
        search: searchParams.get('search') || '',
        action: searchParams.get('action') || 'all',
        auditable_type: searchParams.get('auditable_type') || 'all',
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

            const response = await api.get('/reports/audit-trail', { params });

            if (response.data.success) {
                // Get unique actions and types from the data
                const logs = response.data.data.auditLogs.data;
                const actions = [...new Set(logs.map((log: AuditLog) => log.action))];
                const types = [...new Set(logs.map((log: AuditLog) => log.auditable_type))];

                setReportData({
                    auditLogs: response.data.data.auditLogs,
                    actions: actions as string[],
                    auditableTypes: types as string[],
                });
            }
        } catch (error) {
            console.error('Error fetching audit trail data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key: keyof LocalFilters, value: string) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleFilter = () => {
        const params = new URLSearchParams();
        Object.entries(localFilters).forEach(([key, value]) => {
            if (value !== '' && value !== 'all') {
                params.set(key, value);
            }
        });
        setSearchParams(params);
    };

    const handleReset = () => {
        setLocalFilters({
            search: '',
            action: 'all',
            auditable_type: 'all',
            date_from: '',
            date_to: '',
        });
        setSearchParams(new URLSearchParams());
    };

    const handleGeneratePDF = async () => {
        const params = new URLSearchParams();
        Object.entries(localFilters).forEach(([key, value]) => {
            if (value && value !== 'all' && value !== '') {
                params.append(key, value);
            }
        });

        try {
            const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
            const url = `${baseURL}/reports/audit-trail/pdf?${params.toString()}`;
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

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        setSearchParams(params);
    };

    const getActionBadge = (action: string) => {
        const variants = {
            create: 'bg-green-100 text-green-800',
            update: 'bg-blue-100 text-blue-800',
            delete: 'bg-red-100 text-red-800',
            login: 'bg-purple-100 text-purple-800',
            logout: 'bg-gray-100 text-gray-800',
        };

        return variants[action as keyof typeof variants] || 'bg-gray-100 text-gray-800';
    };

    if (loading || !reportData) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5">
                    <div className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground">Loading audit trail data...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const { auditLogs, actions, auditableTypes } = reportData;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Audit Trail</h1>
                            <p className="text-gray-600">
                                Track all system activities and user actions
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium mb-2">Search</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search descriptions..."
                                            value={localFilters.search}
                                            onChange={(e) => handleFilterChange('search', e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Action</label>
                                    <Select value={localFilters.action} onValueChange={(value) => handleFilterChange('action', value)}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder="All actions" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All actions</SelectItem>
                                            {actions.map((action) => (
                                                <SelectItem key={action} value={action}>
                                                    {action.charAt(0).toUpperCase() + action.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Model Type</label>
                                    <Select value={localFilters.auditable_type} onValueChange={(value) => handleFilterChange('auditable_type', value)}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder="All types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All types</SelectItem>
                                            {auditableTypes.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">From Date</label>
                                    <Input
                                        type="date"
                                        value={localFilters.date_from}
                                        onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">To Date</label>
                                    <Input
                                        type="date"
                                        value={localFilters.date_to}
                                        onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <Button onClick={handleFilter} className="flex items-center gap-2">
                                    <Search className="h-4 w-4" />
                                    Apply Filters
                                </Button>
                                <Button variant="outline" onClick={handleReset}>
                                    Reset
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Audit Logs Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Audit Logs ({auditLogs.total})
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={handleGeneratePDF}
                                    className="flex items-center gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Generate PDF
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Timestamp</TableHead>
                                            <TableHead>User</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Model</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {auditLogs.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                                                    No audit logs found matching your criteria.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            auditLogs.data.map((log) => (
                                                <TableRow key={log.id}>
                                                    <TableCell>
                                                        <div className="text-sm py-1">
                                                            <div className="font-medium">
                                                                {new Date(log.created_at).toLocaleDateString()}
                                                            </div>
                                                            <div className="text-gray-500">
                                                                {new Date(log.created_at).toLocaleTimeString()}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-gray-400" />
                                                            <div>
                                                                <div className="font-medium">
                                                                    {log.user ? `${log.user.first_name} ${log.user.last_name}` : 'System'}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {log.user?.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">
                                                            {log.description || '-'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">
                                                            <div className="font-medium">
                                                                {log.auditable_type ? log.auditable_type.split('\\').pop() : '-'}
                                                            </div>
                                                            {log.auditable_id && (
                                                                <div className="text-gray-500">
                                                                    ID: {log.auditable_id}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getActionBadge(log.action)}>
                                                            {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Simple Pagination */}
                            {auditLogs.last_page > 1 && (
                                <div className="mt-6 flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Showing {auditLogs.from} to {auditLogs.to} of {auditLogs.total} results
                                    </div>
                                    <div className="flex gap-2">
                                        {auditLogs.current_page > 1 && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(auditLogs.current_page - 1)}
                                            >
                                                Previous
                                            </Button>
                                        )}
                                        <div className="flex items-center px-3 py-1 bg-gray-100 rounded">
                                            Page {auditLogs.current_page} of {auditLogs.last_page}
                                        </div>
                                        {auditLogs.current_page < auditLogs.last_page && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(auditLogs.current_page + 1)}
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
            </div>
        </AppLayout>
    );
}
