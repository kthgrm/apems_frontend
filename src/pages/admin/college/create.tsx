import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/layout/app-layout";
import type { BreadcrumbItem } from "@/types";
import InputError from "@/components/input-error";
import { GraduationCap, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { useNavigate } from "react-router-dom";

const CollegeCreate = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [campuses, setCampuses] = useState<{ id: number; name: string; }[]>([]);
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

    useEffect(() => {
        const fetchCampuses = async () => {
            setIsLoading(true);
            try {
                const response = await api.get('/campuses');
                setCampuses(response.data.data);
            } catch (error) {
                console.error('Error fetching campuses:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCampuses();
    }, []);

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

                await api.post(`/colleges`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Regular JSON payload (no file)
                const payload = {
                    name: data.name,
                    code: data.code,
                    campus_id: data.campus_id,
                };

                await api.post(`/colleges`, payload);
            }

            toast.success('College created successfully');
            navigate(-1);
        } catch (err: any) {
            const validationErrors = err.response?.data?.errors || {};
            setErrors(validationErrors);
        } finally {
            setProcessing(false);
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'College', href: '/admin/college' },
        { title: 'Add New College', href: '/admin/college/create' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {isLoading ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                    Loading...
                </div>
            ) : (
                <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold">Add New College</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="max-w-2xl">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5" />
                                    College Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Campus Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="campus_id" className="text-base font-medium">
                                        Campus <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={data.campus_id}
                                        onValueChange={handleCampusChange}
                                        disabled={processing}
                                    >
                                        <SelectTrigger className="h-10 w-full">
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
                                    <Label htmlFor="name" className="text-base font-medium">
                                        College Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={handleChange}
                                        placeholder="Enter college name"
                                        disabled={processing}
                                        className="h-10"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                {/* College Code */}
                                <div className="space-y-2">
                                    <Label htmlFor="code" className="text-base font-medium">
                                        College Code <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={handleChange}
                                        placeholder="Enter college code (e.g., CICT, COE)"
                                        maxLength={10}
                                        disabled={processing}
                                        className="h-10"
                                    />
                                    <InputError message={errors.code} />
                                </div>

                                {/* College Logo */}
                                <div className="space-y-2">
                                    <Label htmlFor="logo" className="text-base font-medium">
                                        Logo (max size: 2MB)<span className="text-red-500">*</span>
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
                                        className='bg-blue-500 hover:bg-blue-600'
                                    >
                                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                        Create
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </div>
            )}
        </AppLayout>
    )
}

export default CollegeCreate