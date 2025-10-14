import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layout/app-layout';
import api from '@/lib/axios';
import { asset } from '@/lib/utils';
import type { Resolution } from '@/types';
import { Download, Eye, FileText, Image } from 'lucide-react';
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import InputError from '@/components/input-error';

export default function ResolutionEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [resolution, setResolution] = useState<Resolution | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [data, setData] = useState({
        resolution_number: '',
        effectivity: '',
        expiration: '',
        contact_person: '',
        contact_number_email: '',
        partner_agency: '',
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

    useEffect(() => {
        const fetchResolution = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`/resolutions/${id}`);
                const reso = response.data.data;
                setResolution(reso);

                // Format dates for HTML date inputs (yyyy-MM-dd)
                const formatDate = (dateStr?: string) => {
                    if (!dateStr) return '';
                    const date = new Date(dateStr);
                    if (isNaN(date.getTime())) return '';
                    const yyyy = date.getFullYear();
                    const mm = String(date.getMonth() + 1).padStart(2, '0');
                    const dd = String(date.getDate()).padStart(2, '0');
                    return `${yyyy}-${mm}-${dd}`;
                };

                // Populate form with fetched data
                setData({
                    resolution_number: reso.resolution_number || '',
                    effectivity: formatDate(reso.effectivity) || '',
                    expiration: formatDate(reso.expiration) || '',
                    partner_agency: reso.partner_agency || '',
                    contact_person: reso.contact_person || '',
                    contact_number_email: reso.contact_number_email || '',
                    attachments: [],
                    attachment_link: reso.attachment_link || '',
                });
            } catch (error) {
                console.error('Failed to fetch resolution', error);
            } finally {
                setIsLoading(false);
            }
        }

        if (id) {
            fetchResolution();
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            // Check if files need to be uploaded
            const hasFiles = data.attachments && data.attachments.length > 0;

            if (hasFiles) {
                // Use FormData for file uploads
                const formData = new FormData();

                // Add all form fields
                Object.entries(data).forEach(([key, value]) => {
                    if (key === 'attachments') {
                        // Add files separately
                        data.attachments.forEach((file) => {
                            formData.append('attachments[]', file);
                        });
                    } else if (value !== null && value !== undefined) {
                        // Handle boolean values properly for Laravel
                        if (key === 'is_assessment_based') {
                            formData.append(key, value ? '1' : '0');
                        } else {
                            formData.append(key, String(value));
                        }
                    }
                });

                // Laravel PUT workaround: use POST with _method
                formData.append('_method', 'PUT');

                await api.post(`/resolutions/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Regular JSON payload (no files)
                const { attachments, ...restData } = data;
                const payload = {
                    ...restData,
                };

                await api.put(`/resolutions/${id}`, payload);
            }

            toast.success('Resolution updated successfully!');
            navigate(-1);
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
            title: 'Resolution',
            href: '/admin/resolution',
        },
        {
            title: isLoading ? 'Loading...' : resolution ? resolution.resolution_number : 'Not Found',
            href: `/admin/resolution/${id}`,
        },
        {
            title: 'Edit Resolution',
            href: `/admin/resolution/${id}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                    Loading resolution details...
                </div>
            ) : (
                resolution ? (
                    <form onSubmit={handleSubmit}>
                        <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                            <div className="flex items-center justify-between">
                                <h1 className='text-2xl font-bold'>Edit Resolution</h1>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        disabled={processing}
                                        type='submit'
                                    >
                                        {processing ? 'Updating...' : 'Update Project'}
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
                                {/* Main Project Information */}
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
                                            {/* Existing Attachments */}
                                            {resolution?.attachment_paths && resolution.attachment_paths.length > 0 && (
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Current Attachments ({resolution.attachment_paths.length})</Label>
                                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                                        {resolution.attachment_paths.map((path, index) => {
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

                                            {/* External Link */}
                                            <div>
                                                <Label className="text-sm" htmlFor='attachment_link'>External Link</Label>
                                                <Input
                                                    id='attachment_link'
                                                    type='url'
                                                    value={data.attachment_link}
                                                    className="mt-1"
                                                    onChange={(e) => setData(prev => ({ ...prev, attachment_link: e.target.value }))}
                                                />
                                                <InputError message={errors.attachment_link} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        Project not found.
                    </div>
                )
            )}
        </AppLayout>
    )
}