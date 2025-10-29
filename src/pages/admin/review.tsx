import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import AppLayout from '@/layout/app-layout';
import api from '@/lib/axios';
import type { BreadcrumbItem } from '@/types';
import {
    AlertCircle,
    BarChart,
    Building,
    Calendar,
    CheckCircle,
    Clock,
    FileText,
    FolderOpen,
    Handshake,
    Radio,
    Target,
    Trophy,
    User,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Submission {
    id: number;
    type: string;
    name: string;
    description: string;
    created_at: string;
    user: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
    college: {
        id: number;
        name: string;
        code: string;
        logo?: string;
        campus: {
            id: number;
            name: string;
        }
    };
    // Type-specific fields
    leader?: string;
    awardee?: string;
    coordinator?: string;
    partner?: string;
    assessor?: string;
    category?: string;
    award_type?: string;
    modality_type?: string;
    engagement_type?: string;

    agency_partner?: string;
    activity_conducted?: string;
}

interface Stats {
    total: number;
    tech_transfers: number;
    awards: number;
    engagements: number;
    modalities: number;
    impact_assessments: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Review Submissions',
        href: `/admin/review`,
    },
];

const getTypeConfig = (type: string) => {
    const configs: Record<string, any> = {
        'tech-transfer': {
            label: 'Tech Transfer',
            icon: FolderOpen,
            color: 'bg-blue-600',
        },
        'award': {
            label: 'Award',
            icon: Trophy,
            color: 'bg-yellow-600',
        },
        'modality': {
            label: 'Modality',
            icon: Radio,
            color: 'bg-orange-600',
        },
        'engagement': {
            label: 'Engagement',
            icon: Handshake,
            color: 'bg-green-600',
        },
        'impact-assessment': {
            label: 'Impact Assessment',
            icon: BarChart,
            color: 'bg-violet-600',
        },
    };
    return configs[type] || configs['tech-transfer'];
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const SubmissionCard = ({
    submission,
    onReview,
}: {
    submission: Submission;
    onReview: (submission: Submission, action: 'approved' | 'rejected') => void;
}) => {
    const config = getTypeConfig(submission.type);
    const IconComponent = config.icon;
    const navigate = useNavigate();

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent>
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Section */}
                    <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge className={`${config.color} text-white text-xs`}>
                                        <IconComponent className="h-3 w-3 mr-1" />
                                        {config.label}
                                    </Badge>
                                    <Badge className="bg-yellow-400 text-white text-xs">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Pending
                                    </Badge>
                                </div>
                                <h3 className="text-lg font-semibold mb-1">{submission.name || submission.agency_partner}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {submission.description || submission.activity_conducted}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-start gap-2">
                                <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="font-medium truncate">{submission.user.first_name} {submission.user.last_name}</p>
                                    <p className="text-muted-foreground text-xs truncate">
                                        {submission.user.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <Building className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="font-medium truncate">{submission.college.name}</p>
                                    <p className="text-muted-foreground text-xs">{submission.college.campus.name}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="font-medium">Submitted</p>
                                    <p className="text-muted-foreground text-xs">
                                        {formatDate(submission.created_at)}
                                    </p>
                                </div>
                            </div>

                            {/* Type-specific field */}
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="font-medium text-xs">
                                        {submission.leader && `Leader: ${submission.leader}`}
                                        {submission.awardee && `Awardee: ${submission.awardee}`}
                                        {submission.coordinator && `Coordinator: ${submission.coordinator}`}
                                        {submission.partner && `Partner: ${submission.partner}`}
                                        {submission.assessor && `Assessor: ${submission.assessor}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex flex-row lg:flex-col gap-2 lg:w-40">
                        <Button
                            size="lg"
                            variant="outline"
                            className="lg:w-full"
                            onClick={() => {
                                // Navigate to details page based on type
                                const typeRoutes: Record<string, string> = {
                                    'tech-transfer': `/admin/technology-transfer/${submission.id}`,
                                    'award': `/admin/awards/${submission.id}`,
                                    'engagement': `/admin/engagements/${submission.id}`,
                                    'modality': `/admin/modalities/${submission.id}`,
                                    'impact-assessment': `/admin/impact-assessments/${submission.id}`,
                                };
                                // You can implement navigation here
                                navigate(typeRoutes[submission.type]);
                                console.log('View details:', submission);
                            }}
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Details
                        </Button>
                        <Button
                            size="lg"
                            className="lg:w-full bg-green-600 hover:bg-green-700"
                            onClick={() => onReview(submission, 'approved')}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                        </Button>
                        <Button
                            size="lg"
                            variant="destructive"
                            className="lg:w-full"
                            onClick={() => onReview(submission, 'rejected')}
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const Review = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [stats, setStats] = useState<Stats>({
        total: 0,
        tech_transfers: 0,
        awards: 0,
        engagements: 0,
        modalities: 0,
        impact_assessments: 0,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | null>(null);
    const [reviewNotes, setReviewNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchStats = async () => {
        try {
            const response = await api.get('/review', {
                params: { type: 'all' },
            });
            setStats(response.data.stats);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchSubmissions = async (type: string = 'all') => {
        setIsLoading(true);
        try {
            const response = await api.get('/review', {
                params: { type },
            });

            setSubmissions(response.data.data);
            console.log(response.data)
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
            toast.error('Failed to load submissions');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchSubmissions(activeTab);
    }, [activeTab]);

    const handleReviewClick = (submission: Submission, action: 'approved' | 'rejected') => {
        setSelectedSubmission(submission);
        setReviewAction(action);
        setReviewNotes('');
    };

    const handleSubmitReview = async () => {
        if (!selectedSubmission || !reviewAction) return;

        setIsSubmitting(true);
        try {
            const response = await api.post(`/review/${selectedSubmission.type}/${selectedSubmission.id}`, {
                status: reviewAction,
                review_notes: reviewNotes,
            });

            console.log(response.data)

            toast.success(
                `Submission ${reviewAction === 'approved' ? 'approved' : 'rejected'} successfully`
            );

            // Refresh submissions
            fetchSubmissions(activeTab);
            fetchStats();

            // Close dialog
            setSelectedSubmission(null);
            setReviewAction(null);
            setReviewNotes('');
        } catch (error) {
            console.error('Failed to submit review:', error);
            toast.error('Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getFilteredSubmissions = () => {
        if (activeTab === 'all') return submissions;

        const typeMap: Record<string, string> = {
            'tech-transfer': 'tech-transfer',
            'awards': 'award',
            'engagements': 'engagement',
            'modalities': 'modality',
            'impact-assessments': 'impact-assessment',
        };

        return submissions.filter((s) => s.type === typeMap[activeTab]);
    };

    const currentSubmissions = getFilteredSubmissions();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                <div>
                    <h1 className="text-2xl font-bold">Review Submissions</h1>
                    <p className="text-muted-foreground">
                        Review and approve pending submissions across all modules
                    </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">Pending</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tech Transfers</CardTitle>
                            <FolderOpen className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.tech_transfers}</div>
                            <p className="text-xs text-muted-foreground">Pending</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Awards</CardTitle>
                            <Trophy className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.awards}</div>
                            <p className="text-xs text-muted-foreground">Pending</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Engagements</CardTitle>
                            <Handshake className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.engagements}</div>
                            <p className="text-xs text-muted-foreground">Pending</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Impact</CardTitle>
                            <BarChart className="h-4 w-4 text-violet-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.impact_assessments}</div>
                            <p className="text-xs text-muted-foreground">Pending</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Modalities</CardTitle>
                            <Radio className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.modalities}</div>
                            <p className="text-xs text-muted-foreground">Pending</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Review Tab */}
                <div className="flex w-full flex-col gap-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="w-full grid grid-cols-3 lg:grid-cols-6">
                            <TabsTrigger value="all" className="text-xs">
                                All ({stats.total})
                            </TabsTrigger>
                            <TabsTrigger value="tech-transfer" className="text-xs">
                                Technology Transfers ({stats.tech_transfers})
                            </TabsTrigger>
                            <TabsTrigger value="awards" className="text-xs">
                                Awards ({stats.awards})
                            </TabsTrigger>
                            <TabsTrigger value="engagements" className="text-xs">
                                Engagements ({stats.engagements})
                            </TabsTrigger>
                            <TabsTrigger value="impact-assessments" className="text-xs">
                                Impact Assessments ({stats.impact_assessments})
                            </TabsTrigger>
                            <TabsTrigger value="modalities" className="text-xs">
                                Modalities ({stats.modalities})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeTab} className="space-y-4 ">
                            {isLoading ? (
                                <Card>
                                    <CardContent className="py-12">
                                        <div className="text-center text-muted-foreground">
                                            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50 animate-spin" />
                                            <p>Loading submissions...</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : currentSubmissions.length === 0 ? (
                                <Card>
                                    <CardContent className="py-12">
                                        <div className="text-center text-muted-foreground">
                                            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p className="text-lg font-medium">All caught up!</p>
                                            <p className="text-sm">No pending submissions in this category</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                currentSubmissions.map((submission) => (
                                    <SubmissionCard
                                        key={`${submission.type}-${submission.id}`}
                                        submission={submission}
                                        onReview={handleReviewClick}
                                    />
                                ))
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Review Dialog */}
            <Dialog
                open={!!selectedSubmission}
                onOpenChange={() => {
                    setSelectedSubmission(null);
                    setReviewAction(null);
                    setReviewNotes('');
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {reviewAction === 'approved' ? 'Approve' : 'Reject'} Submission
                        </DialogTitle>
                        <DialogDescription>
                            {reviewAction === 'approved'
                                ? 'This submission will be published and visible to the user.'
                                : 'The submitter will be notified and can revise their submission.'}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedSubmission && (
                        <div className="space-y-4">
                            <div className="bg-muted p-3 rounded-lg">
                                <Badge
                                    className={`${getTypeConfig(selectedSubmission.type).color
                                        } text-white text-xs mb-2`}
                                >
                                    {getTypeConfig(selectedSubmission.type).label}
                                </Badge>
                                <p className="font-medium text-sm">{selectedSubmission.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Submitted by {selectedSubmission.user.first_name} {selectedSubmission.user.last_name}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Review Notes{' '}
                                    {reviewAction === 'rejected' && (
                                        <span className="text-red-500">*</span>
                                    )}
                                </label>
                                <Textarea
                                    placeholder={
                                        reviewAction === 'approved'
                                            ? 'Add any comments (optional)'
                                            : 'Please provide reasons for rejection'
                                    }
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                    rows={4}
                                    className="resize-none"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSelectedSubmission(null);
                                setReviewAction(null);
                                setReviewNotes('');
                            }}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            className={
                                reviewAction === 'approved'
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : ''
                            }
                            variant={reviewAction === 'rejected' ? 'destructive' : 'default'}
                            onClick={handleSubmitReview}
                            disabled={
                                isSubmitting ||
                                (reviewAction === 'rejected' && !reviewNotes.trim())
                            }
                        >
                            {isSubmitting
                                ? 'Submitting...'
                                : `Confirm ${reviewAction === 'approved' ? 'Approval' : 'Rejection'
                                }`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
};

export default Review;