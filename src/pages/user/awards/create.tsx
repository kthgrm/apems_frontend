import React, { useRef, useState } from 'react';
import {
    Calendar,
    FileText, Trophy, Image, LoaderCircle
} from 'lucide-react';
import AppLayout from '@/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import InputError from '@/components/input-error';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default function UserAwardsCreate() {
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState('award-details');
    const [errors, setErrors] = useState<any>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        const validTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];

        const validFiles = fileArray.filter((file) => {
            if (!validTypes.includes(file.type)) {
                toast.error(`Invalid file type: ${file.name}`);
                return false;
            }
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`${file.name} exceeds 10MB limit`);
                return false;
            }
            return true;
        });

        setData((prev) => ({ ...prev, attachments: validFiles }));
    };

    const clearAllFiles = () => {
        setData((prev) => ({ ...prev, attachments: [] }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const hasFiles = data.attachments.length > 0;
            const endpoint = '/awards';

            if (hasFiles) {
                const formData = new FormData();
                Object.entries(data).forEach(([key, value]) => {
                    if (key === 'attachments') {
                        data.attachments.forEach((file) =>
                            formData.append('attachments[]', file)
                        );
                    } else {
                        formData.append(key, String(value));
                    }
                });

                await api.post(endpoint, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await api.post(endpoint, data);
            }

            toast.success('Award created successfully!');
            navigate('/user/awards-recognition');
        } catch (err: any) {
            toast.error('Check the form for errors.');
            console.error('Submission error:', err.response?.data || err);
            setErrors(err.response?.data?.errors || {});
        } finally {
            setProcessing(false);
        }
    };

    const breadcrumbs = [
        { title: 'Awards & Recognitions', href: '/user/awards-recognition' },
        { title: 'Add New Award', href: '/user/awards-recognition/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-medium">Create New Award</h1>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <ScrollArea className="py-2">
                            <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="award-details">Award Details</TabsTrigger>
                                <TabsTrigger value="event-info">Event Details</TabsTrigger>
                                <TabsTrigger value="attachments">Attachments</TabsTrigger>
                            </TabsList>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>

                        {/* Award Details */}
                        <TabsContent value="award-details">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Trophy className="h-5 w-5" /> Award Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="award_name">Award Name</Label>
                                        <Input
                                            id="award_name"
                                            value={data.award_name}
                                            onChange={handleChange}
                                            placeholder="Enter award name"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.award_name} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="date_received">Date Received</Label>
                                        <Input
                                            id="date_received"
                                            type="date"
                                            value={data.date_received}
                                            onChange={handleChange}
                                            disabled={processing}
                                        />
                                        <InputError message={errors.date_received} />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="Brief description"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.description} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Event Information */}
                        <TabsContent value="event-info">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" /> Event Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="awarding_body">Awarding Body</Label>
                                        <Input
                                            id="awarding_body"
                                            value={data.awarding_body}
                                            onChange={handleChange}
                                            placeholder="Enter awarding body"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.awarding_body} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            value={data.location}
                                            onChange={handleChange}
                                            placeholder="Enter event location"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.location} />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="event_details">Event Details</Label>
                                        <Textarea
                                            id="event_details"
                                            value={data.event_details}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="Enter event details"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.event_details} />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="people_involved">People Involved</Label>
                                        <Textarea
                                            id="people_involved"
                                            value={data.people_involved}
                                            onChange={handleChange}
                                            placeholder="Enter people involved"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.people_involved} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Attachments */}
                        <TabsContent value="attachments">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" /> Attachments
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="attachments">Upload New Files</Label>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    ref={fileInputRef}
                                                    id="attachments"
                                                    type="file"
                                                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                                    multiple={true}
                                                    onChange={(e) => addFiles(e.target.files)}
                                                    disabled={processing}
                                                    className="file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                                />
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Supported formats: JPG, PNG, PDF, DOC, DOCX (Max 10MB each)
                                            </p>
                                            <InputError message={errors.attachments} />
                                        </div>

                                        <div className='space-y-2'>
                                            <Label htmlFor='attachment_link'>External Link</Label>
                                            <Input
                                                id='attachment_link'
                                                type='url'
                                                value={data.attachment_link}
                                                onChange={(e) => setData(prev => ({ ...prev, attachment_link: e.target.value }))}
                                                placeholder="https://example.com/document"
                                            />
                                            <InputError message={errors.attachment_link} />
                                        </div>

                                        {/* File List */}
                                        {data.attachments.length > 0 && (
                                            <div className="space-y-2 md:col-span-2">
                                                <div className='flex items-center justify-between'>
                                                    <Label className="text-sm font-medium">Selected Files ({data.attachments.length})</Label>
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
                                                </div>
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
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Form
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
