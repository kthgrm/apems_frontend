import InputError from '@/components/input-error'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import AppLayout from '@/layout/app-layout'
import api from '@/lib/axios'
import { asset } from '@/lib/utils'
import type { Award, BreadcrumbItem } from '@/types'
import { Building, Calendar, Check, Download, Edit3, ExternalLink, File, Target, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'

export default function AwardShow() {
    const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
    const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | null>(null);
    const [reviewNotes, setReviewNotes] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [award, setAward] = useState<Award | null>(null);
    const { id } = useParams();
    const navigate = useNavigate();

    const handleArchive = async () => {
        if (!password.trim()) {
            setErrorMessage('Please enter your password to confirm.');
            return;
        }

        setIsDeleting(true);
        setErrorMessage('');

        try {
            await api.patch(`/awards/${award?.id}/archive`, {
                password: password
            });
            toast.success('Award Deleted Successfully');
            setPassword('');
            setErrorMessage('');
            setIsArchiveDialogOpen(false);
            navigate(`/admin/awards-recognition?campus=${award?.college.campus_id}&college=${award?.college_id}`);
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.password) {
                setErrorMessage(error.response.data.password);
            } else if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('Deletion failed. Please try again.');
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = () => {
        navigate(`/admin/awards-recognition/${id}/edit`);
    };

    const handleReview = async () => {
        setIsProcessing(true);
        try {
            const status = reviewAction === 'approved' ? 'approved' : 'rejected';
            const res = await api.post(`/review/award/${id}`, { status: status, notes: reviewNotes });
            toast.success(`Award ${status} successfully`);
            navigate(`/admin/awards-recognition?campus=${award?.college.campus_id}&college=${award?.college_id}`);
            console.log(res.data);
        } catch (error) {
            console.error('Failed to submit review:', error);
            toast.error('Failed to submit review');
        } finally {
            setIsProcessing(false);
        }
    }

    const resetArchiveDialog = () => {
        setIsArchiveDialogOpen(false);
        setPassword('');
        setErrorMessage('');
    };

    useEffect(() => {
        const fetchPartner = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`awards/${id}`);
                console.log(response.data.data);
                setAward(response.data.data);
            } catch (error) {
                console.error("Failed to fetch award:", error);
            } finally {
                setIsLoading(false);
            }
        }

        if (id) {
            fetchPartner();
        }
    }, [id]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Awards',
            href: '/admin/awards-recognition',
        },
        {
            title: isLoading ? 'Loading...' : award ? award.award_name : 'Not Found',
            href: `/admin/awards-recognition/${id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                    Loading award details...
                </div>
            ) : (
                award ? (
                    <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                        <div className="flex items-center justify-between">
                            <h1 className='text-2xl font-bold'>Award Details</h1>
                            <div className="flex gap-2">
                                {award.status === 'approved' ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={handleEdit}
                                        >
                                            <Edit3 className="h-4 w-4 mr-2" />
                                            Edit Project
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            className="justify-start bg-red-800 hover:bg-red-900"
                                            onClick={() => setIsArchiveDialogOpen(true)}
                                        >
                                            Delete Project
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            onClick={() => {
                                                setIsReviewDialogOpen(true)
                                                setReviewAction('approved')
                                            }}
                                            className='bg-green-500 hover:bg-green-600 text-white'
                                            disabled={isProcessing}
                                        >
                                            <Check className="h-4 w-4" />
                                            Approve
                                        </Button>
                                        <Button
                                            className="justify-start bg-red-800 hover:bg-red-900 text-white"
                                            onClick={() => {
                                                setIsReviewDialogOpen(true)
                                                setReviewAction('rejected')
                                            }}
                                            disabled={isProcessing}
                                        >
                                            <X className="h-4 w-4" />
                                            Reject
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Partnership Information */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Basic Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Target className="h-5 w-5" />
                                            Basic Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-light">Award ID</Label>
                                                <Input value={award.id} readOnly className="mt-1" />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-light">Award Name</Label>
                                                <Input value={award.award_name} readOnly className="mt-1" />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-light">Description</Label>
                                            <Textarea readOnly className="mt-1" rows={3} value={award.description || 'No description provided'} />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Event Details */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5" />
                                            Event Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                            <div>
                                                <Label className="text-sm font-light">Awarding Body</Label>
                                                <Input value={award.awarding_body} readOnly className="mt-1" />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-light">Location</Label>
                                                <Input value={award.location} readOnly className="mt-1" />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-light">Date Received</Label>
                                            <Input value={new Date(award.date_received).toLocaleDateString()} readOnly />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-light">Event Details</Label>
                                            <Textarea readOnly className="mt-1" rows={3} value={award.event_details || 'No event details provided'} />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* People Involved */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            People Involved
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {award.people_involved ? (
                                            <div className="flex flex-wrap gap-2">
                                                {award.people_involved.split(', ').map((person, index) => (
                                                    <Badge key={index} variant="outline" className="text-sm">
                                                        {person}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No people involved</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Department */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Building className="h-5 w-5" />
                                            Department
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label className="text-sm font-medium">Campus</Label>
                                            <div className="mt-1 flex items-center gap-2">
                                                {award?.college.campus.logo && (
                                                    <Avatar className="size-8">
                                                        <AvatarImage src={asset(award.college.campus.logo)} alt="Campus logo" />
                                                        <AvatarFallback><Building className='p-0.5' /></AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <span className="text-sm font-medium">{award?.college.campus.name}</span>
                                            </div>
                                        </div>
                                        <Separator />
                                        <div>
                                            <Label className="text-sm font-medium">College</Label>
                                            <div className="mt-1 flex items-center gap-2">
                                                {award?.college.logo && (
                                                    <Avatar className="size-8">
                                                        <AvatarImage src={asset(award.college.logo)} alt="College logo" />
                                                        <AvatarFallback><Building className='p-0.5' /></AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{award?.college.name}</span>
                                                    <span className="text-xs text-muted-foreground">{award?.college.code}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Attachment */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Download className="h-5 w-5" />
                                            Attachments
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="space-y-2">
                                            {award.attachment_paths && award.attachment_paths.length > 0 ? (
                                                award.attachment_paths.map((path, index) => {
                                                    const fileName = path.split('/').pop() || `Attachment ${index + 1}`;

                                                    return (
                                                        <div key={index} className="flex items-center p-3 border rounded-lg">

                                                            <a
                                                                href={asset(path)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 text-blue-500 hover:underline w-full"
                                                            >
                                                                <File className="h-4 w-4 flex-shrink-0" />
                                                                <span className="text-sm flex-1 truncate">{fileName}</span>
                                                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                                            </a>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="flex items-center p-3 border rounded-lg">
                                                    <div className="text-sm gap-2 flex items-center">
                                                        <File className="h-4 w-4" />
                                                        No Attachment
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between p-3 border rounded-lg">
                                            {award.attachment_link ? (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <ExternalLink className="h-4 w-4" />
                                                        <span className="text-sm">External Link</span>
                                                    </div>

                                                    <a
                                                        href={award.attachment_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-500 hover:underline text-sm flex items-center gap-1"
                                                    >
                                                        {award.attachment_link}
                                                    </a>
                                                </div>
                                            ) : (
                                                <div className="text-sm gap-2 flex items-center">
                                                    <ExternalLink className="h-4 w-4" />
                                                    No External Link
                                                </div>
                                            )}

                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Record Details */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Record Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Created</span>
                                                <div className='flex flex-col items-end'>
                                                    <span>{new Date(award.created_at).toLocaleDateString()}</span>
                                                    <span className='text-xs text-stone-500'>
                                                        {new Date(award.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Last Updated</span>
                                                <div className='flex flex-col items-end'>
                                                    <span>{new Date(award.updated_at).toLocaleDateString()}</span>
                                                    <span className='text-xs text-stone-500'>
                                                        {new Date(award.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Created By</span>
                                                <span>{award?.user.first_name + ' ' + award?.user.last_name}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Archive Confirmation Dialog */}
                        <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Confirm Delete</DialogTitle>
                                    <DialogDescription>
                                        To delete this award, please enter your password to confirm this action.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-2">
                                    <div className="grid grid-cols-1 items-center gap-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <InputError message={errorMessage} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={resetArchiveDialog} disabled={isDeleting}>
                                        Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={handleArchive} disabled={isDeleting} className="bg-red-800 hover:bg-red-900">
                                        {isDeleting ? 'Deleting...' : 'Delete Award'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Dialog
                            open={isReviewDialogOpen}
                            onOpenChange={() => {
                                setIsReviewDialogOpen(false);
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
                                <div className="space-y-4">
                                    <div className="bg-muted p-3 rounded-lg">
                                        <p className="font-medium text-sm">{award.award_name}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Submitted by {award.user.first_name} {award.user.last_name}
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

                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsReviewDialogOpen(false);
                                            setReviewAction(null);
                                            setReviewNotes('');
                                        }}
                                        disabled={isProcessing}
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
                                        onClick={handleReview}
                                        disabled={
                                            isProcessing ||
                                            (reviewAction === 'rejected' && !reviewNotes.trim())
                                        }
                                    >
                                        {isProcessing
                                            ? 'Submitting...'
                                            : `Confirm ${reviewAction === 'approved' ? 'Approval' : 'Rejection'
                                            }`}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        Award not found.
                    </div>
                )
            )}
        </AppLayout>
    )
}