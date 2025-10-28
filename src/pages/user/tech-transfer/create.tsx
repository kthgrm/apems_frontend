import React, { useRef, useState } from 'react';
import {
    FileText, Folder, Handshake, Image
} from 'lucide-react';
import AppLayout from '@/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import InputError from '@/components/input-error';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export default function UserTechTransferCreate() {
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);
    const [step, setStep] = useState(1);
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
        contact_phone: '',
        contact_address: '',
        copyright: 'no',
        ip_details: '',
        attachments: [] as File[],
        attachment_link: '',
    });

    const steps = [
        { title: "Project Details", icon: Folder },
        { title: "Partner Information", icon: Handshake },
        { title: "IP Information", icon: FileText },
        { title: "Upload File", icon: FileText },
    ];

    const nextStep = () => setStep((prev) => Math.min(prev + 1, steps.length));
    const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

    // Validate current step before proceeding
    const validateStep = () => {
        const newErrors: any = {};
        if (step === 1) {
            if (!data.name) newErrors.name = 'Project name is required.';
            if (!data.description) newErrors.description = 'Description is required.';
            if (!data.category) newErrors.category = 'Category is required.';
            if (!data.purpose) newErrors.purpose = 'Purpose is required.';
            if (!data.tags) newErrors.tags = 'Tags are required.';
            if (!data.leader) newErrors.leader = 'Project leader is required.';
            if (!data.deliverables) newErrors.deliverables = 'Deliverables are required.';
            if (!data.start_date) newErrors.start_date = 'Start date is required.';
            if (!data.end_date) newErrors.end_date = 'End date is required.';
            if (data.start_date && data.end_date && data.start_date >= data.end_date) {
                newErrors.end_date = 'End date must be after the start date.';
            }
        } else if (step === 2) {
            if (!data.agency_partner) newErrors.agency_partner = 'Agency partner is required.';
            if (!data.contact_person) newErrors.contact_person = 'Contact person is required.';
            if (!data.contact_address) newErrors.contact_address = 'Contact address is required.';
        } else if (step === 3) {
            if (!data.copyright) newErrors.copyright = 'Copyright information is required.';
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length === 0) {
            nextStep();
        }
    };

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
                if (fileInputRef.current) fileInputRef.current.value = '';
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
            console.error('Submission error:', err.response?.data);
            setErrors(err.response?.data?.errors || {});
        } finally {
            setProcessing(false);
        }
    };

    const breadcrumbs = [
        { title: 'Technology Transfers', href: '/user/tech-transfer' },
        { title: 'New Technology Transfer', href: '/user/tech-transfer/create' },
    ];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                <div className="flex items-center justify-center">
                    <h1 className="text-2xl font-medium">New Technology Transfer</h1>
                </div>
                <div className="flex justify-between max-w-3xl mx-auto w-full">
                    {steps.map((s, index) => {
                        const Icon = s.icon;
                        const isActive = step === index + 1;
                        const isCompleted = step > index + 1;
                        return (
                            <div key={index} className="flex flex-col items-center w-1/3 text-center">
                                <div
                                    className={cn(
                                        "flex items-center justify-center w-12 h-12 rounded-full border-2",
                                        isActive
                                            ? "border-blue-600 bg-blue-50 text-blue-600"
                                            : "border-gray-300 text-gray-400",

                                        isCompleted ? "bg-blue-600 border-blue-600 text-white" : ""
                                    )}
                                >
                                    <Icon size={24} />
                                </div>
                                <p className={`mt-2 text-sm ${isActive ? "text-blue-600" : "text-gray-500"}`}>
                                    {s.title}
                                </p>
                                <p className="text-xs text-gray-400">Step {index + 1} of {steps.length}</p>
                            </div>
                        );
                    })}
                </div>
                <Card className="max-w-3xl mx-auto w-full border-1 border-blue-500/50">
                    <CardContent>
                        <div className={cn("grid gap-6 md:grid-cols-2", step !== 1 && "hidden")}>
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
                        <div className={cn("grid gap-6 md:grid-cols-2", step !== 2 && "hidden")}>
                            <div className="space-y-2 md:col-span-2">
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
                            <div className="space-y-2 md:col-span-2">
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
                        <div className={cn("grid gap-6 md:grid-cols-2", step !== 3 && "hidden")}>
                            <div className="space-y-2 md:col-span-2">
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
                        </div>
                        <div className={cn("grid gap-6", step !== 4 && "hidden")}>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="attachments">Terminal Report</Label>
                                    <Input
                                        ref={fileInputRef}
                                        id="attachments"
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                        multiple={true}
                                        onChange={(e) => addFiles(e.target.files)}
                                        disabled={processing}
                                        className="file:px-8 file:rounded-md file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Supported formats: PDF, DOC, DOCX (Max 10MB each)
                                    </p>
                                    <InputError message={errors.attachments} />
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
                                                    className="flex items-center justify-between p-3 border rounded-lg bg-blue-50"
                                                >
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className="flex-shrink-0">
                                                            {file.type.startsWith('image/') ? (
                                                                <Image className="h-5 w-5 text-blue-500" />
                                                            ) : (
                                                                <FileText className="h-5 w-5 text-blue-500" />
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

                                <div className='space-y-2 md:col-span-2'>
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
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Navigation buttons */}
                <div className="flex justify-between max-w-3xl mx-auto w-full">
                    <Button variant="outline" disabled={step === 1} onClick={prevStep}>
                        Previous
                    </Button>
                    {step < steps.length ? (
                        <Button onClick={validateStep} className='bg-blue-500 hover:bg-blue-600'>Next</Button>
                    ) : (
                        <Button onClick={handleSubmit} className='bg-blue-500 hover:bg-blue-600'>Submit</Button>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
