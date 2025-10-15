import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layout/app-layout';
import api from '@/lib/axios';
import type { InternationalPartner } from '@/types';
import { Calendar, Download, Eye, FileText, Image, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { asset } from '@/lib/utils';

export default function UserInternationalPartnersEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [partner, setPartner] = useState<InternationalPartner | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [data, setData] = useState({
        agency_partner: '',
        location: '',
        activity_conducted: '',
        start_date: '',
        end_date: '',
        number_of_participants: '',
        number_of_committee: '',
        narrative: '',
        attachments: [] as File[],
        attachment_link: '',
    });

    useEffect(() => {
        const fetchPartner = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`/international-partners/${id}`);
                const partnerData = response.data.data;
                setPartner(partnerData);

                const formatDate = (dateStr?: string) => {
                    if (!dateStr) return '';
                    const date = new Date(dateStr);
                    if (isNaN(date.getTime())) return '';
                    return date.toISOString().split('T')[0];
                };

                setData({
                    agency_partner: partnerData.agency_partner || '',
                    location: partnerData.location || '',
                    activity_conducted: partnerData.activity_conducted || '',
                    start_date: formatDate(partnerData.start_date),
                    end_date: formatDate(partnerData.end_date),
                    number_of_participants: partnerData.number_of_participants?.toString() || '',
                    number_of_committee: partnerData.number_of_committee?.toString() || '',
                    narrative: partnerData.narrative || '',
                    attachments: [],
                    attachment_link: partnerData.attachment_link || '',
                });
            } catch (error) {
                console.error('Failed to fetch partnership', error);
            } finally {
                setIsLoading(false);
            }
        }

        if (id) {
            fetchPartner();
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

                await api.post(`/international-partners/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                const { attachments, ...restData } = data;
                await api.put(`/international-partners/${id}`, restData);
            }

            toast.success('Partnership updated successfully!');
            navigate(`/user/international-partner/${id}`);
        } catch (err: any) {
            console.error('Submission error:', err.response?.data || err);
            setErrors(err.response?.data?.errors || {});
            toast.error('Check the form for errors.');
        } finally {
            setProcessing(false);
        }
    };

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setData(prev => ({ ...prev, [id]: value }));
    };

    const breadcrumbs = [
        { title: 'International Partners', href: '/user/international-partner' },
        { title: isLoading ? 'Loading...' : partner ? partner.agency_partner : 'Partnership Not Found', href: `/user/international-partner/${id}` },
        { title: 'Edit Partnership', href: `/user/international-partner/${id}/edit` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                    Loading partnership details...
                </div>
            ) : (
                partner ? (
                    <form onSubmit={handleSubmit}>
                        <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                            <div className="flex items-center justify-between">
                                <h1 className='text-2xl font-bold'>Edit Partnership</h1>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        disabled={processing}
                                        type='submit'
                                    >
                                        {processing ? 'Updating...' : 'Update Partnership'}
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
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Partner Details */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                Basic Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-sm font-light">Partner ID</Label>
                                                    <Input value={partner.id} readOnly className="mt-1 bg-muted" />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-light">Agency Partner</Label>
                                                    <Input
                                                        id="agency_partner"
                                                        value={data.agency_partner}
                                                        className="mt-1"
                                                        onChange={handleChange}
                                                        disabled={processing}
                                                    />
                                                    <InputError message={errors.agency_partner} />
                                                </div>
                                                <div className="col-span-1 md:col-span-2">
                                                    <Label className="text-sm font-light">Location</Label>
                                                    <Input
                                                        id="location"
                                                        value={data.location}
                                                        className="mt-1"
                                                        onChange={handleChange}
                                                        disabled={processing}
                                                    />
                                                    <InputError message={errors.location} />
                                                </div>
                                                <div className='md:col-span-2'>
                                                    <Label className="text-sm font-light">Activity Type</Label>
                                                    <Input
                                                        id="activity_conducted"
                                                        value={data.activity_conducted}
                                                        className="mt-1"
                                                        onChange={handleChange}
                                                        disabled={processing}
                                                    />
                                                    <InputError message={errors.activity_conducted} />
                                                </div>
                                                <div className="col-span-1 md:col-span-2">
                                                    <Label className="text-sm font-light">Narrative</Label>
                                                    <Textarea
                                                        id="narrative"
                                                        value={data.narrative}
                                                        className="mt-1"
                                                        onChange={handleChange}
                                                        disabled={processing}
                                                    />
                                                    <InputError message={errors.narrative} />
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
                                                        id="number_of_participants"
                                                        value={data.number_of_participants}
                                                        type="number"
                                                        className="mt-1"
                                                        onChange={handleChange}
                                                        disabled={processing}
                                                    />
                                                    <InputError message={errors.number_of_participants} />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-light">Committee Members</Label>
                                                    <Input
                                                        id="number_of_committee"
                                                        value={data.number_of_committee}
                                                        type="number"
                                                        className="mt-1"
                                                        onChange={handleChange}
                                                        disabled={processing}
                                                    />
                                                    <InputError message={errors.number_of_committee} />
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
                                                        id="start_date"
                                                        value={data.start_date}
                                                        type='date'
                                                        className="mt-1"
                                                        onChange={handleChange}
                                                        disabled={processing}
                                                    />
                                                    <InputError message={errors.start_date} />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-light">End Date</Label>
                                                    <Input
                                                        id="end_date"
                                                        value={data.end_date}
                                                        type='date'
                                                        className="mt-1"
                                                        onChange={handleChange}
                                                        disabled={processing}
                                                    />
                                                    <InputError message={errors.end_date} />
                                                </div>
                                                <div className="col-span-1 md:col-span-2">
                                                    <Label className="text-sm font-light">Duration</Label>
                                                    <Input
                                                        value={
                                                            data.start_date && data.end_date
                                                                ? (() => {
                                                                    const start = new Date(data.start_date);
                                                                    const end = new Date(data.end_date);
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
                                            {/* Existing Attachments */}
                                            {partner.attachment_paths && partner.attachment_paths.length > 0 && (
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Current Attachments ({partner.attachment_paths.length})</Label>
                                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                                        {partner.attachment_paths.map((path, index) => {
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
                        Partnership not found.
                    </div>
                )
            )}
        </AppLayout>
    );
}
