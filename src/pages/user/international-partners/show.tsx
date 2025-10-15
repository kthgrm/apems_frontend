import InputError from '@/components/input-error'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import AppLayout from '@/layout/app-layout'
import api from '@/lib/axios'
import { asset } from '@/lib/utils'
import type { BreadcrumbItem, InternationalPartner } from '@/types'
import { Calendar, Download, Edit3, ExternalLink, File, Globe, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'

export default function UserInternationalPartnerShow() {
    const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [partner, setPartner] = useState<InternationalPartner | null>(null);
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
            await api.patch(`/international-partners/${partner?.id}/archive`, {
                password: password
            });
            toast.success('Partnership Deleted Successfully');
            setPassword('');
            setErrorMessage('');
            setIsArchiveDialogOpen(false);
            navigate(`/user/international-partners`);
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
        navigate(`/user/international-partner/${id}/edit`);
    };

    const resetArchiveDialog = () => {
        setIsArchiveDialogOpen(false);
        setPassword('');
        setErrorMessage('');
    };

    useEffect(() => {
        const fetchPartner = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`/international-partners/${id}`);
                setPartner(response.data.data);
            } catch (error) {
                console.error("Failed to fetch partnership:", error);
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
            title: 'International Partners',
            href: '/user/international-partner',
        },
        {
            title: isLoading ? 'Loading...' : partner ? partner.agency_partner : 'Partnership Not Found',
            href: `/user/international-partner/${id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                    Loading partnership details...
                </div>
            ) : (
                partner ? (
                    <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                        <div className="flex items-center justify-between">
                            <h1 className='text-2xl font-bold'>Partnership Details</h1>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={handleEdit}
                                >
                                    <Edit3 className="h-4 w-4 mr-2" />
                                    Edit Partnership
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="justify-start bg-red-800 hover:bg-red-900"
                                    onClick={() => setIsArchiveDialogOpen(true)}
                                >
                                    Delete Partnership
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Partnership Information */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Basic Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Globe className="h-5 w-5" />
                                            Partner Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-light">Partner ID</Label>
                                                <Input value={partner.id || 'Not specified'} readOnly className="mt-1" />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-light">Agency Partner</Label>
                                                <Input value={partner.agency_partner || 'Not specified'} readOnly className="mt-1" />
                                            </div>
                                            <div className="col-span-1 md:col-span-2">
                                                <Label className="text-sm font-light">Location</Label>
                                                <Input value={partner.location || 'Not specified'} readOnly className="mt-1" />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-light">Activity Type</Label>
                                                <div className="mt-1">
                                                    <Badge
                                                        variant="outline">
                                                        {partner.activity_conducted.charAt(0).toUpperCase() + partner.activity_conducted.slice(1) || 'Not specified'}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="col-span-1 md:col-span-2">
                                                <Label className="text-sm font-light">Narrative</Label>
                                                <Textarea value={partner.narrative || 'No narrative provided'} readOnly className="mt-1" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Participation Metrics */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5" />
                                            Participation Metrics
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-light">Number of Participants</Label>
                                                <Input
                                                    value={partner.number_of_participants?.toLocaleString() || 'Not specified'}
                                                    readOnly
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-light">Committee Members</Label>
                                                <Input
                                                    value={partner.number_of_committee.toLocaleString() || 'Not specified'}
                                                    readOnly
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Timeline and Duration */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5" />
                                            Timeline & Duration
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-light">Start Date</Label>
                                                <Input
                                                    value={partner.start_date ? new Date(partner.start_date).toLocaleDateString() : 'Not set'}
                                                    readOnly
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-light">End Date</Label>
                                                <Input
                                                    value={partner.end_date ? new Date(partner.end_date).toLocaleDateString() : 'Not set'}
                                                    readOnly
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div className="col-span-1 md:col-span-2">
                                                <Label className="text-sm font-light">Duration</Label>
                                                <Input
                                                    value={
                                                        partner.start_date && partner.end_date
                                                            ? (() => {
                                                                const start = new Date(partner.start_date);
                                                                const end = new Date(partner.end_date);
                                                                const diffTime = Math.abs(end.getTime() - start.getTime());
                                                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                                                                return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
                                                            })()
                                                            : 'Not specified'
                                                    }
                                                    readOnly
                                                    className="mt-1 bg-muted"
                                                />
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
                                            {partner.attachment_paths && partner.attachment_paths.length > 0 ? (
                                                partner.attachment_paths.map((path, index) => {
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
                                            {partner.attachment_link ? (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <ExternalLink className="h-4 w-4" />
                                                        <span className="text-sm">External Link</span>
                                                    </div>

                                                    <a
                                                        href={partner.attachment_link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-500 hover:underline text-sm flex items-center gap-1"
                                                    >
                                                        {partner.attachment_link}
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
                            </div>
                        </div>

                        {/* Archive Dialog */}
                        <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Confirm Delete</DialogTitle>
                                    <DialogDescription>
                                        This action requires password confirmation.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-2">
                                    <div className="grid grid-cols-1 items-center gap-4">
                                        <Label htmlFor="password" className="text-sm font-medium">
                                            Password
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={isDeleting}
                                        />
                                    </div>
                                    <InputError message={errorMessage} />
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={resetArchiveDialog} disabled={isDeleting}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleArchive} disabled={isDeleting || !password.trim()} className="bg-red-700 hover:bg-red-800">
                                        {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        Partnership not found.
                    </div>
                )
            )}
        </AppLayout>
    )
}
