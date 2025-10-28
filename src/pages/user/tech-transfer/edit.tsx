import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layout/app-layout';
import api from '@/lib/axios';
import { asset } from '@/lib/utils';
import type { TechnologyTransfer } from '@/types';
import { CalendarDays, Download, Eye, FileText, Image, Mail, MapPin, Phone, Target, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function UserTechnTransferEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [techTransfer, setTechTransfer] = useState<TechnologyTransfer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [data, setData] = useState({
        name: '',
        description: '',
        category: 'private',
        purpose: '',
        start_date: '',
        end_date: '',
        tags: '',
        leader: '',
        deliverables: '',
        agency_partner: '',
        contact_person: '',
        contact_email: '',
        contact_phone: '',
        contact_address: '',
        copyright: 'no',
        ip_details: '',
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
        const fetchProject = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`tech-transfers/${id}`);
                const project = response.data.data;
                setTechTransfer(project);

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
                    name: project.name || '',
                    description: project.description || '',
                    category: project.category || 'private',
                    purpose: project.purpose || '',
                    start_date: formatDate(project.start_date),
                    end_date: formatDate(project.end_date),
                    tags: project.tags || '',
                    leader: project.leader || '',
                    deliverables: project.deliverables || '',
                    agency_partner: project.agency_partner || '',
                    contact_person: project.contact_person || '',
                    contact_email: project.contact_email || '',
                    contact_phone: project.contact_phone || '',
                    contact_address: project.contact_address || '',
                    copyright: project.copyright || 'no',
                    ip_details: project.ip_details || '',
                    attachments: [],
                    attachment_link: project.attachment_link || '',
                });
            } catch (error) {
                console.error('Failed to fetch project', error);
            } finally {
                setIsLoading(false);
            }
        }

        if (id) {
            fetchProject();
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
                        formData.append(key, String(value));
                    }
                });

                // Laravel PUT workaround: use POST with _method
                formData.append('_method', 'PUT');

                await api.post(`/tech-transfers/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Regular JSON payload (no files)
                const { attachments, ...restData } = data;
                const payload = {
                    ...restData,
                };

                await api.put(`/tech-transfers/${id}`, payload);
            }

            toast.success('Project updated successfully!');
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
            title: 'Technology Transfer',
            href: '/user/technology-transfer',
        },
        {
            title: isLoading ? 'Loading...' : techTransfer ? techTransfer.name : 'Project Not Found',
            href: `/user/technology-transfer/${id}`,
        },
        {
            title: 'Edit Project',
            href: `/user/technology-transfer/${id}/edit`,
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
                    <form onSubmit={handleSubmit}>
                        <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                            <div className="flex items-center justify-between">
                                <h1 className='text-2xl font-bold'>Edit Project</h1>
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
                                                    <Input value={techTransfer.id} readOnly className="mt-1" />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-light">Project Name</Label>
                                                    <Input id="name" value={data.name} onChange={handleChange} />
                                                    <InputError message={errors.name} />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-light">Category</Label>
                                                    <Input id="category" value={data.category} onChange={handleChange} />
                                                    <InputError message={errors.category} />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-light">Leader</Label>
                                                    <Input id="leader" value={data.leader} onChange={handleChange} />
                                                    <InputError message={errors.leader} />
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-light">Description</Label>
                                                <Textarea id="description" className="mt-1" rows={4} value={data.description} onChange={handleChange} />
                                                <InputError message={errors.description} />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-light">Purpose</Label>
                                                <Textarea id="purpose" className="mt-1" rows={4} value={data.purpose} onChange={handleChange} />
                                                <InputError message={errors.purpose} />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-light">Deliverables</Label>
                                                <Textarea id="deliverables" className="mt-1" rows={4} value={data.deliverables} onChange={handleChange} />
                                                <InputError message={errors.deliverables} />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-light">Tags</Label>
                                                <Input className="mt-1" id="tags" value={data.tags} onChange={handleChange} />
                                                <InputError message={errors.tags} />
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
                                                    <Input className="mt-1" id="agency_partner" value={data.agency_partner} onChange={handleChange} />
                                                    <InputError message={errors.agency_partner} />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-light">Contact Person</Label>
                                                    <Input className="mt-1" id="contact_person" value={data.contact_person} onChange={handleChange} />
                                                    <InputError message={errors.contact_person?.message} />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-light flex items-center gap-1">
                                                        <Mail className="h-4 w-4" />
                                                        Email
                                                    </Label>
                                                    <Input className="mt-1" id="contact_email" value={data.contact_email} onChange={handleChange} />
                                                    <InputError message={errors.contact_email} />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-light flex items-center gap-1">
                                                        <Phone className="h-4 w-4" />
                                                        Phone
                                                    </Label>
                                                    <Input className="mt-1" id="contact_phone" value={data.contact_phone} onChange={handleChange} />
                                                    <InputError message={errors.contact_phone} />
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-light flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    Address
                                                </Label>
                                                <Input className="mt-1" id="contact_address" value={data.contact_address} onChange={handleChange} />
                                                <InputError message={errors.contact_address} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Sidebar */}
                                <div className="space-y-6">
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
                                                    <Input id="start_date" type="date" className="mt-1" value={data.start_date} onChange={handleChange} />
                                                    <InputError message={errors.start_date} />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-light">End Date</Label>
                                                    <Input id="end_date" type="date" className="mt-1" value={data.end_date} onChange={handleChange} />
                                                    <InputError message={errors.end_date} />
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
                                                    <Select value={data.copyright} onValueChange={(value) => setData(prev => ({ ...prev, copyright: value }))}>
                                                        <SelectTrigger className="mt-1 w-full">
                                                            <SelectValue placeholder="Select copyright status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="yes">Yes</SelectItem>
                                                            <SelectItem value="no">No</SelectItem>
                                                            <SelectItem value="pending">Pending</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-light">IP Details</Label>
                                                <Textarea id="ip_details" className="mt-1" rows={4} value={data.ip_details} onChange={handleChange} />
                                                <InputError message={errors.ip_details} />
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
                                            {/* Existing Attachments */}
                                            {techTransfer.attachment_paths && techTransfer.attachment_paths.length > 0 && (
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Current Attachments ({techTransfer.attachment_paths.length})</Label>
                                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                                        {techTransfer.attachment_paths.map((path, index) => {
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
                                                <Label className="text-sm font-light" htmlFor='attachment_link'>External Link</Label>
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