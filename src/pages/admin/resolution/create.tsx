import React, { useRef, useState } from 'react';
import { Download, FileText, Image } from 'lucide-react';
import AppLayout from '@/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import InputError from '@/components/input-error';

export default function ResolutionCreate() {
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [data, setData] = useState({
        resolution_number: '',
        effectivity: '',
        expiration: '',
        partner_agency: '',
        contact_person: '',
        contact_number_email: '',
        attachments: [] as File[],
        attachment_link: '',
    });

    const addFiles = (newFiles: FileList | null) => {
        if (!newFiles) return;

        const fileArray = Array.from(newFiles);
        const validFiles = fileArray.filter(file => {
            // Check file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!validTypes.includes(file.type)) {
                toast.error(`File ${file.name} is not a valid file type`);
                return false;
            }

            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`File ${file.name} is too large. Maximum size is 10MB`);
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
                        // Add files separately
                        data.attachments.forEach((file) => {
                            formData.append('attachments[]', file);
                        });
                    } else if (value !== null && value !== undefined) {
                        formData.append(key, String(value));
                    }
                });

                await api.post('/resolutions', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/resolutions', data);
            }

            toast.success('Resolution created successfully');
            navigate('/admin/resolution');
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
        { title: 'Resolution', href: '/admin/resolution' },
        { title: 'Add New Resolution', href: '/admin/resolution/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                <form onSubmit={handleSubmit} className='space-y-6'>
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">Create New Resolution</h1>
                                <p className="text-gray-600">
                                    Add a new resolution
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-4">
                            <Button
                                type="submit"
                                disabled={processing}
                            >
                                {processing ? 'Creating...' : 'Create Resolution'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Resolution Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="resolution_number">
                                                Resolution Number <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="resolution_number"
                                                value={data.resolution_number}
                                                onChange={handleChange}
                                                placeholder="Enter resolution number"
                                                className={errors.resolution_number ? 'border-red-500' : ''}
                                            />
                                            <InputError message={errors.resolution_number} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="partner_agency" className="flex items-center gap-2">
                                                Partner Agency <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="partner_agency"
                                                value={data.partner_agency}
                                                onChange={handleChange}
                                                placeholder="Enter partner agency"
                                                className={errors.partner_agency ? 'border-red-500' : ''}
                                            />
                                            <InputError message={errors.partner_agency} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="contact_person">
                                                Contact Person <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="contact_person"
                                                value={data.contact_person}
                                                onChange={handleChange}
                                                placeholder="Enter full name"
                                                className={errors.contact_person ? 'border-red-500' : ''}
                                            />
                                            <InputError message={errors.contact_person} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="contact_number_email" className="flex items-center gap-2">
                                                Contact Number/Email <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="contact_number_email"
                                                value={data.contact_number_email}
                                                onChange={handleChange}
                                                placeholder="Enter email or phone number"
                                                className={errors.contact_number_email ? 'border-red-500' : ''}
                                            />
                                            <InputError message={errors.contact_number_email} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="effectivity" className="flex items-center gap-2">
                                                Effectivity <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="effectivity"
                                                type="date"
                                                value={data.effectivity}
                                                onChange={handleChange}
                                                className={errors.effectivity ? 'border-red-500' : ''}
                                            />
                                            <InputError message={errors.effectivity} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="expiration" className="flex items-center gap-2">
                                                Expiration <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="expiration"
                                                type="date"
                                                value={data.expiration}
                                                onChange={handleChange}
                                                className={errors.expiration ? 'border-red-500' : ''}
                                            />
                                            <InputError message={errors.expiration} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Side */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Download className="h-5 w-5" />
                                        Attachments
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {/* New File Upload */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="attachments">Upload New Files</Label>
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
                                                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                                multiple={true}
                                                onChange={(e) => addFiles(e.target.files)}
                                                disabled={processing}
                                                className="file:mr-4 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Supported formats: JPG, PNG, PDF, DOC, DOCX (Max 10MB each)
                                        </p>
                                        <InputError message={errors.attachments} />
                                    </div>

                                    {/* File List */}
                                    {data.attachments.length > 0 && (
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium">Selected Files ({data.attachments.length})</Label>
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

                                    {/* External Link */}
                                    <div>
                                        <Label className="text-sm font-light" htmlFor='attachment_link'>External Link</Label>
                                        <Input
                                            id='attachment_link'
                                            type='url'
                                            value={data.attachment_link}
                                            className="mt-1"
                                            onChange={(e) => setData(prev => ({ ...prev, attachment_link: e.target.value }))}
                                            placeholder="https://example.com/document"
                                        />
                                        <InputError message={errors.attachment_link} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>


                </form>
            </div >
        </AppLayout >
    );
}
