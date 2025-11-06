import React, { useState, useEffect, useRef } from 'react';
import { ChartNoAxesColumnIncreasing, FileText, Image } from 'lucide-react';
import AppLayout from '@/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import InputError from '@/components/input-error';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

export default function UserImpactAssessmentsCreate() {
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState<any>({});
    const [techTransfers, setTechTransfers] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);


    const [data, setData] = useState({
        tech_transfer_id: '',
        title: '',
        description: '',
        attachments: [] as File[],
    });

    const steps = [
        { title: "Assessment Details", icon: ChartNoAxesColumnIncreasing },
    ];

    const nextStep = () => setStep((prev) => Math.min(prev + 1, steps.length));

    const validateStep = () => {
        const newErrors: any = {};
        if (step === 1) {
            if (!data.title) newErrors.title = 'Title is required.';
            if (!data.description) newErrors.description = 'Description is required.';
            if (!data.tech_transfer_id) newErrors.tech_transfer_id = 'Technology transfer is required.';
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

    useEffect(() => {
        const fetchTechTransfers = async () => {
            try {
                const response = await api.get('/user/tech-transfers');
                setTechTransfers(response.data.data);
            } catch (err) {
                console.error('Failed to fetch tech transfers:', err);
                toast.error('Failed to load projects');
            }
        };

        fetchTechTransfers();
    }, []);

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

            if (hasFiles) {
                const formData = new FormData();
                Object.entries(data).forEach(([key, value]) => {
                    if (key === 'attachments') {
                        data.attachments.forEach((file: File) => {
                            formData.append('attachments[]', file);
                        });
                    } else {
                        formData.append(key, String(value));
                    }
                });

                await api.post('/impact-assessments', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await api.post('/impact-assessments', data);
            }
            toast.success('Impact assessment created successfully!');
            navigate('/user/impact-assessment');
        } catch (err: any) {
            toast.error('Check the form for errors.');
            console.error('Submission error:', err.response?.data || err);
            setErrors(err.response?.data?.errors || {});
        } finally {
            setProcessing(false);
        }
    };

    const breadcrumbs = [
        { title: 'Impact Assessments', href: '/user/impact-assessments' },
        { title: 'Add New Assessment', href: '/user/impact-assessments/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                <div className="flex items-center justify-center">
                    <h1 className="text-2xl font-medium">New Impact Assessment</h1>
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
                                            ? "border-violet-600 bg-violet-50 text-violet-600"
                                            : "border-gray-300 text-gray-400",

                                        isCompleted ? "bg-violet-600 border-violet-600 text-white" : ""
                                    )}
                                >
                                    <Icon size={24} />
                                </div>
                                <p className={`mt-2 text-sm ${isActive ? "text-violet-600" : "text-gray-500"}`}>
                                    {s.title}
                                </p>
                            </div>
                        );
                    })}
                </div>
                <Card className="max-w-3xl mx-auto w-full border-1 border-violet-500/50">
                    <CardContent>
                        <div className={cn("grid gap-6 md:grid-cols-2", step !== 1 && "hidden")}>
                            <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="title">Title<span className="text-red-600">*</span></Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={handleChange}
                                    placeholder="Enter title"
                                    disabled={processing}
                                />
                                <InputError message={errors.title} />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label htmlFor="description">Description<span className="text-red-600">*</span></Label>
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
                            <div className="space-y-2 col-span-2">
                                <Label>Project<span className="text-red-600">*</span></Label>
                                <Select
                                    value={data.tech_transfer_id ? data.tech_transfer_id : ''}
                                    onValueChange={(value) => {
                                        setData((prev) => ({ ...prev, tech_transfer_id: value }));
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select project" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {techTransfers.map((techTransfer) => (
                                                <SelectItem
                                                    key={techTransfer.id}
                                                    value={techTransfer.id.toString()}
                                                >
                                                    {techTransfer.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.tech_transfer_id} />
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 col-span-2">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="attachments">Terminal Report</Label>
                                    <Input
                                        ref={fileInputRef}
                                        id="attachments"
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        multiple={true}
                                        onChange={(e) => addFiles(e.target.files)}
                                        disabled={processing}
                                        className="file:px-8 file:rounded-md file:border-0 file:text-sm file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
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
                                                    className="flex items-center justify-between p-3 border rounded-lg bg-violet-50"
                                                >
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className="flex-shrink-0">
                                                            {file.type.startsWith('image/') ? (
                                                                <Image className="h-5 w-5 text-violet-500" />
                                                            ) : (
                                                                <FileText className="h-5 w-5 text-violet-500" />
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
                <div className="flex justify-end max-w-3xl mx-auto w-full">
                    {step < steps.length ? (
                        <Button onClick={validateStep} className='bg-violet-500 hover:bg-violet-600'>Next</Button>
                    ) : (
                        <Button onClick={handleSubmit} className='bg-violet-500 hover:bg-violet-600'>Submit</Button>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
