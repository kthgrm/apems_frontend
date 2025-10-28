import InputError from '@/components/input-error'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import AppLayout from '@/layout/app-layout'
import api from '@/lib/axios'
import { asset } from '@/lib/utils'
import type { BreadcrumbItem, TechnologyTransfer } from '@/types'
import { Building, CalendarDays, CheckCircle, CircleCheck, CircleDot, CircleX, Download, Edit3, ExternalLink, File, FileText, Mail, MapPin, Phone, Target, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'

const TechnologyTransferShow = () => {
    const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [techTransfer, setTechTransfer] = useState<TechnologyTransfer | null>(null);
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
            await api.patch(`/tech-transfers/${techTransfer?.id}/archive`, {
                password: password
            });
            toast.success('Project Deleted Successfully');
            setPassword('');
            setErrorMessage('');
            setIsArchiveDialogOpen(false);
            navigate(`/admin/technology-transfer?campus=${techTransfer?.college.campus_id}&college=${techTransfer?.college_id}`);
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
        navigate(`/admin/technology-transfer/${id}/edit`);
    };

    const resetArchiveDialog = () => {
        setIsArchiveDialogOpen(false);
        setPassword('');
        setErrorMessage('');
    };

    useEffect(() => {
        const fetchProject = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`tech-transfers/${id}`);
                console.log(response.data.data);
                setTechTransfer(response.data.data);
            } catch (error) {
                console.error("Failed to fetch project:", error);
            } finally {
                setIsLoading(false);
            }
        }

        if (id) {
            fetchProject();
        }
    }, [id]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Technology Transfer',
            href: '/admin/technology-transfer',
        },
        {
            title: isLoading ? 'Loading...' : techTransfer ? techTransfer.name : 'Project Not Found',
            href: `/admin/technology-transfer/${id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                    Loading project details...
                </div>
            ) : (
                techTransfer ? (
                    <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                        <div className="flex items-center justify-between">
                            <h1 className='text-2xl font-bold'>Project Details</h1>
                            <div className="flex gap-2">
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
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Project Information */}
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
                                                <Label className="text-sm font-light">Project ID</Label>
                                                <Input value={techTransfer?.id} readOnly className="mt-1" />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-light">Project Name</Label>
                                                <Input value={techTransfer?.name} readOnly className="mt-1" />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-light">Category</Label>
                                                <Input value={techTransfer?.category || 'Not specified'} readOnly className="mt-1" />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-light">Leader</Label>
                                                <Input value={techTransfer?.leader || 'Not specified'} readOnly className="mt-1" />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-light">Description</Label>
                                            <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                                                {techTransfer?.description || 'No description provided'}
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-light">Purpose</Label>
                                            <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                                                {techTransfer?.purpose || 'No purpose provided'}
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-light">Deliverables</Label>
                                            <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                                                {techTransfer?.deliverables || 'No deliverables provided'}
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-light">Tags</Label>
                                            {techTransfer?.tags && (
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {techTransfer?.tags.split(',').map((tag, index) => (
                                                        <Badge key={index} variant="outline">
                                                            {tag.trim()}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                            {!techTransfer?.tags && (
                                                <div className="mt-1 text-sm text-muted-foreground">No tags specified</div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Partner Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Partner Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-light">Agency Partner</Label>
                                                <Input value={techTransfer?.agency_partner || 'Not specified'} readOnly className="mt-1" />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-light">Contact Person</Label>
                                                <Input value={techTransfer?.contact_person || 'Not specified'} readOnly className="mt-1" />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-light flex items-center gap-1">
                                                    <Mail className="h-4 w-4" />
                                                    Email
                                                </Label>
                                                <Input value={techTransfer?.contact_email || 'Not specified'} readOnly className="mt-1" />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-light flex items-center gap-1">
                                                    <Phone className="h-4 w-4" />
                                                    Phone
                                                </Label>
                                                <Input value={techTransfer?.contact_phone || 'Not specified'} readOnly className="mt-1" />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-light flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                Address
                                            </Label>
                                            <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                                                {techTransfer?.contact_address || 'No address provided'}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Institution Information */}
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
                                                {techTransfer?.college.campus.logo && (
                                                    <Avatar className="size-8">
                                                        <AvatarImage src={asset(techTransfer.college.campus.logo)} alt="Campus logo" />
                                                        <AvatarFallback><Building className='p-0.5' /></AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <span className="text-sm font-medium">{techTransfer?.college.campus.name}</span>
                                            </div>
                                        </div>
                                        <Separator />
                                        <div>
                                            <Label className="text-sm font-medium">College</Label>
                                            <div className="mt-1 flex items-center gap-2">
                                                {techTransfer?.college.logo && (
                                                    <Avatar className="size-8">
                                                        <AvatarImage src={asset(techTransfer.college.logo)} alt="College logo" />
                                                        <AvatarFallback><Building className='p-0.5' /></AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{techTransfer?.college.name}</span>
                                                    <span className="text-xs text-muted-foreground">{techTransfer?.college.code}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Timeline */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <CalendarDays className="h-5 w-5" />
                                            Timeline
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-light">Start Date</Label>
                                                <Input
                                                    value={techTransfer?.start_date ? new Date(techTransfer.start_date).toLocaleDateString() : 'Not set'}
                                                    readOnly
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-light">End Date</Label>
                                                <Input
                                                    value={techTransfer?.end_date ? new Date(techTransfer.end_date).toLocaleDateString() : 'Not set'}
                                                    readOnly
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Intellectual Property */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            Intellectual Property
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-light">Copyright</Label>
                                                <div className="mt-1 flex items-center gap-2">
                                                    {techTransfer?.copyright === 'yes' ? (
                                                        <Badge variant="outline" className="flex items-center gap-1">
                                                            <CheckCircle className="w-4 text-green-500" />
                                                            Yes
                                                        </Badge>
                                                    ) : techTransfer?.copyright === 'pending' ? (
                                                        <Badge variant="outline" className="flex items-center gap-1">
                                                            <CircleDot className="w-4 text-yellow-500" />
                                                            Pending
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="flex items-center gap-1">
                                                            <CircleX className="w-4 text-red-500" />
                                                            No
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-light">IP Details</Label>
                                            <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                                                {techTransfer?.ip_details ? techTransfer.ip_details : 'No details provided'}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Attachments */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Download className="h-5 w-5" />
                                            Attachments
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="space-y-2">
                                            {techTransfer.attachment_paths && techTransfer.attachment_paths.length > 0 ? (
                                                techTransfer.attachment_paths.map((path, index) => {
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
                                            {techTransfer.attachment_link ? (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <ExternalLink className="h-4 w-4" />
                                                        <span className="text-sm">External Link</span>
                                                    </div>

                                                    <a
                                                        href={techTransfer.attachment_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-500 hover:underline text-sm flex items-center gap-1"
                                                    >
                                                        {techTransfer.attachment_link}
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
                                                    <span>{new Date(techTransfer.created_at).toLocaleDateString()}</span>
                                                    <span className='text-xs text-stone-500'>
                                                        {new Date(techTransfer.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Last Updated</span>
                                                <div className='flex flex-col items-end'>
                                                    <span>{new Date(techTransfer.updated_at).toLocaleDateString()}</span>
                                                    <span className='text-xs text-stone-500'>
                                                        {new Date(techTransfer.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Created By</span>
                                                <span>{techTransfer?.user.first_name + ' ' + techTransfer?.user.last_name}</span>
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
                                        To delete this project, please enter your password to confirm this action.
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
                                        {isDeleting ? 'Deleting...' : 'Delete Project'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        Project not found.
                    </div>
                )
            )}
        </AppLayout>
    )
}

export default TechnologyTransferShow