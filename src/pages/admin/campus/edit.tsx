import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layout/app-layout';
import api from '@/lib/axios';
import { asset } from '@/lib/utils';
import type { BreadcrumbItem, Campus } from '@/types';
import { Building, Calendar, } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

const CampusEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [campus, setCampus] = useState<Campus | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [data, setData] = useState<{
        name: string;
        logo: File | null;
    }>({
        name: '',
        logo: null,
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await api.get(`/campuses/${id}`);
                const camp = res.data.data;
                setCampus(res.data.data);

                setData({
                    name: camp.name || '',
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

                await api.post(`/campuses/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Regular JSON payload (no file)
                const payload = {
                    name: data.name,
                };

                await api.put(`/campuses/${id}`, payload);
            }

            toast.success('Campus updated successfully');
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
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div>
                                    <h1 className="text-2xl font-bold">Edit Campus</h1>
                                    <p className="text-muted-foreground">Update campus information</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                disabled={processing}
                                onClick={handleSubmit}
                            >
                                {processing ? 'Updating...' : 'Update Campus'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Information */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="h-5 w-5" />
                                        Campus Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-muted-foreground">Campus ID</Label>
                                            <Input
                                                value={campus?.id}
                                                readOnly
                                                className="bg-muted"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-sm font-medium">
                                                Campus Name *
                                            </Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={handleChange}
                                                placeholder="Enter campus name"
                                                disabled={processing}
                                                className="h-10"
                                            />
                                            <InputError message={errors.name} />
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <Label htmlFor="logo" className="text-sm font-medium">
                                            Campus Logo (max size: 2MB)
                                        </Label>

                                        {/* Logo Preview */}
                                        <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                                            <Avatar className="h-16 w-16">
                                                <AvatarImage
                                                    src={hasNewFile && data.logo instanceof File
                                                        ? URL.createObjectURL(data.logo)
                                                        : asset(campus?.logo || '')}
                                                    alt={`${campus?.name || 'College'} logo`}
                                                />
                                                <AvatarFallback>
                                                    <Building className="h-10 w-10" />
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="font-medium">
                                                    {hasNewFile ? 'New Logo Preview' : 'Current Logo'}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {hasNewFile && data.logo instanceof File
                                                        ? `New file: ${data.logo.name}`
                                                        : campus?.logo
                                                            ? campus.logo
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
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar Information */}
                        <div className="space-y-6">
                            {/* Timeline Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Timeline Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-muted-foreground">Created At</Label>
                                            <Input
                                                value={formatDate(campus?.created_at)}
                                                readOnly
                                                className="bg-muted"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                                            <Input
                                                value={formatDate(campus?.updated_at)}
                                                readOnly
                                                className="bg-muted"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )
            }
        </AppLayout >
    )
}

export default CampusEdit