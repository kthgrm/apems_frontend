import React, { useRef, useState } from 'react';
import {
    Calendar,
    FileText, Folder, Image, LoaderCircle, Target,
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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function UserTechTransferCreate() {
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState('project-details');
    const [errors, setErrors] = useState<any>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        is_assessment_based: false,
        monitoring_evaluation_plan: '',
        sustainability_plan: '',
        reporting_frequency: '',
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
            const endpoint = '/tech-transfers';

            if (hasFiles) {
                const formData = new FormData();
                Object.entries(data).forEach(([key, value]) => {
                    if (key === 'attachments') {
                        data.attachments.forEach((file) =>
                            formData.append('attachments[]', file)
                        );
                    } else if (typeof value === 'boolean') {
                        // Convert boolean to '1' or '0' for Laravel
                        formData.append(key, value ? '1' : '0');
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

            toast.success('Technology transfer created successfully!');
            navigate('/user/technology-transfer');
        } catch (err: any) {
            toast.error('Check the form for errors.');
            console.error('Submission error:', err.response?.data || err);
            setErrors(err.response?.data?.errors || {});
        } finally {
            setProcessing(false);
        }
    };

    const breadcrumbs = [
        { title: 'Technology Transfers', href: '/user/tech-transfer' },
        { title: 'Add New Technology Transfer', href: '/user/tech-transfer/create' },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-medium">Create New Project</h1>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <ScrollArea className="py-2">
                            <TabsList className="flex w-full">
                                <TabsTrigger value="project-details">Project Details</TabsTrigger>
                                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                                <TabsTrigger value="partner-information">Partner Information</TabsTrigger>
                                <TabsTrigger value="ip-status">IP & Status</TabsTrigger>
                                <TabsTrigger value="assessment-reporting">Assessment & Reporting</TabsTrigger>
                                <TabsTrigger value="attachments">Attachments</TabsTrigger>
                            </TabsList>
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>

                        {/* --- Project Details --- */}
                        <TabsContent value="project-details">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Folder className="h-5 w-5" /> Project Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 md:grid-cols-2">
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="name">Project Name</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={handleChange}
                                            placeholder="Enter project name"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.name} />
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

                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Select
                                            value={data.category}
                                            onValueChange={(val) => setData((prev) => ({ ...prev, category: val }))}
                                        >
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="private">Private</SelectItem>
                                                <SelectItem value="government">Government</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.category} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="leader">Project Leader</Label>
                                        <Input
                                            id="leader"
                                            value={data.leader}
                                            onChange={handleChange}
                                            placeholder="Enter project leader"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.leader} />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="purpose">Purpose</Label>
                                        <Textarea
                                            id="purpose"
                                            value={data.purpose}
                                            onChange={handleChange}
                                            placeholder="Enter project purpose"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.purpose} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tags">Keywords/Tags</Label>
                                        <Input
                                            id="tags"
                                            type="text"
                                            value={data.tags}
                                            onChange={handleChange}
                                            placeholder="Enter keywords or tags (e.g., AI, Research)"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.tags} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="deliverables">Deliverables</Label>
                                        <Input
                                            id="deliverables"
                                            type="text"
                                            value={data.deliverables}
                                            onChange={handleChange}
                                            placeholder="Enter deliverables"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.deliverables} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="timeline">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" /> Timeline
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* --- Partner Information --- */}
                        <TabsContent value="partner-information" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Partner Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="agency_partner">Agency Partner</Label>
                                            <Input
                                                id="agency_partner"
                                                value={data.agency_partner}
                                                onChange={handleChange}
                                                placeholder="Enter agency partner"
                                                disabled={processing}
                                            />
                                            <InputError message={errors.agency_partner} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="contact_person">Contact Person</Label>
                                            <Input
                                                id="contact_person"
                                                value={data.contact_person}
                                                onChange={handleChange}
                                                placeholder="Enter contact person"
                                                disabled={processing}
                                            />
                                            <InputError message={errors.contact_person} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="contact_email">Email</Label>
                                            <Input
                                                id="contact_email"
                                                type="email"
                                                value={data.contact_email}
                                                onChange={handleChange}
                                                placeholder="Enter contact email"
                                                disabled={processing}
                                            />
                                            <InputError message={errors.contact_email} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="contact_phone">Phone</Label>
                                            <Input
                                                id="contact_phone"
                                                value={data.contact_phone}
                                                onChange={handleChange}
                                                placeholder="Enter contact phone"
                                                disabled={processing}
                                            />
                                            <InputError message={errors.contact_phone} />
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <Label htmlFor="contact_address">Address</Label>
                                            <Input
                                                id="contact_address"
                                                value={data.contact_address}
                                                onChange={handleChange}
                                                placeholder="Enter contact address"
                                                disabled={processing}
                                            />
                                            <InputError message={errors.contact_address} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* --- IP & Status --- */}
                        <TabsContent value="ip-status">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" /> Intellectual Property
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="copyright">Copyright</Label>
                                        <Select
                                            value={data.copyright}
                                            onValueChange={(val) =>
                                                setData((prev) => ({ ...prev, copyright: val }))
                                            }
                                        >
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder="Select copyright status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="yes">Yes</SelectItem>
                                                <SelectItem value="no">No</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.copyright} />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="ip_details">IP Details</Label>
                                        <Textarea
                                            id="ip_details"
                                            value={data.ip_details}
                                            onChange={handleChange}
                                            placeholder="Enter intellectual property details"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.ip_details} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* --- Assessment --- */}
                        <TabsContent value="assessment-reporting">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5" /> Assessment & Reporting
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 md:grid-cols-2">
                                    <div className='space-y-2'>
                                        <Label htmlFor="is_assessment_based">Assessment Based</Label>
                                        <Select
                                            value={data.is_assessment_based ? 'true' : 'false'}
                                            onValueChange={(val) =>
                                                setData((prev) => ({
                                                    ...prev,
                                                    is_assessment_based: val === 'true',
                                                }))
                                            }
                                        >
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder="Select option" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="true">Yes</SelectItem>
                                                <SelectItem value="false">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.is_assessment_based} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reporting_frequency">Reporting Frequency</Label>
                                        <Input
                                            id="reporting_frequency"
                                            type="number"
                                            placeholder="Enter reporting frequency"
                                            value={data.reporting_frequency}
                                            onChange={handleChange}
                                            disabled={processing}
                                        />
                                        <InputError message={errors.reporting_frequency} />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="monitoring_evaluation_plan">Monitoring and Evaluation Plan</Label>
                                        <Textarea
                                            id="monitoring_evaluation_plan"
                                            value={data.monitoring_evaluation_plan}
                                            onChange={handleChange}
                                            placeholder="Enter monitoring and evaluation plan"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.monitoring_evaluation_plan} />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label htmlFor="sustainability_plan">Sustainability Plan</Label>
                                        <Textarea
                                            id="sustainability_plan"
                                            value={data.sustainability_plan}
                                            onChange={handleChange}
                                            placeholder="Enter sustainability plan"
                                            disabled={processing}
                                        />
                                        <InputError message={errors.sustainability_plan} />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* --- Attachments --- */}
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
                                                    className="file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
                                            <div className="space-y-2">
                                                <div className='flex items-center justify-between'>
                                                    <Label className="text-sm font-medium">Selected Files ({data.attachments.length})</Label>
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
