import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppLayout from "@/layout/app-layout";
import type { BreadcrumbItem, Campus, College } from "@/types";
import api from "@/lib/axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Management',
        href: '/admin/users',
    },
    {
        title: 'Create User',
        href: '/admin/users/create',
    },
];

export default function CreateUser() {
    const navigate = useNavigate();
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [colleges, setColleges] = useState<College[]>([]);
    const [filteredColleges, setFilteredColleges] = useState<College[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        role: 'user',
        campus_id: '',
        college_id: '',
        is_active: true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch campuses
                const campusResponse = await api.get('/campuses');
                setCampuses(campusResponse.data.data || campusResponse.data);

                // Fetch all colleges
                const collegeResponse = await api.get('/colleges');
                setColleges(collegeResponse.data.data || collegeResponse.data);

                setLoading(false);
            } catch (error: any) {
                toast.error('Failed to load data');
                console.error('Error loading data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // If campus is changed, filter colleges and reset college_id
        if (field === 'campus_id') {
            const filtered = colleges.filter(college => college.campus_id.toString() === value);
            setFilteredColleges(filtered);
            setFormData(prev => ({ ...prev, college_id: '' }));
        }

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
            // Remove campus_id from submission since college already has the campus relationship
            const { campus_id, ...submitData } = formData;
            const response = await api.post('/users', submitData);
            toast.success(response.data.message || 'User created successfully');
            navigate('/admin/users');
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
                Object.values(error.response.data.errors).forEach((errorMsg: any) => {
                    toast.error(errorMsg);
                });
            } else {
                toast.error(error.response?.data?.message || 'Failed to create user');
            }
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="flex h-full flex-1 items-center justify-center">
                    <p>Loading...</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Create New User</h1>
                        <p className="text-muted-foreground">
                            Add a new user to the system
                        </p>
                    </div>
                </div>

                {/* Form */}
                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>User Information</CardTitle>
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

                            {/* Password Information */}
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    A temporary password will be automatically generated and sent to the user's email address.
                                    The user will be required to change their password upon first login.
                                </p>
                            </div>

                            {/* Campus */}
                            <div className="space-y-2">
                                <Label htmlFor="campus_id">Campus *</Label>
                                <Select
                                    value={formData.campus_id}
                                    onValueChange={(value) => handleChange('campus_id', value)}
                                >
                                    <SelectTrigger className={errors.campus_id ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Select campus first" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {campuses.map((campus) => (
                                            <SelectItem key={campus.id} value={campus.id.toString()}>
                                                {campus.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.campus_id && (
                                    <p className="text-sm text-destructive">{errors.campus_id}</p>
                                )}
                            </div>

                            {/* College */}
                            <div className="space-y-2">
                                <Label htmlFor="college_id">College *</Label>
                                <Select
                                    value={formData.college_id}
                                    onValueChange={(value) => handleChange('college_id', value)}
                                    disabled={!formData.campus_id}
                                >
                                    <SelectTrigger className={errors.college_id ? 'border-destructive' : ''}>
                                        <SelectValue placeholder={formData.campus_id ? "Select college" : "Please select a campus first"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredColleges.map((college) => (
                                            <SelectItem key={college.id} value={college.id.toString()}>
                                                {college.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.college_id && (
                                    <p className="text-sm text-destructive">{errors.college_id}</p>
                                )}
                            </div>

                            {/* Role */}
                            <div className="space-y-2">
                                <Label htmlFor="role">Role *</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value) => handleChange('role', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground">
                                    Admin users have access to administrative features and can manage other users.
                                </p>
                            </div>

                            {/* Active Status */}
                            <div className="">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) => handleChange('is_active', checked as boolean)}
                                    />
                                    <Label htmlFor="is_active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Account is active
                                    </Label>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Inactive users will not be able to log in to the system.
                                </p>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end gap-4">
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => navigate('/admin/users')}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing} className="bg-blue-500 hover:bg-blue-600">
                                    {processing ? 'Creating...' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
