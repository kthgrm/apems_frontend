import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layout/app-layout";
import type { BreadcrumbItem } from "@/types";
import InputError from "@/components/input-error";
import { Building, LoaderCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { useNavigate } from "react-router-dom";

const CampusCreate = () => {
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const [data, setData] = useState<{
        name: string;
        code: string;
        campus_id: string;
        logo: File | null;
    }>({
        name: '',
        code: '',
        campus_id: '',
        logo: null,
    });

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

                await api.post(`/campuses`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Regular JSON payload (no file)
                const payload = {
                    name: data.name,
                };

                await api.post(`/campuses`, payload);
            }

            toast.success('Campus created successfully');
            navigate(-1);
        } catch (err: any) {
            const validationErrors = err.response?.data?.errors || {};
            setErrors(validationErrors);
        } finally {
            setProcessing(false);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Campus', href: '/admin/campus' },
        { title: 'Add New Campus', href: '/admin/campus/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Add New Campus</h1>
                </div>

                <form onSubmit={handleSubmit} className="max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="h-5 w-5" />
                                Campus Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Campus Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-base font-medium">
                                    Name<span className="text-red-500">*</span>
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

                            {/* Campus Logo */}
                            <div className="space-y-2">
                                <Label htmlFor="logo" className="text-base font-medium justify-between">
                                    <p>Logo <span className="text-red-500">*</span></p>
                                    <p className="text-sm">(max size: 2MB)</p>
                                </Label>
                                <div className="space-y-2">
                                    <Input
                                        id="logo"
                                        type="file"
                                        accept=".jpg,.jpeg,.png"
                                        onChange={handleFileChange}
                                        disabled={processing}
                                        className="h-10"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Supported formats: JPG, JPEG, PNG
                                    </p>
                                </div>
                                <InputError message={errors.logo} />
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-4">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                >
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Campus
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    )
}

export default CampusCreate