import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layout/app-layout';
import api from '@/lib/axios';
import type { BreadcrumbItem, Modalities } from '@/types';
import { Edit3, Radio, Tv, Globe, Folder, LoaderCircle, ExternalLink, Building } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';

export default function UserModalityShow() {
    const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
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
            toast.success('Modality Deleted Successfully');
            setPassword('');
            setErrorMessage('');
            setIsArchiveDialogOpen(false);
            navigate(`/user/modalities`);
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

    const resetDialog = () => {
        setIsArchiveDialogOpen(false);
        setPassword('');
        setErrorMessage('');
    };

    useEffect(() => {
        const fetchModality = async () => {
            try {
                const response = await api.get(`/modalities/${id}`);
                setModality(response.data.data);
            } catch (err: any) {
                toast.error('Failed to load modality');
                console.error(err);
                navigate('/user/modalities');
            } finally {
                setIsLoading(false);
            }
        };

        fetchModality();
    }, [id, navigate]);

    const getModalityIcon = () => {
        switch (modality?.modality?.toLowerCase()) {
            case 'tv':
            case 'television':
                return <Tv className="h-5 w-5" />;
            case 'radio':
                return <Radio className="h-5 w-5" />;
            case 'online':
            case 'internet':
                return <Globe className="h-5 w-5" />;
            default:
                return <Radio className="h-5 w-5" />;
        }
    };

    const getModalityColor = () => {
        switch (modality?.modality?.toLowerCase()) {
            case 'tv':
            case 'television':
                return 'bg-purple-100 text-purple-800';
            case 'radio':
                return 'bg-blue-100 text-blue-800';
            case 'online':
            case 'internet':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleEdit = () => {
        navigate(`/user/modalities/${modality?.id}/edit`);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Modalities', href: '/user/modalities' },
        { title: `Modality #${id}`, href: `/user/modalities/${id}` },
    ];

    if (isLoading || !modality) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex h-full items-center justify-center">
                    <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                <div className="flex items-center justify-between">
                    <h1 className='text-2xl font-bold'>Modality Details</h1>
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
                    {/* Main Modality Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {getModalityIcon()}
                                    Basic Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-light">Modality ID</Label>
                                        <Input
                                            value={modality.id}
                                            readOnly
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-light">Air Time / Schedule</Label>
                                        <Input
                                            value={modality.time_air || 'Not specified'}
                                            readOnly
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-light">Delivery Mode</Label>
                                        <div className="mt-1">
                                            <Badge className={`flex items-center gap-1 w-fit ${getModalityColor()}`}>
                                                {getModalityIcon()}
                                                {modality.modality || 'Not specified'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Media Channels */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Tv className="h-5 w-5" />
                                    Media Channels
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-light">TV Channel</Label>
                                        <Input
                                            value={modality.tv_channel || 'Not specified'}
                                            readOnly
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-light">Radio Station</Label>
                                        <Input
                                            value={modality.radio || 'Not specified'}
                                            readOnly
                                            className="mt-1"
                                        />
                                    </div>
                                    <div className='col-span-2'>
                                        <Label className="text-sm font-light">Online Link / Platform</Label>
                                        {modality.online_link ? (
                                            <div className="mt-1 flex items-center gap-2">
                                                <Input
                                                    value={modality.online_link}
                                                    readOnly
                                                    className="flex-1"
                                                />
                                                <Button size="sm" variant="outline" asChild>
                                                    <a href={modality.online_link} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            </div>
                                        ) : (
                                            <Input
                                                value="Not specified"
                                                readOnly
                                                className="mt-1"
                                            />
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Partnership Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    Partnership Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-light">Period / Duration</Label>
                                        <Input
                                            value={modality.period || 'Not specified'}
                                            readOnly
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-light">Hosted By</Label>
                                        <Input
                                            value={modality.hosted_by || 'Not specified'}
                                            readOnly
                                            className="mt-1"
                                        />
                                    </div>
                                    <div className='col-span-2'>
                                        <Label className="text-sm font-light">Partner Agency</Label>
                                        <Input
                                            value={modality.partner_agency || 'Not specified'}
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
                        {/* Associated Project */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Folder className="h-5 w-5" />
                                    Associated Project
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Card>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-lg font-semibold">{modality.tech_transfer.name}</h2>
                                            <Link to={`/user/technology-transfer/project/${modality.tech_transfer.id}`} className="text-blue-600 hover:underline flex space-x-1 items-center">
                                                <span className='text-sm'>View Project Details</span>
                                                <ExternalLink className="w-4" />
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Archive Dialog */}
            <Dialog open={isArchiveDialogOpen} onOpenChange={(open) => {
                if (!open) {
                    resetDialog();
                }
            }}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogDescription>
                            You are about to delete this modality. This action requires password confirmation.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid grid-cols-1 items-center gap-4">
                            <label htmlFor="password" className="text-sm font-medium">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="col-span-3"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleArchive();
                                    }
                                }}
                                disabled={isDeleting}
                            />
                        </div>
                        <InputError message={errorMessage} className="col-span-4" />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={resetDialog}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleArchive}
                            disabled={isDeleting || !password.trim()}
                            className="bg-red-700 hover:bg-red-800"
                        >
                            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
