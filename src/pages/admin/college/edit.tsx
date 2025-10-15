import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layout/app-layout';
import api from '@/lib/axios';
import { asset } from '@/lib/utils';
import type { BreadcrumbItem, College } from '@/types';
import { Building, Calendar, GraduationCap, LoaderCircle, Save } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

const CollegeEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [college, setCollege] = useState<College | null>(null);
    const [campuses, setCampuses] = useState<{ id: number; name: string; }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [data, setData] = useState<{
        name: string;
        description: string;
        code: string;
        campus_id: string;
        logo: File | null;
    }>({
        name: '',
        description: '',
        code: '',
        campus_id: '',
        logo: null,
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await api.get(`/colleges/${id}`);
                const col = res.data.data;
                setCollege(res.data.data);

                // Fetch campuses for the select dropdown
                const campusRes = await api.get('/campuses');
                setCampuses(campusRes.data.data);

                setData({
                    name: col.name || '',
                    description: col.description || '',
                    code: col.code || '',
                    campus_id: String(col.campus_id || ''),
                    logo: null, // Don't set the old logo path here, keep it as null
                });
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        if (id) {
            fetchData();
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            // Check if a logo file needs to be uploaded
            const hasLogoFile = data.logo instanceof File;

            if (hasLogoFile) {
                // Use FormData for file upload
                const formData = new FormData();

                // Add all form fields
                Object.entries(data).forEach(([key, value]) => {
                    if (key === 'logo' && value instanceof File) {
                        // Add the logo file
                        formData.append('logo', value);
                    } else if (value !== null && value !== undefined) {
                        formData.append(key, String(value));
                    }
                });

                // Laravel PUT workaround: use POST with _method
                formData.append('_method', 'PUT');

                await api.post(`/colleges/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Regular JSON payload (no file)
                const payload = {
                    name: data.name,
                    description: data.description,
                    code: data.code,
                    campus_id: data.campus_id,
                };

                await api.put(`/colleges/${id}`, payload);
            }

            toast.success('College updated successfully');
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

    const handleCampusChange = (value: string) => {
        setData(prev => ({ ...prev, campus_id: value }));
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            toast.error('Invalid file type. Please upload JPG, JPEG, or PNG.');
            return;
        }

        // Validate file size (max 2MB)
        const maxSize = 2 * 1024 * 1024; // 2MB in bytes
        if (file.size > maxSize) {
            toast.error('File is too large. Maximum size is 2MB.');
            return;
        }

        setData(prev => ({ ...prev, logo: file }));
    };

    const handleRemoveFile = () => {
        setData(prev => ({ ...prev, logo: null }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const hasNewFile = data.logo instanceof File;

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'College', href: '/admin/college' },
        { title: 'Edit', href: `/admin/college/${id}/edit` }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} >
            {isLoading ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                    Loading college...
                </div>
            ) : (
                <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold">Edit College</h1>
                            <p className="text-muted-foreground">
                                Update information for {college?.name}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                disabled={processing}
                                onClick={handleSubmit}
                            >
                                {processing ? (
                                    <>
                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Update College
                                    </>
                                )}
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
                        {/* Form */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <GraduationCap className="h-5 w-5" />
                                        College Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Campus Selection */}
                                        <div className="space-y-2">
                                            <Label htmlFor="campus_id">Campus *</Label>
                                            <Select value={data.campus_id} onValueChange={handleCampusChange} >
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder="Select campus..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {campuses.map((campus) => (
                                                        <SelectItem key={campus.id} value={campus.id.toString()}>
                                                            {campus.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.campus_id} />
                                        </div>

                                        {/* College Name */}
                                        <div className="space-y-2">
                                            <Label htmlFor="name">College Name *</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={handleChange}
                                                placeholder="Enter college name"
                                                required
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        {/* College Code */}
                                        <div className="space-y-2">
                                            <Label htmlFor="code">College Code *</Label>
                                            <Input
                                                id="code"
                                                type="text"
                                                value={data.code}
                                                onChange={handleChange}
                                                placeholder="Enter college code (e.g., CICT, COE)"
                                                maxLength={10}
                                                required
                                            />
                                            <InputError message={errors.code} />
                                        </div>

                                        {/* Logo Upload */}
                                        <div className="space-y-4">
                                            <Label htmlFor="logo" className="text-sm font-medium">
                                                Logo (max size: 2MB)
                                            </Label>

                                            {/* Logo Preview */}
                                            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                                                <Avatar className="h-16 w-16">
                                                    <AvatarImage
                                                        src={hasNewFile && data.logo instanceof File
                                                            ? URL.createObjectURL(data.logo)
                                                            : asset(college?.logo || '')}
                                                        alt={`${college?.name || 'College'} logo`}
                                                    />
                                                    <AvatarFallback>
                                                        <Building className='p-0.5' />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <p className="font-medium">
                                                        {hasNewFile ? 'New Logo Preview' : 'Current Logo'}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {hasNewFile && data.logo instanceof File
                                                            ? `New file: ${data.logo.name}`
                                                            : college?.logo
                                                                ? college.logo
                                                                : 'No logo uploaded'
                                                        }
                                                    </p>
                                                    {hasNewFile && (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={handleRemoveFile}
                                                            className="mt-2"
                                                        >
                                                            Remove New File
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* File Upload Input */}
                                            <div className="space-y-3">
                                                <Input
                                                    ref={fileInputRef}
                                                    id="logo"
                                                    type="file"
                                                    accept="image/jpeg,image/jpg,image/png"
                                                    onChange={handleFileChange}
                                                    disabled={processing}
                                                    className="h-10"
                                                />
                                                <p className="text-sm text-muted-foreground">
                                                    Supported formats: JPG, JPEG, PNG. Leave empty to keep current logo.
                                                </p>
                                            </div>
                                            <InputError message={errors.logo} />
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Timeline Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Timeline Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-muted-foreground">Created At</Label>
                                            <Input
                                                value={formatDate(college?.created_at)}
                                                readOnly
                                                className="bg-muted text-xs"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                                            <Input
                                                value={formatDate(college?.updated_at)}
                                                readOnly
                                                className="bg-muted text-xs"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    )
}

export default CollegeEdit