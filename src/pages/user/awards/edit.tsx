import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layout/app-layout';
import api from '@/lib/axios';
import type { Award } from '@/types';
import { Download, Eye, FileText, Image, LoaderCircle, Target, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { asset } from '@/lib/utils';

export default function UserAwardsEdit() {
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

    useEffect(() => {
        const fetchAward = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`/awards/${id}`);
                const awardData = response.data.data;
                setAward(awardData);

                const formatDate = (dateStr?: string) => {
                    if (!dateStr) return '';
                    const date = new Date(dateStr);
                    if (isNaN(date.getTime())) return '';
                    return date.toISOString().split('T')[0];
                };

                setData({
                    award_name: awardData.award_name || '',
                    description: awardData.description || '',
                    date_received: formatDate(awardData.date_received),
                    event_details: awardData.event_details || '',
                    location: awardData.location || '',
                    awarding_body: awardData.awarding_body || '',
                    people_involved: awardData.people_involved || '',
                    attachments: [],
                    attachment_link: awardData.attachment_link || '',
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

                await api.post(`/awards/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                const { attachments, ...restData } = data;
                await api.put(`/awards/${id}`, restData);
            }

            toast.success('Award updated successfully!');
            navigate(`/user/awards-recognition/${id}`);
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
        { title: 'Awards & Recognitions', href: '/user/awards' },
        { title: isLoading ? 'Loading...' : award ? award.award_name : 'Award Not Found', href: `/user/awards/${id}` },
        { title: 'Edit Award', href: `/user/awards/${id}/edit` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                    Loading award details...
                </div>
            ) : (
                award ? (
                    <form onSubmit={handleSubmit}>
                        <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <h1 className="text-2xl font-medium">Edit Award</h1>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="submit"
                                        variant="default"
                                        disabled={processing}
                                    >
                                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                        Save Changes
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
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <Label className="text-sm font-light">Award ID</Label>
                                                    <Input value={award.id} readOnly className="mt-1 bg-muted" />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-light">Award Name</Label>
                                                    <Input
                                                        id="award_name"
                                                        value={data.award_name}
                                                        className="mt-1"
                                                        onChange={handleChange}
                                                    />
                                                    <InputError message={errors.award_name} className="mt-1" />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-light">Date Received</Label>
                                                    <Input
                                                        id="date_received"
                                                        value={data.date_received}
                                                        type="date"
                                                        className="mt-1"
                                                        onChange={handleChange}
                                                    />
                                                    <InputError message={errors.date_received} className="mt-1" />
                                                </div>
                                                <div className='col-span-3'>
                                                    <Label className="text-sm font-light">Description</Label>
                                                    <Textarea
                                                        id="description"
                                                        value={data.description}
                                                        className="mt-1"
                                                        onChange={handleChange}
                                                    />
                                                    <InputError message={errors.description} className="mt-1" />

                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Event Details */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Users className="h-5 w-5" />
                                                Event Details
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 gap-4">
                                                <div>
                                                    <Label className="text-sm font-light">Awarding Body</Label>
                                                    <Input
                                                        id="awarding_body"
                                                        value={data.awarding_body}
                                                        className="mt-1"
                                                        onChange={handleChange}
                                                    />
                                                    <InputError message={errors.awarding_body} className="mt-1" />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-light">Location</Label>
                                                    <Input
                                                        id="location"
                                                        value={data.location}
                                                        className="mt-1"
                                                        onChange={handleChange}
                                                    />
                                                    <InputError message={errors.location} className="mt-1" />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-light">Event Details</Label>
                                                    <Textarea
                                                        id="event_details"
                                                        value={data.event_details}
                                                        className="mt-1"
                                                        onChange={handleChange}
                                                    />
                                                    <InputError message={errors.event_details} className="mt-1" />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-light">People Involved</Label>
                                                    <Input
                                                        id="people_involved"
                                                        value={data.people_involved}
                                                        className="mt-1"
                                                        onChange={handleChange}
                                                    />
                                                    <InputError message={errors.people_involved} className="mt-1" />
                                                    {data.people_involved ? (
                                                        <div className="space-x-2">
                                                            {data.people_involved.split(', ').map((person, index) => (
                                                                <Badge key={index} className="mt-2" variant="outline">
                                                                    {person}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Sidebar */}
                                <div className="space-y-6">
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
    );
}
