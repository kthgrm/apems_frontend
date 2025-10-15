import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layout/app-layout';
import api from '@/lib/axios';
import type { BreadcrumbItem, ImpactAssessment } from '@/types';
import { Edit3, Target, Folder, LoaderCircle, ExternalLink, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';

export default function UserImpactAssessmentShow() {
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
            toast.success('Impact Assessment Deleted Successfully');
            setPassword('');
            setErrorMessage('');
            setIsArchiveDialogOpen(false);
            navigate(`/user/impact-assessments`);
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
        const fetchAssessment = async () => {
            try {
                const response = await api.get(`/impact-assessments/${id}`);
                setAssessment(response.data.data);
            } catch (err: any) {
                toast.error('Failed to load impact assessment');
                console.error(err);
                navigate('/user/impact-assessments');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAssessment();
    }, [id, navigate]);

    const handleEdit = () => {
        navigate(`/user/impact-assessment/${assessment?.id}/edit`);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Impact Assessments', href: '/user/impact-assessments' },
        { title: isLoading ? 'Loading...' : assessment ? assessment.tech_transfer.name : 'Assessment Not Found', href: `/user/impact-assessment/${id}` },
    ];

    if (isLoading || !assessment) {
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
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-medium">{assessment.tech_transfer?.name || 'Unknown Project'}</h1>
                            <p className="text-muted-foreground">Assessment Details</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                    {/* Main Assessment Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-purple-600" />
                                    Basic Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-light">Assessment ID</Label>
                                        <Input
                                            value={assessment.id}
                                            readOnly
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-light">Beneficiary</Label>
                                        <Input
                                            value={assessment.beneficiary || 'Not set'}
                                            readOnly
                                            className="mt-1"
                                        />
                                    </div>
                                    <div className='col-span-2'>
                                        <Label className="text-sm font-light">Geographic Coverage</Label>
                                        <Input
                                            value={assessment.geographic_coverage || 'Not set'}
                                            readOnly
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Impact Metrics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-light">Direct Beneficiary</Label>
                                        <Input
                                            value={assessment.num_direct_beneficiary || 'Not set'}
                                            readOnly
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-light">Indirect Beneficiary</Label>
                                        <Input
                                            value={assessment.num_indirect_beneficiary || 'Not set'}
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
                        {assessment.tech_transfer && (
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
                                                <h2 className="text-lg font-semibold">{assessment.tech_transfer.name}</h2>
                                                <Link to={`/user/technology-transfer/${assessment.tech_transfer.id}`} className="text-blue-600 hover:underline flex space-x-1 items-center">
                                                    <span className='text-sm'>View Project Details</span>
                                                    <ExternalLink className="w-4" />
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </CardContent>
                            </Card>
                        )}
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
                            You are about to delete this impact assessment. This action requires password confirmation.
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
