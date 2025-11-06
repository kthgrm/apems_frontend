import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import AppLayout from '@/layout/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Award, Globe, TrendingUp, Users, Clock, PlusCircle, BarChart, Zap, Folder, Radio, FileText, FolderOpen, Trophy } from 'lucide-react';
import api from '@/lib/axios';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import { Separator } from '@/components/ui/separator';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface UserStats {
    total_projects: number;
    total_awards: number;
    total_engagements: number;
}

interface RecentSubmission {
    id: number;
    name: string;
    type: 'Project' | 'Award' | 'Engagement';
    user_name: string;
    campus: string;
    college: string;
    created_at: string;
    description?: string;
    date_received?: string;
    location?: string;
}

interface RecentSubmissions {
    projects: RecentSubmission[];
    awards: RecentSubmission[];
    engagements: RecentSubmission[];
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'Project':
            return <Folder className="h-4 w-4" />;
        case 'Award':
            return <Award className="h-4 w-4" />;
        case 'International Partner':
            return <Globe className="h-4 w-4" />;
        default:
            return <TrendingUp className="h-4 w-4" />;
    }
};

const getTypeBadgeColor = (type: string) => {
    switch (type) {
        case 'Project':
            return 'bg-blue-100 text-blue-800';
        case 'Award':
            return 'bg-yellow-100 text-yellow-800';
        case 'Engagement':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const QuickActions = () => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Quick Actions
            </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-5 gap-4">
            <Link
                to="/user/technology-transfer/create"
                className="group flex flex-col items-center p-4 bg-gradient-to-b from-sky-300 to-blue-600 rounded-lg border hover:shadow-md transition-all duration-200 hover:scale-105"
            >
                <div className="p-3 bg-blue-600 text-white rounded-full group-hover:bg-blue-700 transition-colors duration-200">
                    <PlusCircle className="h-6 w-6" />
                </div>
                <span className="mt-2 text-sm font-medium text-white text-center">New Technology Transfer</span>
            </Link>

            <Link
                to="/user/awards-recognition/create"
                className="group flex flex-col items-center p-4 bg-gradient-to-b from-amber-100 to-yellow-400 rounded-lg border hover:shadow-md transition-all duration-200 hover:scale-105"
            >
                <div className="p-3 bg-yellow-500 text-white rounded-full group-hover:bg-yellow-600 transition-colors duration-200">
                    <Award className="h-6 w-6" />
                </div>
                <span className="mt-2 text-sm font-medium text-white text-center">New Award</span>
            </Link>

            <Link
                to="/user/engagements/create"
                className="group flex flex-col items-center p-4 bg-gradient-to-b from-emerald-300 to-green-600 rounded-lg border hover:shadow-md transition-all duration-200 hover:scale-105"
            >
                <div className="p-3 bg-green-600 text-white rounded-full group-hover:bg-green-700 transition-colors duration-200">
                    <Globe className="h-6 w-6" />
                </div>
                <span className="mt-2 text-sm font-medium text-white text-center">New Engagement</span>
            </Link>

            <Link
                to="/user/impact-assessment/create"
                className="group flex flex-col items-center p-4 bg-gradient-to-b from-purple-300 to-violet-600 rounded-lg border hover:shadow-md transition-all duration-200 hover:scale-105"
            >
                <div className="p-3 bg-purple-600 text-white rounded-full group-hover:bg-purple-700 transition-colors duration-200">
                    <BarChart className="h-6 w-6" />
                </div>
                <span className="mt-2 text-sm font-medium text-white text-center">New Assessment</span>
            </Link>

            <Link
                to="/user/modalities/create"
                className="group flex flex-col items-center p-4 bg-gradient-to-b from-amber-400 to-orange-500 rounded-lg border hover:shadow-md transition-all duration-200 hover:scale-105"
            >
                <div className="p-3 bg-orange-500 text-white rounded-full group-hover:bg-orange-600 transition-colors duration-200">
                    <Radio className="h-6 w-6" />
                </div>
                <span className="mt-2 text-sm font-medium text-white text-center">New Modality</span>
            </Link>
        </CardContent>
    </Card>
);

export default function UserDashboard() {
    const user = useAuth();
    const [selectedReport, setSelectedReport] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [generating, setGenerating] = useState(false);

    const [userStats, setUserStats] = useState<UserStats>({
        total_projects: 0,
        total_awards: 0,
        total_engagements: 0,
    });
    const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmissions>({
        projects: [],
        awards: [],
        engagements: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch user stats and recent submissions
                const response = await api.get('/user/dashboard');
                if (response.data) {
                    setUserStats(response.data.userStats || {
                        total_projects: 0,
                        total_awards: 0,
                        total_engagements: 0,
                    });
                    setRecentSubmissions(response.data.recentSubmissions || {
                        projects: [],
                        awards: [],
                        engagements: [],
                    });
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Combine all submissions and sort by created_at
    const allSubmissions = [
        ...recentSubmissions.projects,
        ...recentSubmissions.awards,
        ...recentSubmissions.engagements,
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading dashboard...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    const reportTypes = [
        { id: 'technology-transfers', name: 'Technology Transfers', icon: FolderOpen },
        { id: 'awards', name: 'Awards', icon: Trophy },
        { id: 'engagements', name: 'Engagements', icon: Globe },
        { id: 'modalities', name: 'Modalities', icon: Radio },
        { id: 'impact-assessments', name: 'Impact Assessments', icon: BarChart },
    ];

    const handleGenerateReport = async () => {
        if (!selectedReport) {
            alert('Please select a report type.');
            return;
        }

        setGenerating(true);

        try {
            const params = new URLSearchParams();
            if (dateRange.start) params.append('date_from', dateRange.start);
            if (dateRange.end) params.append('date_to', dateRange.end);

            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            if (!token) {
                console.error('No authentication token found');
                return;
            }

            const response = await api.get(`/reports/${selectedReport}/pdf`, {
                params,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                responseType: 'blob', // important for downloading files
            });

            if (response.status === 200) {
                // Create a blob from the response
                const blob = new Blob([response.data], { type: 'application/pdf' });

                // Create a temporary URL for the blob
                const blobUrl = window.URL.createObjectURL(blob);

                // Open PDF in a new tab
                window.open(blobUrl, '_blank');

                // Optional: Clean up the blob URL after a delay to ensure it opens
                setTimeout(() => {
                    window.URL.revokeObjectURL(blobUrl);
                }, 1000);
            } else {
                console.error('Unexpected response:', response);
                toast.error('Failed to generate PDF. Please try again.');
            }
        } catch (error) {
            console.error('Failed to generate report:', error);
            toast.error('Failed to generate report. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                <div className='flex justify-between'>
                    <div>
                        <h1 className='text-3xl font-bold'>Dashboard</h1>
                        <p className="text-md text-muted-foreground">Welcome back, {user.user?.first_name} {user.user?.last_name}!</p>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className='bg-blue-500 hover:bg-blue-600'>
                                <FileText className="h-4 w-4" />
                                Generate Report
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] md:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Generate Report</DialogTitle>
                                <DialogDescription>
                                    Select the type of report you would like to generate.
                                </DialogDescription>
                            </DialogHeader>
                            {reportTypes.map((report) => (
                                <button
                                    key={report.id}
                                    onClick={() => setSelectedReport(report.id)}
                                    className={`flex items-center gap-4 p-2 rounded-lg border-2 transition-all text-left ${selectedReport === report.id
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className={`p-3 rounded-lg ${selectedReport === report.id ? 'bg-red-100' : 'bg-gray-100'
                                        }`}>
                                        <report.icon className={
                                            selectedReport === report.id ? 'text-red-600' : 'text-gray-600'
                                        } size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{report.name}</h3>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedReport === report.id
                                        ? 'border-red-500 bg-red-500'
                                        : 'border-gray-300'
                                        }`}>
                                        {selectedReport === report.id && (
                                            <div className="w-2 h-2 bg-white rounded-full" />
                                        )}
                                    </div>
                                </button>
                            ))}
                            <Separator />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button
                                    onClick={handleGenerateReport}
                                    disabled={generating || !selectedReport}
                                >
                                    {generating ? 'Generating...' : 'Generate'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="space-y-4">
                    <QuickActions />
                    {/* Statistics Cards */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="relative overflow-hidden group hover:shadow-md transition-shadow duration-200">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-blue-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                                <CardTitle className="text-sm font-medium">Total Technology Transfers</CardTitle>
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <Folder className="h-4 w-4 text-blue-600" />
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="text-2xl font-bold text-blue-700">{userStats.total_projects}</div>
                                <p className="text-xs text-muted-foreground">
                                    Technology Transfer projects submitted
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="relative overflow-hidden group hover:shadow-md transition-shadow duration-200">
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-50/50 to-yellow-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                                <CardTitle className="text-sm font-medium">Total Awards</CardTitle>
                                <div className="p-2 bg-yellow-100 rounded-full">
                                    <Award className="h-4 w-4 text-yellow-600" />
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="text-2xl font-bold text-yellow-700">{userStats.total_awards}</div>
                                <p className="text-xs text-muted-foreground">
                                    Awards and recognitions submitted
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="relative overflow-hidden group hover:shadow-md transition-shadow duration-200">
                            <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 to-green-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                                <CardTitle className="text-sm font-medium">Total Engagements</CardTitle>
                                <div className="p-2 bg-green-100 rounded-full">
                                    <Globe className="h-4 w-4 text-green-600" />
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="text-2xl font-bold text-green-700">{userStats.total_engagements}</div>
                                <p className="text-xs text-muted-foreground">
                                    Engagements submitted
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className='flex flex-row gap-6'>
                        {/* Recent Submissions from Other Users */}
                        <Card className="flex-1">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Recent Community Activity
                                </CardTitle>
                                <CardDescription>
                                    See what others in your community have been submitting recently
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-full pr-4">
                                    {allSubmissions.length === 0 ? (
                                        <div className="flex items-center justify-center h-32 text-muted-foreground">
                                            <div className="text-center">
                                                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                <p>No recent submissions from other users</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {allSubmissions.map((submission) => (
                                                <div
                                                    key={`${submission.type}-${submission.id}`}
                                                    className="flex items-start space-x-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors duration-200 group"
                                                >
                                                    <div className="flex-shrink-0 mt-1 p-2 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                                                        {getTypeIcon(submission.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1">
                                                                <h4 className="font-semibold text-sm truncate">
                                                                    {submission.name}
                                                                </h4>
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    by {submission.user_name}
                                                                </p>
                                                            </div>
                                                            <Badge
                                                                variant="secondary"
                                                                className={`text-xs ${getTypeBadgeColor(submission.type)}`}
                                                            >
                                                                {submission.type}
                                                            </Badge>
                                                        </div>

                                                        <div className="mt-2 space-y-1">
                                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                                <span className="flex items-center gap-1">
                                                                    {submission.campus} - {submission.college}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    {formatDate(submission.created_at)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
