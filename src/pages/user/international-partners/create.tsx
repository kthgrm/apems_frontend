import React, { useRef, useState } from 'react';
import {
    Clock,
    FileText, Globe, Image, LoaderCircle,
    Users
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

export default function UserInternationalPartnersCreate() {
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState('partner-details');
    const [errors, setErrors] = useState<any>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            const endpoint = '/international-partners';

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

            toast.success('International partnership created successfully!');
            navigate('/user/international-partner');
        } catch (err: any) {
            toast.error('Check the form for errors.');
            console.error('Submission error:', err.response?.data || err);
            setErrors(err.response?.data?.errors || {});
        } finally {
            setProcessing(false);
        }
    };

    const breadcrumbs = [
        { title: 'International Partners', href: '/user/international-partner' },
        { title: 'Add New Partnership', href: '/user/international-partner/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-medium">Create New Partnership</h1>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="partner-details">Partner Details</TabsTrigger>
                            <TabsTrigger value="timeline">Timeline</TabsTrigger>
                            <TabsTrigger value="participation">Participation Metrics</TabsTrigger>
                            <TabsTrigger value="attachments">Attachments</TabsTrigger>
                        </TabsList>

                        {/* Partner Details */}
                        <TabsContent value="partner-details">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Globe className="h-5 w-5" /> Partner Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 md:grid-cols-2">
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="agency_partner">Agency Partner</Label>
                                        <Input
                                            id="agency_partner"
                                            value={data.agency_partner}
                                            onChange={handleChange}
                                            placeholder="Enter agency partner name"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.agency_partner} />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input
                                            id="location"
                                            value={data.location}
                                            onChange={handleChange}
                                            placeholder="Enter location"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.location} />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="activity_conducted">Activity Conducted</Label>
                                        <Input
                                            id="activity_conducted"
                                            value={data.activity_conducted}
                                            onChange={handleChange}
                                            placeholder="Enter activity conducted (e.g., Workshop, Seminar, Training)"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.activity_conducted} />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="narrative">Narrative</Label>
                                        <Textarea
                                            id="narrative"
                                            value={data.narrative}
                                            onChange={handleChange}
                                            rows={4}
                                            placeholder="Enter narrative or additional details"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.narrative} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Timeline */}
                        <TabsContent value="timeline">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" /> Timeline
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="start_date">Start Date</Label>
                                        <Input
                                            id="start_date"
                                            type="date"
                                            value={data.start_date}
                                            onChange={handleChange}
                                            disabled={processing}
                                        />
                                        <InputError message={errors.start_date} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="end_date">End Date</Label>
                                        <Input
                                            id="end_date"
                                            type="date"
                                            value={data.end_date}
                                            onChange={handleChange}
                                            disabled={processing}
                                        />
                                        <InputError message={errors.end_date} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Participation */}
                        <TabsContent value="participation">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" /> Activity Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="number_of_participants">Number of Participants</Label>
                                        <Input
                                            id="number_of_participants"
                                            type="number"
                                            value={data.number_of_participants}
                                            onChange={handleChange}
                                            placeholder="Enter number of participants"
                                            disabled={processing}
                                            min="0"
                                        />
                                        <InputError message={errors.number_of_participants} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="number_of_committee">Number of Committee</Label>
                                        <Input
                                            id="number_of_committee"
                                            type="number"
                                            value={data.number_of_committee}
                                            onChange={handleChange}
                                            placeholder="Enter number of committee members"
                                            disabled={processing}
                                            min="0"
                                        />
                                        <InputError message={errors.number_of_committee} />
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
