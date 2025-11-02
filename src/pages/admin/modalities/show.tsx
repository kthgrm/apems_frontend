import InputError from '@/components/input-error'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import AppLayout from '@/layout/app-layout'
import api from '@/lib/axios'
import { asset } from '@/lib/utils'
import type { BreadcrumbItem, Modalities } from '@/types'
import { Building, Check, Edit3, FileText, Globe, Paperclip, Radio, Target, Tv, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'

export default function ModalityShow() {
    const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
    const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | null>(null);
    const [remarks, setRemarks] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [modality, setModality] = useState<Modalities | null>(null);
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
            await api.patch(`/modalities/${modality?.id}/archive`, {
                password: password
            });
            toast.success('Modality deleted Successfully');
            setPassword('');
            setErrorMessage('');
            setIsArchiveDialogOpen(false);
            navigate(`/admin/modalities?campus=${modality?.tech_transfer.college.campus_id}&college=${modality?.tech_transfer.college_id}`);
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
        navigate(`/admin/modalities/${id}/edit`);
    };

    const handleReview = async () => {
        setIsProcessing(true);
        try {
            const status = reviewAction === 'approved' ? 'approved' : 'rejected';
            const res = await api.post(`/review/modality/${id}`, { status: status, remarks: remarks });
            toast.success(`Modality ${status} successfully`);
            navigate(`/admin/modalities?campus=${modality?.tech_transfer.college.campus_id}&college=${modality?.tech_transfer.college_id}`);
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
                const response = await api.get(`modalities/${id}`);
                console.log(response.data.data);
                setModality(response.data.data);
            } catch (error) {
                console.error("Failed to fetch modality:", error);
            } finally {
                setIsLoading(false);
            }
        }

        if (id) {
            fetchPartner();
        }
    }, [id]);

    const getModalityIcon = (modalityType: string) => {
        switch (modalityType.toLowerCase()) {
            case 'tv':
            case 'television':
                return <Tv className="h-5 w-5 text-blue-600" />;
            case 'radio':
                return <Radio className="h-5 w-5 text-green-600" />;
            case 'online':
            case 'digital':
                return <Globe className="h-5 w-5 text-purple-600" />;
            default:
                return <Building className="h-5 w-5 text-gray-600" />;
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Modalities',
            href: '/admin/modalities',
        },
        {
            title: isLoading ? 'Loading...' : modality ? modality.tech_transfer.name : 'Not Found',
            href: `/admin/modalities/${id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                    Loading modalities details...
                </div>
            ) : (
                modality ? (
                    <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                        <div className="flex items-center justify-between">
                            <h1 className='text-2xl font-bold'>Modality Details</h1>
                            <div className="flex gap-2">
                                {modality.status === 'approved' ? (
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
                                                <Label className="text-sm font-medium">Modality ID</Label>
                                                <Input value={modality.id} readOnly className="mt-1" />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">Modality Type</Label>
                                                <div className="mt-1 p-2 bg-muted rounded-md flex items-center gap-2">
                                                    {getModalityIcon(modality.modality)}
                                                    <span className="font-medium">{modality.modality}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">Air Time</Label>
                                                <Input value={modality.time_air} readOnly className="mt-1" />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">Period</Label>
                                                <Input value={modality.period} readOnly className="mt-1" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Broadcast Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Radio className="h-5 w-5" />
                                            Broadcast Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-medium">TV Channel</Label>
                                                <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                                    <div className="flex items-center gap-2">
                                                        <Tv className="h-5 w-5 text-blue-600" />
                                                        <span className="font-semibold text-blue-800">
                                                            {modality.tv_channel || 'Not specified'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium">Radio Station</Label>
                                                <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded-md">
                                                    <div className="flex items-center gap-2">
                                                        <Radio className="h-5 w-5 text-green-600" />
                                                        <span className="font-semibold text-green-800">
                                                            {modality.radio || 'Not specified'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="md:col-span-2">
                                                <Label className="text-sm font-medium">Online Platform</Label>
                                                <div className="mt-1 p-3 bg-purple-50 border border-purple-200 rounded-md">
                                                    <div className="flex items-center gap-2">
                                                        <Globe className="h-5 w-5 text-purple-600" />
                                                        {modality.online_link ? (
                                                            <a
                                                                href={modality.online_link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="font-semibold text-purple-800 hover:text-purple-900 underline"
                                                            >
                                                                {modality.online_link}
                                                            </a>
                                                        ) : (
                                                            <span className="font-semibold text-purple-800">
                                                                Not specified
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Partnership Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Partnership Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {modality.partner_agency && (
                                                <div>
                                                    <Label className="text-sm font-medium">Partner Agency</Label>
                                                    <Input value={modality.partner_agency} readOnly className="mt-1" />
                                                </div>
                                            )}
                                            {modality.hosted_by && (
                                                <div>
                                                    <Label className="text-sm font-medium">Hosted By</Label>
                                                    <Input value={modality.hosted_by} readOnly className="mt-1" />
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {modality.tech_transfer && (
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
                                                    {modality?.tech_transfer.college.campus.logo && (
                                                        <Avatar className="size-8">
                                                            <AvatarImage src={asset(modality.tech_transfer.college.campus.logo)} alt="Campus logo" />
                                                            <AvatarFallback><Building className='p-0.5' /></AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    <span className="text-sm font-medium">{modality?.tech_transfer.college.campus.name}</span>
                                                </div>
                                            </div>
                                            <Separator />
                                            <div>
                                                <Label className="text-sm font-medium">College</Label>
                                                <div className="mt-1 flex items-center gap-2">
                                                    {modality?.tech_transfer.college.logo && (
                                                        <Avatar className="size-8">
                                                            <AvatarImage src={asset(modality.tech_transfer.college.logo)} alt="College logo" />
                                                            <AvatarFallback><Building className='p-0.5' /></AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">{modality?.tech_transfer.name}</span>
                                                        <span className="text-xs text-muted-foreground">{modality?.tech_transfer.college.code}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Related Project Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            Related Project
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={`w-full flex items-center justify-start gap-2 ${modality.tech_transfer.is_archived
                                                        ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-500'
                                                        : ''
                                                        }`}
                                                    onClick={modality.tech_transfer.is_archived
                                                        ? undefined
                                                        : () => window.location.href = `/admin/technology-transfer/${modality.tech_transfer.id}`
                                                    }
                                                >
                                                    <Paperclip className="h-5 w-5" />
                                                    {modality.tech_transfer.name}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>
                                                    {modality.tech_transfer.is_archived
                                                        ? 'This project has been deleted'
                                                        : 'Go to project details'
                                                    }
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
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
                                                    <span>{new Date(modality.created_at).toLocaleDateString()}</span>
                                                    <span className='text-xs text-stone-500'>
                                                        {new Date(modality.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Last Updated</span>
                                                <div className='flex flex-col items-end'>
                                                    <span>{new Date(modality.updated_at).toLocaleDateString()}</span>
                                                    <span className='text-xs text-stone-500'>
                                                        {new Date(modality.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Created By</span>
                                                <span>{modality?.user.first_name + ' ' + modality?.user.last_name}</span>
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
                                        To delete this partner, please enter your password to confirm this action.
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
                                        {isDeleting ? 'Deleting...' : 'Delete Partner'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Dialog
                            open={isReviewDialogOpen}
                            onOpenChange={() => {
                                setIsReviewDialogOpen(false);
                                setReviewAction(null);
                                setRemarks('');
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
                                        <p className="font-medium text-sm">{modality.tech_transfer.name}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Submitted by {modality.user.first_name} {modality.user.last_name}
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
                                            value={remarks}
                                            onChange={(e) => setRemarks(e.target.value)}
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
                                            setRemarks('');
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
                                            (reviewAction === 'rejected' && !remarks.trim())
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
                        Modality not found.
                    </div>
                )
            )}
        </AppLayout>
    )
}