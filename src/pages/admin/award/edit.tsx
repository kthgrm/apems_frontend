import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layout/app-layout';
import api from '@/lib/axios';
import { asset } from '@/lib/utils';
import type { Award } from '@/types';
import { Building, Calendar, Download, Eye, FileText, Image, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';

export default function AwardEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [award, setAward] = useState<Award | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [data, setData] = useState({
        award_name: '',
        description: '',
        date_received: '',
        event_details: '',
        location: '',
        awarding_body: '',
        people_involved: '',
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
        const fetchAward = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`awards/${id}`);
                const award = response.data.data;
                setAward(award);

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
                    award_name: award.award_name || '',
                    description: award.description || '',
                    date_received: formatDate(award.date_received),
                    event_details: award.event_details || '',
                    location: award.location || '',
                    awarding_body: award.awarding_body || '',
                    people_involved: award.people_involved || '',
                    attachments: [],
                    attachment_link: award.attachment_link || '',
                });
            } catch (error) {
                console.error('Failed to fetch award', error);
            } finally {
                setIsLoading(false);
            }
        }

        if (id) {
            fetchAward();
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

                await api.post(`/awards/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Regular JSON payload (no files)
                const { attachments, ...restData } = data;
                const payload = {
                    ...restData,
                };

                await api.put(`/awards/${id}`, payload);
            }

            toast.success('Award updated successfully!');
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
            title: 'Awards',
            href: '/admin/awards-recognition',
        },
        {
            title: isLoading ? 'Loading...' : award ? award.award_name : 'Not Found',
            href: `/admin/awards-recognition/${id}`,
        },
        {
            title: 'Edit',
            href: `/admin/awards-recognition/${id}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                    Loading partner details...
                </div>
            ) : (
                award ? (
                    <form onSubmit={handleSubmit}>
                        <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                            <div className="flex items-center justify-between">
                                <h1 className='text-2xl font-bold'>Edit Award</h1>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        disabled={processing}
                                        type='submit'
                                    >
                                        {processing ? 'Updating...' : 'Update award'}
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
                                {/* Main Award Information */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Award Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Users className="h-5 w-5" />
                                                Award Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-sm font-light">Award ID</Label>
                                                    <Input value={award.id} readOnly className="mt-1 bg-muted" />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-light" htmlFor="award_name">Award Name *</Label>
                                                    <Input
                                                        id="award_name"
                                                        value={data.award_name}
                                                        onChange={handleChange}
                                                        className="mt-1"
                                                        placeholder="Enter award name"
                                                    />
                                                    <InputError message={errors.award_name} className="mt-1" />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-light" htmlFor="date_received">Date Received *</Label>
                                                    <Input
                                                        id="date_received"
                                                        type="date"
                                                        value={data.date_received}
                                                        onChange={handleChange}
                                                        className="mt-1"
                                                    />
                                                    <InputError message={errors.date_received} className="mt-1" />
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-light" htmlFor="description">Description *</Label>
                                                <Textarea
                                                    id="description"
                                                    value={data.description}
                                                    onChange={handleChange}
                                                    className="mt-1"
                                                    placeholder="Provide a detailed description of the award"
                                                />
                                                <InputError message={errors.description} className="mt-1" />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Event Details */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Calendar className="h-5 w-5" />
                                                Event Details
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-sm font-light" htmlFor="awarding_body">Awarding Body *</Label>
                                                    <Input
                                                        id="awarding_body"
                                                        value={data.awarding_body}
                                                        onChange={handleChange}
                                                        className="mt-1"
                                                        placeholder="Enter awarding body/organization"
                                                    />
                                                    <InputError message={errors.awarding_body} className="mt-1" />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-light" htmlFor="location">Location *</Label>
                                                    <Input
                                                        id="location"
                                                        value={data.location}
                                                        onChange={handleChange}
                                                        className="mt-1"
                                                        placeholder="Enter event location"
                                                    />
                                                    <InputError message={errors.location} className="mt-1" />
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-light" htmlFor="event_details">Event Details *</Label>
                                                <Textarea
                                                    id="event_details"
                                                    value={data.event_details}
                                                    onChange={handleChange}
                                                    className="mt-1"
                                                    placeholder="Provide details about the event where the award was received"
                                                />
                                                <InputError message={errors.event_details} className="mt-1" />
                                            </div>
                                            <div>
                                                <Label className="text-sm font-light" htmlFor="people_involved">People Involved *</Label>
                                                <Input
                                                    id="people_involved"
                                                    value={data.people_involved}
                                                    onChange={handleChange}
                                                    className="mt-1"
                                                    placeholder="Enter names of people involved (e.g., John Doe, Jane Smith)"
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Separate multiple names with commas
                                                </p>
                                                <InputError message={errors.people_involved} className="mt-1" />
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
                                                    {award?.college.campus.logo && (
                                                        <Avatar className="size-8">
                                                            <AvatarImage src={asset(award.college.campus.logo)} alt="Campus logo" />
                                                            <AvatarFallback><Building className="p-0.5" /></AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    <span className="text-sm font-medium">{award?.college.campus.name}</span>
                                                </div>
                                            </div>
                                            <Separator />
                                            <div>
                                                <Label className="text-sm font-medium">College</Label>
                                                <div className="mt-1 flex items-center gap-2">
                                                    {award?.college.logo && (
                                                        <Avatar className="size-8">
                                                            <AvatarImage src={asset(award.college.logo)} alt="College logo" />
                                                            <AvatarFallback><Building className="p-0.5" /></AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">{award?.college.name}</span>
                                                        <span className="text-xs text-muted-foreground">{award?.college.code}</span>
                                                    </div>
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
                                            {/* Existing Attachments */}
                                            {award.attachment_paths && award.attachment_paths.length > 0 && (
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Current Attachments ({award.attachment_paths.length})</Label>
                                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                                        {award.attachment_paths.map((path, index) => {
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
                                                        <span>{new Date(award.created_at).toLocaleDateString()}</span>
                                                        <span className='text-xs text-stone-500'>{new Date(award.created_at).toLocaleTimeString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Last Updated</span>
                                                    <div className='flex flex-col items-end'>
                                                        <span>{new Date(award.updated_at).toLocaleDateString()}</span>
                                                        <span className='text-xs text-stone-500'>{new Date(award.updated_at).toLocaleTimeString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Created By</span>
                                                    <span>{award?.user.first_name + ' ' + award?.user.last_name}</span>
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
                        Award not found.
                    </div>
                )
            )}
        </AppLayout>
    )
}