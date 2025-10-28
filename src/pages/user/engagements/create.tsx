import React, { useRef, useState } from 'react';
import {
    FileText, Handshake, Image,
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

export default function UserEngagementsCreate() {
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState<any>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [data, setData] = useState({
        agency_partner: '',
        location: '',
        activity_conducted: '',
        start_date: '',
        end_date: '',
        number_of_participants: '',
        faculty_involved: '',
        narrative: '',
        attachments: [] as File[],
        attachment_link: '',
    });

    const steps = [
        { title: "Engagement Details", icon: Handshake },
        { title: "Upload Files", icon: FileText },
    ];

    const nextStep = () => setStep((prev) => Math.min(prev + 1, steps.length));
    const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

    // Validate current step before proceeding
    const validateStep = () => {
        const newErrors: any = {};
        if (step === 1) {
            if (!data.agency_partner) newErrors.agency_partner = 'Agency partner is required.';
            if (!data.location) newErrors.location = 'Location is required.';
            if (!data.activity_conducted) newErrors.activity_conducted = 'Activity conducted is required.';
            if (!data.start_date) newErrors.start_date = 'Start date is required.';
            if (!data.end_date) newErrors.end_date = 'End date is required.';
            if (!data.faculty_involved) newErrors.faculty_involved = 'Faculty involved is required.';
            if (!data.number_of_participants) newErrors.number_of_participants = 'Number of participants is required.';
            if (!data.narrative) newErrors.narrative = 'Narrative is required.';
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
            const endpoint = '/engagements';

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

            toast.success('Engagement created successfully!');
            navigate('/user/engagements');
        } catch (err: any) {
            toast.error('Check the form for errors.');
            console.error('Submission error:', err.response?.data || err);
            setErrors(err.response?.data?.errors || {});
        } finally {
            setProcessing(false);
        }
    };

    const breadcrumbs = [
        { title: 'Engagements', href: '/user/engagements' },
        { title: 'New Engagement', href: '/user/engagements/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                <div className="flex items-center justify-center">
                    <h1 className="text-2xl font-medium">Submit Engagement</h1>
                </div>
                <div className="flex justify-center max-w-3xl mx-auto w-full p-4">
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
                                            ? "border-green-600 bg-green-50 text-green-600"
                                            : "border-gray-300 text-gray-400",
                                        isCompleted ? "bg-green-600 border-green-600 text-white" : ""
                                    )}
                                >
                                    <Icon size={24} />
                                </div>
                                <p className={`mt-2 text-sm ${isActive ? "text-green-600" : "text-gray-500"}`}>
                                    {s.title}
                                </p>
                                <p className="text-xs text-gray-400">Step {index + 1} of {steps.length}</p>
                            </div>
                        );
                    })}
                </div>
                <Card className="max-w-3xl mx-auto w-full border-1 border-green-500/50">
                    <CardContent>
                        <div className={cn("grid gap-6 md:grid-cols-2", step !== 1 && "hidden")}>
                            <div className="space-y-2">
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
                            <div className="space-y-2">
                                <Label htmlFor="activity_conducted">Activity Conducted</Label>
                                <Input
                                    id="activity_conducted"
                                    value={data.activity_conducted}
                                    onChange={handleChange}
                                    placeholder="e.g., Workshop, Seminar, Training"
                                    disabled={processing}
                                />
                                <InputError message={errors.activity_conducted} />
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
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:col-span-2">
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
                                <div className="space-y-2 col-span-3 md:col-span-1">
                                    <Label htmlFor="number_of_participants">Number of Participants</Label>
                                    <Input
                                        id="number_of_participants"
                                        type="number"
                                        value={data.number_of_participants}
                                        onChange={handleChange}
                                        placeholder="0"
                                        disabled={processing}
                                        min="0"
                                    />
                                    <InputError message={errors.number_of_participants} />
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="faculty_involved">Faculty Involved</Label>
                                <Input
                                    id="faculty_involved"
                                    value={data.faculty_involved}
                                    onChange={handleChange}
                                    placeholder="Enter faculty involved"
                                    disabled={processing}
                                />
                                <InputError message={errors.faculty_involved} />
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
                        </div>
                        <div className={cn("grid gap-6", step !== 2 && "hidden")}>
                            <div className="grid gap-6 md:grid-cols-2">
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
                        </div>
                    </CardContent>
                </Card>

                {/* Navigation buttons */}
                <div className="flex justify-between max-w-3xl mx-auto w-full">
                    <Button variant="outline" disabled={step === 1} onClick={prevStep}>
                        Previous
                    </Button>
                    {step < steps.length ? (
                        <Button onClick={validateStep} className='bg-green-500 hover:bg-green-600'>Next</Button>
                    ) : (
                        <Button onClick={handleSubmit} className='bg-green-500 hover:bg-green-600'>Submit</Button>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
