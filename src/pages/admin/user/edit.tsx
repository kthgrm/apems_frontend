import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/layout/app-layout";
import type { BreadcrumbItem } from "@/types";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/axios";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Management',
        href: '/admin/users',
    },
    {
        title: 'Edit User',
        href: '#',
    },
];

interface College {
    id: number;
    name: string;
    campus?: {
        id: number;
        name: string;
    };
}

interface UserData {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    is_active: boolean;
    college_id?: number;
    college?: College;
    created_at: string;
    updated_at: string;
    email_verified_at?: string;
}

export default function EditUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserData | null>(null);
    const [colleges, setColleges] = useState<College[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        role: 'user',
        college_id: '',
        is_active: true,
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userResponse, collegesResponse] = await Promise.all([
                    api.get(`/users/${id}`),
                    api.get('/colleges')
                ]);

                const userData = userResponse.data.data || userResponse.data;
                setUser(userData);
                setFormData({
                    first_name: userData.first_name || '',
                    last_name: userData.last_name || '',
                    email: userData.email || '',
                    role: userData.role || 'user',
                    college_id: userData.college_id?.toString() || '',
                    is_active: userData.is_active ?? true,
                    password: '',
                    password_confirmation: '',
                });

                setColleges(collegesResponse.data.data || collegesResponse.data);
            } catch (error: any) {
                toast.error('Failed to load user details');
                console.error('Error loading data:', error);
                navigate('/admin/users');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id, navigate]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const response = await api.put(`/users/${id}`, formData);
            toast.success(response.data.message || 'User updated successfully');
            navigate('/admin/users');
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
                Object.values(error.response.data.errors).forEach((errorMsg: any) => {
                    toast.error(errorMsg);
                });
            } else {
                toast.error(error.response?.data?.message || 'Failed to update user');
            }
        } finally {
            setProcessing(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex h-full flex-1 items-center justify-center">
                    <div className="text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading user details...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (!user) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex h-full flex-1 items-center justify-center">
                    <p className="text-muted-foreground">User not found</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link to="/admin/users">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">Edit User</h1>
                        <p className="text-muted-foreground">
                            Update user information and permissions
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* User Info Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>User Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium">User ID</Label>
                                <p className="text-sm text-muted-foreground">#{user.id}</p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Created</Label>
                                <p className="text-sm text-muted-foreground">
                                    {formatDate(user.created_at)}
                                </p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium">Last Updated</Label>
                                <p className="text-sm text-muted-foreground">
                                    {formatDate(user.updated_at)}
                                </p>
                            </div>
                            {user.email_verified_at && (
                                <div>
                                    <Label className="text-sm font-medium">Email Verified</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {formatDate(user.email_verified_at)}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Edit Form */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Edit Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* First Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="first_name">First Name *</Label>
                                        <Input
                                            id="first_name"
                                            value={formData.first_name}
                                            onChange={(e) => handleChange('first_name', e.target.value)}
                                            placeholder="Enter first name"
                                            className={errors.first_name ? 'border-destructive' : ''}
                                            required
                                        />
                                        {errors.first_name && (
                                            <p className="text-sm text-destructive">{errors.first_name}</p>
                                        )}
                                    </div>

                                    {/* Last Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="last_name">Last Name *</Label>
                                        <Input
                                            id="last_name"
                                            value={formData.last_name}
                                            onChange={(e) => handleChange('last_name', e.target.value)}
                                            placeholder="Enter last name"
                                            className={errors.last_name ? 'border-destructive' : ''}
                                            required
                                        />
                                        {errors.last_name && (
                                            <p className="text-sm text-destructive">{errors.last_name}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        placeholder="Enter email address"
                                        className={errors.email ? 'border-destructive' : ''}
                                        required
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-destructive">{errors.email}</p>
                                    )}
                                </div>

                                {/* College */}
                                <div className="space-y-2">
                                    <Label htmlFor="college_id">College *</Label>
                                    <Select
                                        value={formData.college_id}
                                        onValueChange={(value) => handleChange('college_id', value)}
                                    >
                                        <SelectTrigger className={errors.college_id ? 'border-destructive' : '' + 'w-full'}>
                                            <SelectValue placeholder="Select college" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {colleges.map((college) => (
                                                <SelectItem key={college.id} value={college.id.toString()}>
                                                    {college.campus?.name ? `${college.campus.name} - ${college.name}` : college.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.college_id && (
                                        <p className="text-sm text-destructive">{errors.college_id}</p>
                                    )}
                                </div>

                                <Separator />

                                {/* Password Section */}
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-medium">Change Password</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Leave password fields empty to keep the current password
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Password */}
                                        <div className="space-y-2">
                                            <Label htmlFor="password">New Password</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => handleChange('password', e.target.value)}
                                                placeholder="Enter new password"
                                                className={errors.password ? 'border-destructive' : ''}
                                            />
                                            {errors.password && (
                                                <p className="text-sm text-destructive">{errors.password}</p>
                                            )}
                                        </div>

                                        {/* Confirm Password */}
                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                value={formData.password_confirmation}
                                                onChange={(e) => handleChange('password_confirmation', e.target.value)}
                                                placeholder="Confirm new password"
                                                className={errors.password_confirmation ? 'border-destructive' : ''}
                                            />
                                            {errors.password_confirmation && (
                                                <p className="text-sm text-destructive">{errors.password_confirmation}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Role and Status */}
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-medium">Permissions & Status</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Manage user access levels and account status
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Role */}
                                        <div className="space-y-2">
                                            <Label htmlFor="role">Role</Label>
                                            <Select
                                                value={formData.role}
                                                onValueChange={(value) => handleChange('role', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="user">User</SelectItem>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Active Status */}
                                        <div className="space-y-2">
                                            <Label htmlFor="is_active">Account Status</Label>
                                            <div className="flex items-center space-x-2 mt-2">
                                                <Checkbox
                                                    id="is_active"
                                                    checked={formData.is_active}
                                                    onCheckedChange={(checked) => handleChange('is_active', checked as boolean)}
                                                />
                                                <Label htmlFor="is_active" className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                    Account is active
                                                </Label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end gap-4">
                                    <Link to="/admin/users">
                                        <Button variant="outline" type="button">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        <Save className="mr-2 h-4 w-4" />
                                        {processing ? 'Updating...' : 'Update User'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
