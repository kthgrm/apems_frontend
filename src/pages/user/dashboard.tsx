import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import AppLayout from '@/layout/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Award, Globe, TrendingUp, Users, Clock, PlusCircle, BarChart, Zap, Folder, Radio } from 'lucide-react';
import api from '@/lib/axios';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface UserStats {
    total_projects: number;
    total_awards: number;
    total_international_partners: number;
}

interface RecentSubmission {
    id: number;
    name: string;
    type: 'Project' | 'Award' | 'International Partner';
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
    international_partners: RecentSubmission[];
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
        case 'International Partner':
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
        <CardContent>
            <div className="grid grid-rows-4 gap-4">
                <Link
                    to="/user/technology-transfer/create"
                    className="group flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border hover:shadow-md transition-all duration-200 hover:scale-105"
                >
                    <div className="p-3 bg-blue-500 text-white rounded-full group-hover:bg-blue-600 transition-colors duration-200">
                        <PlusCircle className="h-6 w-6" />
                    </div>
                    <span className="mt-2 text-sm font-medium text-blue-700">New Project</span>
                    <span className="text-xs text-blue-600/70">Technology Transfer</span>
                </Link>

                <Link
                    to="/user/awards-recognition/create"
                    className="group flex flex-col items-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border hover:shadow-md transition-all duration-200 hover:scale-105"
                >
                    <div className="p-3 bg-yellow-500 text-white rounded-full group-hover:bg-yellow-600 transition-colors duration-200">
                        <Award className="h-6 w-6" />
                    </div>
                    <span className="mt-2 text-sm font-medium text-yellow-700">Add Award</span>
                    <span className="text-xs text-yellow-600/70">Recognition</span>
                </Link>

                <Link
                    to="/user/international-partner/create"
                    className="group flex flex-col items-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border hover:shadow-md transition-all duration-200 hover:scale-105"
                >
                    <div className="p-3 bg-green-500 text-white rounded-full group-hover:bg-green-600 transition-colors duration-200">
                        <Globe className="h-6 w-6" />
                    </div>
                    <span className="mt-2 text-sm font-medium text-green-700">Add Partnership</span>
                    <span className="text-xs text-green-600/70">International Partner</span>
                </Link>

                <Link
                    to="/user/impact-assessment/create"
                    className="group flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border hover:shadow-md transition-all duration-200 hover:scale-105"
                >
                    <div className="p-3 bg-purple-500 text-white rounded-full group-hover:bg-purple-600 transition-colors duration-200">
                        <BarChart className="h-6 w-6" />
                    </div>
                    <span className="mt-2 text-sm font-medium text-purple-700">New Assessment</span>
                    <span className="text-xs text-purple-600/70">Impact Evaluation</span>
                </Link>

                <Link
                    to="/user/modalities/create"
                    className="group flex flex-col items-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border hover:shadow-md transition-all duration-200 hover:scale-105"
                >
                    <div className="p-3 bg-orange-500 text-white rounded-full group-hover:bg-orange-600 transition-colors duration-200">
                        <Radio className="h-6 w-6" />
                    </div>
                    <span className="mt-2 text-sm font-medium text-orange-700">New Modality</span>
                    <span className="text-xs text-orange-600/70">Modalities</span>
                </Link>
            </div>
        </CardContent>
    </Card>
);

export default function UserDashboard() {
    const [userStats, setUserStats] = useState<UserStats>({
        total_projects: 0,
        total_awards: 0,
        total_international_partners: 0,
    });
    const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmissions>({
        projects: [],
        awards: [],
        international_partners: [],
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
                        total_international_partners: 0,
                    });
                    setRecentSubmissions(response.data.recentSubmissions || {
                        projects: [],
                        awards: [],
                        international_partners: [],
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
        ...recentSubmissions.international_partners,
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-6 overflow-x-auto">
                <div className="grid grid-cols-6 gap-4">
                    <QuickActions />
                    <div className='col-span-5 space-y-4'>
                        {/* Statistics Cards */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card className="relative overflow-hidden group hover:shadow-md transition-shadow duration-200">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-blue-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                                    <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
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
                                        Awards and recognitions received
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="relative overflow-hidden group hover:shadow-md transition-shadow duration-200">
                                <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 to-green-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                                    <CardTitle className="text-sm font-medium">International Partners</CardTitle>
                                    <div className="p-2 bg-green-100 rounded-full">
                                        <Globe className="h-4 w-4 text-green-600" />
                                    </div>
                                </CardHeader>
                                <CardContent className="relative z-10">
                                    <div className="text-2xl font-bold text-green-700">{userStats.total_international_partners}</div>
                                    <p className="text-xs text-muted-foreground">
                                        International partnerships established
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
                                    <ScrollArea className="h-[500px] pr-4">
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

            </div>
        </AppLayout>
    );
}
