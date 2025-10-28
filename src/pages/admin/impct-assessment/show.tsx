import InputError from '@/components/input-error'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import type { BreadcrumbItem, ImpactAssessment } from '@/types'
import { Building, Edit3, ExternalLink, File, Target } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useParams } from 'react-router-dom'

export default function ImpactAssessmentShow() {
    const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [assessment, setAssessment] = useState<ImpactAssessment | null>(null);
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
            await api.patch(`/impact-assessments/${assessment?.id}/archive`, {
                password: password
            });
            toast.success('Assessment Archived Successfully');
            setPassword('');
            setErrorMessage('');
            setIsArchiveDialogOpen(false);
            navigate(`/admin/impact-assessment?campus=${assessment?.tech_transfer.college.campus_id}&college=${assessment?.tech_transfer.college_id}`);
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
        navigate(`/admin/impact-assessment/${id}/edit`);
    };

    const resetArchiveDialog = () => {
        setIsArchiveDialogOpen(false);
        setPassword('');
        setErrorMessage('');
    };

    useEffect(() => {
        const fetchAssessment = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`impact-assessments/${id}`);
                console.log(response.data.data);
                setAssessment(response.data.data);
            } catch (error) {
                console.error("Failed to fetch assessment:", error);
            } finally {
                setIsLoading(false);
            }
        }

        if (id) {
            fetchAssessment();
        }
    }, [id]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Impact Assessments',
            href: '/admin/impact-assessment',
        },
        {
            title: isLoading ? 'Loading...' : assessment ? assessment.tech_transfer.name : 'Not Found',
            href: `/admin/impact-assessment/${id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                    Loading assessment details...
                </div>
            ) : (
                assessment ? (
                    <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                        <div className="flex items-center justify-between">
                            <h1 className='text-2xl font-bold'>Assessment Details</h1>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={handleEdit}
                                >
                                    <Edit3 className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="justify-start bg-red-800 hover:bg-red-900"
                                    onClick={() => setIsArchiveDialogOpen(true)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Assessment Information */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Basic Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Target className="h-5 w-5 text-purple-600" />
                                            Assessment Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-light">RREID</Label>
                                                <Input
                                                    value={assessment.id}
                                                    readOnly
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-light">Title</Label>
                                                <Input
                                                    value={assessment.title || 'Not set'}
                                                    readOnly
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div className='col-span-2'>
                                                <Label className="text-sm font-light">Description</Label>
                                                <Textarea
                                                    value={assessment.description || 'Not set'}
                                                    readOnly
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div className='col-span-2'>
                                                <Label className="text-sm font-light">Associated Project</Label>
                                                <Card className="mt-1">
                                                    <CardContent>
                                                        {assessment.tech_transfer_id ? (
                                                            <div className="flex items-center justify-between">
                                                                <h2 className="text-lg font-semibold">{assessment.tech_transfer.name}</h2>
                                                                <Link to={`/user/technology-transfer/${assessment.tech_transfer.id}`} className="text-blue-600 hover:underline flex space-x-1 items-center">
                                                                    <span className='text-sm'>View Project Details</span>
                                                                    <ExternalLink className="w-4" />
                                                                </Link>
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground">No associated project.</p>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </div>
                                            <div className="col-span-2">
                                                <Label className="text-sm font-light">Terminal Report</Label>
                                                {assessment.attachment_paths && assessment.attachment_paths.length > 0 ? (
                                                    assessment.attachment_paths.map((path, index) => {
                                                        const fileName = path.split('/').pop() || `Attachment ${index + 1}`;

                                                        return (
                                                            <div key={index} className="flex items-center p-3 border rounded-lg mt-1">

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
                                                    <div className="flex items-center p-3 border rounded-lg mt-1">
                                                        <div className="text-sm gap-2 flex items-center">
                                                            <File className="h-4 w-4" />
                                                            No Attachment
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {assessment.tech_transfer && (
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
                                                    {assessment?.tech_transfer.college.campus.logo && (
                                                        <Avatar className="size-8">
                                                            <AvatarImage src={asset(assessment.tech_transfer.college.campus.logo)} alt="Campus logo" />
                                                            <AvatarFallback><Building className='p-0.5' /></AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    <span className="text-sm font-medium">{assessment?.tech_transfer.college.campus.name}</span>
                                                </div>
                                            </div>
                                            <Separator />
                                            <div>
                                                <Label className="text-sm font-medium">College</Label>
                                                <div className="mt-1 flex items-center gap-2">
                                                    {assessment?.tech_transfer.college.logo && (
                                                        <Avatar className="size-8">
                                                            <AvatarImage src={asset(assessment.tech_transfer.college.logo)} alt="College logo" />
                                                            <AvatarFallback><Building className='p-0.5' /></AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">{assessment?.tech_transfer.name}</span>
                                                        <span className="text-xs text-muted-foreground">{assessment?.tech_transfer.college.code}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

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
                                                    <span>{new Date(assessment.created_at).toLocaleDateString()}</span>
                                                    <span className='text-xs text-stone-500'>
                                                        {new Date(assessment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Last Updated</span>
                                                <div className='flex flex-col items-end'>
                                                    <span>{new Date(assessment.updated_at).toLocaleDateString()}</span>
                                                    <span className='text-xs text-stone-500'>
                                                        {new Date(assessment.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Created By</span>
                                                <span>{assessment?.user.first_name + ' ' + assessment?.user.last_name}</span>
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
                                        To delete this assessment, please enter your password to confirm this action.
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
                                        {isDeleting ? 'Deleting...' : 'Delete Assessment'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        Assessment not found.
                    </div>
                )
            )}
        </AppLayout>
    )
}