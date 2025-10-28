import React, { useRef, useState } from 'react';
import {
    FileText, Trophy, Image
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
import { cn } from '@/lib/utils';

export default function UserAwardsCreate() {
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);
    const [step, setStep] = useState(1);
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

    const steps = [
        { title: "Award Details", icon: Trophy },
        { title: "Upload Files", icon: FileText },
    ];

    const nextStep = () => setStep((prev) => Math.min(prev + 1, steps.length));
    const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

    // Validate current step before proceeding
    const validateStep = () => {
        const newErrors: any = {};
        if (step === 1) {
            if (!data.award_name) newErrors.award_name = 'Award name is required.';
            if (!data.awarding_body) newErrors.awarding_body = 'Awarding body is required.';
            if (!data.date_received) newErrors.date_received = 'Date received is required.';
            if (!data.description) newErrors.description = 'Description is required.';
            if (!data.location) newErrors.location = 'Location is required.';
            if (!data.event_details) newErrors.event_details = 'Event details are required.';
            if (!data.people_involved) newErrors.people_involved = 'People involved are required.';
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
                if (fileInputRef.current) fileInputRef.current.value = '';
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
        { title: 'New Award', href: '/user/awards-recognition/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                <div className="flex items-center justify-center">
                    <h1 className="text-2xl font-medium">New Award</h1>
                </div>
                <div className="flex justify-center max-w-3xl mx-auto w-full">
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
                                            ? "border-yellow-600 bg-yellow-50 text-yellow-600"
                                            : "border-gray-300 text-gray-400",
                                        isCompleted ? "bg-yellow-600 border-yellow-600 text-white" : ""
                                    )}
                                >
                                    <Icon size={24} />
                                </div>
                                <p className={`mt-2 text-sm ${isActive ? "text-yellow-600" : "text-gray-500"}`}>
                                    {s.title}
                                </p>
                                <p className="text-xs text-gray-400">Step {index + 1} of {steps.length}</p>
                            </div>
                        );
                    })}
                </div>
                <Card className="max-w-3xl mx-auto w-full border-1 border-yellow-500/50">
                    <CardContent>
                        {step === 1 && (
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2">
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
                                <div className="space-y-2 md:col-span-2">
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
                            </div>
                        )}
                        {step === 2 && (
                            <div className="max-w-4xl mx-auto w-full">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="attachments">Upload Files</Label>
                                        <Input
                                            ref={fileInputRef}
                                            id="attachments"
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                                            multiple={true}
                                            onChange={(e) => addFiles(e.target.files)}
                                            disabled={processing}
                                            className="file:px-8 file:rounded-md file:border-0 file:text-sm file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Supported formats: JPG, PNG, PDF, DOC, DOCX (Max 10MB each)
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
                                                        className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50"
                                                    >
                                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                                            <div className="flex-shrink-0">
                                                                {file.type.startsWith('image/') ? (
                                                                    <Image className="h-5 w-5 text-yellow-500" />
                                                                ) : (
                                                                    <FileText className="h-5 w-5 text-yellow-500" />
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
                        )}
                    </CardContent>
                </Card>

                {/* Navigation buttons */}
                <div className="flex justify-between max-w-3xl mx-auto w-full">
                    <Button variant="outline" disabled={step === 1} onClick={prevStep}>
                        Previous
                    </Button>
                    {step < steps.length ? (
                        <Button onClick={validateStep} className='bg-yellow-600 hover:bg-yellow-700'>Next</Button>
                    ) : (
                        <Button onClick={handleSubmit} className='bg-yellow-600 hover:bg-yellow-700'>Submit</Button>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
