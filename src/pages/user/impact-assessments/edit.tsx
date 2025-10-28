import React, { useEffect, useRef, useState } from 'react';
import { LoaderCircle, Target, FileText, Eye, Image, Save } from 'lucide-react';
import AppLayout from '@/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import InputError from '@/components/input-error';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ImpactAssessment } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { asset } from '@/lib/utils';

export default function UserImpactAssessmentEdit() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [assessment, setAssessment] = useState<ImpactAssessment | null>(null);
    const [techTransfers, setTechTransfers] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);


    const [processing, setProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
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
        const fetchAssessment = async () => {
            try {
                const response = await api.get(`/impact-assessments/${id}`);
                const assessment = response.data.data;
                setData({
                    tech_transfer_id: assessment.tech_transfer_id || '',
                    title: assessment.title || '',
                    description: assessment.description || '',
                    attachments: [],
                });
                setAssessment(assessment);
                const techTransfersResponse = await api.get('/user/tech-transfers');
                setTechTransfers(techTransfersResponse.data.data || []);
            } catch (err: any) {
                toast.error('Failed to load impact assessment');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAssessment();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setData((prev) => ({ ...prev, [id]: value }));
    };

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
            toast.success('Impact assessment updated successfully!');
            navigate(`/user/impact-assessment/${id}`);
        } catch (err: any) {
            toast.error('Check the form for errors.');
            console.error('Submission error:', err.response?.data || err);
            setErrors(err.response?.data?.errors || {});
        } finally {
            setProcessing(false);
        }
    };

    const breadcrumbs = [
        { title: 'Impact Assessments', href: '/user/impact-assessment' },
        { title: 'Edit', href: `/user/impact-assessment/${id}/edit` },
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
                                <div className="flex items-center gap-4">
                                    <h1 className="text-2xl font-medium">Edit Assessment</h1>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="submit"
                                        variant="default"
                                        disabled={processing}
                                        className='bg-blue-500 hover:bg-blue-600'
                                    >
                                        {processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                        Save
                                    </Button>
                                    <Button type="button" variant="secondary" onClick={() => window.history.back()}>Cancel</Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Main Engagement Information */}
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
                                                    <Label className="text-sm font-light">RREID</Label>
                                                    <Input
                                                        value={assessment.id}
                                                        readOnly
                                                        className="mt-1 bg-muted"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-light">Title</Label>
                                                    <Input
                                                        id='title'
                                                        value={data.title}
                                                        onChange={handleChange}
                                                        className="mt-1"
                                                    />
                                                    <InputError message={errors.title} />
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
                                                    <Label className="text-sm font-light">Associated Project</Label>
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
                                                                        key={techTransfer.id}
                                                                        value={techTransfer.id.toString()}
                                                                    >
                                                                        {techTransfer.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Sidebar */}
                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                Terminal Report
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {/* Existing Attachments */}
                                            {assessment.attachment_paths && assessment.attachment_paths.length > 0 && (
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Current Attachment ({assessment.attachment_paths.length})</Label>
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
                                                                            <FileText className="h-5 w-5 text-blue-500" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm font-medium truncate">{fileName}</p>
                                                                        </div>
                                                                    </div>
                                                                    <a
                                                                        href={asset(path)}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-blue-600 hover:underline text-sm flex items-center gap-1"
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
                                                    <Label htmlFor="attachments">Upload New File</Label>
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
                                                        className="file:mr-4 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
                                                                className="flex items-center justify-between p-3 border rounded-lg bg-green-50"
                                                            >
                                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                    <div className="flex-shrink-0">
                                                                        {file.type.startsWith('image/') ? (
                                                                            <Image className="h-5 w-5 text-green-500" />
                                                                        ) : (
                                                                            <FileText className="h-5 w-5 text-green-500" />
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
    );
}
