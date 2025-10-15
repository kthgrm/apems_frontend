import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Search, Filter, Calendar, User, Activity, FileText, Download } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
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
import { type BreadcrumbItem } from '@/types';
import { DataTable } from '@/components/data-table';

interface User {
    id: number;
    name: string;
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

interface Props {
    auditLogs: PaginationData;
    actions: string[];
    auditableTypes: string[];
    filters: {
        user_id?: string;
        action?: string;
        auditable_type?: string;
        date_from?: string;
        date_to?: string;
        search?: string;
    };
}

export default function AuditTrailIndex({ auditLogs, actions, auditableTypes, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedAction, setSelectedAction] = useState(filters.action || 'all');
    const [selectedType, setSelectedType] = useState(filters.auditable_type || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Reports', href: '#' },
        { title: 'Audit Trail', href: '/admin/report/audit-trail' },
    ];

    const handleFilter = () => {
        router.get('/admin/report/audit-trail', {
            search: search || undefined,
            action: (selectedAction && selectedAction !== 'all') ? selectedAction : undefined,
            auditable_type: (selectedType && selectedType !== 'all') ? selectedType : undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setSelectedAction('all');
        setSelectedType('all');
        setDateFrom('');
        setDateTo('');
        router.get('/admin/report/audit-trail');
    };

    const handleGeneratePDF = () => {
        const params = new URLSearchParams();

        if (search) params.append('search', search);
        if (selectedAction && selectedAction !== 'all') params.append('action', selectedAction);
        if (selectedType && selectedType !== 'all') params.append('auditable_type', selectedType);
        if (dateFrom) params.append('date_from', dateFrom);
        if (dateTo) params.append('date_to', dateTo);

        const url = `/admin/report/audit-trail/pdf?${params.toString()}`;
        window.open(url, '_blank');
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Trail - Reports" />
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
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Action</label>
                                    <Select value={selectedAction} onValueChange={setSelectedAction}>
                                        <SelectTrigger>
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
                                    <Select value={selectedType} onValueChange={setSelectedType}>
                                        <SelectTrigger>
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
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">To Date</label>
                                    <Input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
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
                                                                    {log.user?.name || 'System'}
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
                                        {auditLogs.prev_page_url && (
                                            <Link
                                                href={auditLogs.prev_page_url}
                                                preserveState
                                                preserveScroll
                                            >
                                                <Button variant="outline" size="sm">
                                                    Previous
                                                </Button>
                                            </Link>
                                        )}
                                        <div className="flex items-center px-3 py-1 bg-gray-100 rounded">
                                            Page {auditLogs.current_page} of {auditLogs.last_page}
                                        </div>
                                        {auditLogs.next_page_url && (
                                            <Link
                                                href={auditLogs.next_page_url}
                                                preserveState
                                                preserveScroll
                                            >
                                                <Button variant="outline" size="sm">
                                                    Next
                                                </Button>
                                            </Link>
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
