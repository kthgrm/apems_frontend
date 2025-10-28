import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layout/app-layout';
import api from '@/lib/axios';
import { asset } from '@/lib/utils';
import type { ImpactAssessment } from '@/types';
import { Building, Eye, FileText, Image, Target } from 'lucide-react';
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import InputError from '@/components/input-error';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function ImpactAssessmentEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [assessment, setAssessment] = useState<ImpactAssessment | null>(null);
    const [techTransfers, setTechTransfers] = useState<Array<{ value: number; label: string }>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [data, setData] = useState({
        tech_transfer_id: '',
        title: '',
        description: '',
        attachments: [] as File[],
    });

    const addFiles = (newFiles: FileList | null) => {
        if (!newFiles) return;

        const fileArray = Array.from(newFiles);
        const validFiles = fileArray.filter(file => {
            // Check file type
            const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!validTypes.includes(file.type)) {
                toast.error(`File ${file.name} is not a valid file type`);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return false;
            }

            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`File ${file.name} is too large. Maximum size is 10MB`);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return false;
            }

            return true;
        });

        // Replace existing files instead of appending to avoid accumulation
        setData(prev => ({ ...prev, attachments: validFiles }));
    };

    const clearAllFiles = () => {
        setData(prev => ({ ...prev, attachments: [] }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch tech transfers for dropdown
                const techTransfersRes = await api.get('tech-transfers');
                const techTransfersData = techTransfersRes.data.data.map((tt: any) => ({
                    value: tt.id,
                    label: tt.name,
                }));
                setTechTransfers(techTransfersData);

                // Fetch assessment details
                const response = await api.get(`impact-assessments/${id}`);
                const assessmentData = response.data.data;
                setAssessment(assessmentData);

                // Populate form with fetched data
                setData({
                    tech_transfer_id: assessmentData?.tech_transfer_id?.toString() || '',
                    title: assessmentData?.title || '',
                    description: assessmentData?.description || '',
                    attachments: [],
                });
            } catch (error) {
                console.error('Failed to fetch assessment data', error);
                toast.error('Failed to load assessment data');
            } finally {
                setIsLoading(false);
            }
        }

        if (id) {
            fetchData();
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const hasFiles = data.attachments && data.attachments.length > 0;

            if (hasFiles) {
                const formData = new FormData();
                Object.entries(data).forEach(([key, value]) => {
                    if (key === 'attachments') {
                        data.attachments.forEach((file) => {
                            formData.append('attachments[]', file);
                        });
                    } else if (value !== null && value !== undefined) {
                        formData.append(key, String(value));
                    }
                });
                formData.append('_method', 'PUT');

                await api.post(`/impact-assessments/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                const { attachments, ...restData } = data;
                await api.put(`/impact-assessments/${id}`, restData);
            }

            toast.success('Assessment updated successfully!');
            navigate(`/admin/impact-assessment/${id}`);
        } catch (err: any) {
            console.error('Submission error:', err.response?.data || err);

            const validationErrors = err.response?.data?.errors || {};
            setErrors(validationErrors);
        } finally {
            setProcessing(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setData(prev => ({ ...prev, [id]: value }));
    };

    const breadcrumbs = [
        {
            title: 'Impact Assessments',
            href: '/admin/impact-assessment',
        },
        {
            title: isLoading ? 'Loading...' : assessment ? assessment.tech_transfer.name : 'Not Found',
            href: `/admin/impact-assessment/${id}`,
        },
        {
            title: 'Edit',
            href: `/admin/impact-assessment/${id}/edit`,
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
                    <form onSubmit={handleSubmit}>
                        <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                            <div className="flex items-center justify-between">
                                <h1 className='text-2xl font-bold'>Edit Assessment</h1>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        disabled={processing}
                                        type='submit'
                                    >
                                        {processing ? 'Updating...' : 'Update'}
                                    </Button>
                                    <Button
                                        type="button"
                                        className="justify-start bg-red-800 hover:bg-red-900"
                                        onClick={() => navigate(-1)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Main Assessment Information */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Assessment Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Target className="h-5 w-5 text-purple-600" />
                                                Assessment Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-light">Assessment ID</Label>
                                                <Input value={assessment.id} readOnly className="mt-1 bg-muted" />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-light" htmlFor="title">Title<span className="text-red-500">*</span></Label>
                                                <Input
                                                    id="title"
                                                    value={data.title}
                                                    onChange={handleChange}
                                                    className="mt-1"
                                                    placeholder="Enter title information"
                                                />
                                                <InputError message={errors.title} className="mt-1" />
                                            </div>
                                            <div className='col-span-2'>
                                                <Label className="text-sm font-light">Description</Label>
                                                <Textarea
                                                    id='description'
                                                    value={data.description}
                                                    onChange={handleChange}
                                                    className="mt-1"
                                                />
                                                <InputError message={errors.description} />
                                            </div>
                                            <div className='col-span-2'>
                                                <Label className="text-sm font-light mb-1">Associated Project</Label>
                                                <Select
                                                    value={data.tech_transfer_id.toString()}
                                                    onValueChange={(value) => setData(prev => ({ ...prev, tech_transfer_id: value }))}
                                                >
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder="Select project" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {techTransfers.map((techTransfer) => (
                                                                <SelectItem
                                                                    key={techTransfer.value}
                                                                    value={techTransfer.value.toString()}
                                                                >
                                                                    {techTransfer.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className='col-span-2 space-y-4'>
                                                {/* Existing Attachments */}
                                                {assessment.attachment_paths && assessment.attachment_paths.length > 0 && (
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-light">Current Attachment ({assessment.attachment_paths.length})</Label>
                                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                                            {assessment.attachment_paths.map((path, index) => {
                                                                const fileName = path.split('/').pop() || `Attachment ${index + 1}`;
                                                                return (
                                                                    <div
                                                                        key={`existing-${index}`}
                                                                        className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                                                                    >
                                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                            <div className="flex-shrink-0">
                                                                                <FileText className="h-5 w-5 text-violet-500" />
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-sm font-medium truncate">{fileName}</p>
                                                                            </div>
                                                                        </div>
                                                                        <a
                                                                            href={asset(path)}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-violet-600 hover:underline text-sm flex items-center gap-1"
                                                                        >
                                                                            <Eye className="h-4 w-4" />
                                                                            View
                                                                        </a>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* New File Upload */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label htmlFor="attachments" className='font-light'>Upload New File</Label>
                                                        {data.attachments.length > 0 && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={clearAllFiles}
                                                                disabled={processing}
                                                                className="text-xs"
                                                            >
                                                                Clear
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            ref={fileInputRef}
                                                            id="attachments"
                                                            type="file"
                                                            accept=".pdf,.doc,.docx"
                                                            multiple={true}
                                                            onChange={(e) => addFiles(e.target.files)}
                                                            disabled={processing}
                                                            className="file:mr-4 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                                                        />
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        Supported formats: PDF, DOC, DOCX (Max 10MB each)
                                                    </p>
                                                    <InputError message={errors.attachments} />
                                                </div>

                                                {/* New File List */}
                                                {data.attachments.length > 0 && (
                                                    <div className="space-y-2">
                                                        <Label className="text-base font-medium">New Files to Upload ({data.attachments.length})</Label>
                                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                                            {data.attachments.map((file, index) => (
                                                                <div
                                                                    key={`new-${file.name}-${index}`}
                                                                    className="flex items-center justify-between p-3 border rounded-lg bg-violet-50"
                                                                >
                                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                        <div className="flex-shrink-0">
                                                                            {file.type.startsWith('image/') ? (
                                                                                <Image className="h-5 w-5 text-violet-500" />
                                                                            ) : (
                                                                                <FileText className="h-5 w-5 text-violet-500" />
                                                                            )}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm font-medium truncate">{file.name}</p>
                                                                            <p className="text-xs text-muted-foreground">
                                                                                {formatFileSize(file.size)}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
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
                                                        <span className="text-sm font-medium">{assessment?.tech_transfer.college.name}</span>
                                                        <span className="text-xs text-muted-foreground">{assessment?.tech_transfer.college.code}</span>
                                                    </div>
                                                </div>
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
                                                        <span>{new Date(assessment.created_at).toLocaleDateString()}</span>
                                                        <span className='text-xs text-stone-500'>{new Date(assessment.created_at).toLocaleTimeString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Last Updated</span>
                                                    <div className='flex flex-col items-end'>
                                                        <span>{new Date(assessment.updated_at).toLocaleDateString()}</span>
                                                        <span className='text-xs text-stone-500'>{new Date(assessment.updated_at).toLocaleTimeString()}</span>
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
                        </div>
                    </form>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        Assessment not found.
                    </div>
                )
            )}
        </AppLayout>
    )
}