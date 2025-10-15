import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layout/app-layout";
import type { BreadcrumbItem, User } from "@/types";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Edit, Mail, MapPin, Shield, ShieldCheck, Trash2, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/axios";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User Management',
        href: '/admin/users',
    },
    {
        title: 'User Details',
        href: '#',
    },
];

interface TechTransfer {
    id: number;
    name: string;
    category?: string;
    start_date?: string;
    end_date?: string;
    budget?: number;
}

type UserData = User & {
    tech_transfers?: TechTransfer[];
    college?: {
        id: number;
        name: string;
        campus?: {
            id: number;
            name: string;
        };
    };
    name: string;
    email: string;
    role: string;
    created_at: string;
    updated_at: string;
    email_verified_at?: string;
};

export default function ShowUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get(`/users/${id}`);
                console.log('User API Response:', response.data);
                const userData = response.data.data || response.data;
                console.log('Parsed User Data:', userData);
                setUser(userData);
            } catch (error: any) {
                console.error('Error loading user:', error);
                console.error('Error response:', error.response?.data);
                toast.error(error.response?.data?.message || 'Failed to load user details');
                // Don't navigate away, just show error
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!user) return;

        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
            try {
                await api.delete(`/users/${user.id}`);
                toast.success('User deleted successfully');
                navigate('/admin/users');
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    const handleToggleAdmin = async () => {
        if (!user) return;

        const action = user.role === 'admin' ? 'remove admin privileges from' : 'grant admin privileges to';
        if (confirm(`Are you sure you want to ${action} ${user.name}?`)) {
            try {
                const response = await api.patch(`/users/${user.id}/toggle-admin`);
                toast.success(response.data.message || 'Admin status updated successfully');
                // Refresh user data
                const updatedUser = await api.get(`/users/${id}`);
                setUser(updatedUser.data.data || updatedUser.data);
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Failed to update admin status');
            }
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

    const formatDateShort = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
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
                <div className="flex h-full flex-1 flex-col items-center justify-center gap-4">
                    <p className="text-muted-foreground">User not found</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold">{user.name}</h1>
                            <p className="text-muted-foreground">
                                User Details and Activity
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge
                            variant={user.role === 'admin' ? "default" : "secondary"}
                            className="cursor-pointer"
                            onClick={handleToggleAdmin}
                        >
                            {user.role === 'admin' ? (
                                <>
                                    <ShieldCheck className="mr-1 h-3 w-3" />
                                    Admin
                                </>
                            ) : (
                                <>
                                    <Shield className="mr-1 h-3 w-3" />
                                    User
                                </>
                            )}
                        </Badge>
                        <Link to={`/admin/users/${user.id}/edit`}>
                            <Button variant="outline" size="sm">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                        </Link>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* User Information */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserIcon className="h-5 w-5" />
                                User Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                    <p className="text-lg font-medium">{user.name}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <p>{user.email}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Campus & College</label>
                                    {user.college ? (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">{user.college.campus?.name || 'N/A'}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {user.college.name}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">Not assigned</p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">User ID</label>
                                    <p className="font-mono text-sm">#{user.id}</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="font-medium">Account Details</h4>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                                    <p className="text-sm">{formatDate(user.created_at)}</p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                                    <p className="text-sm">{formatDate(user.updated_at)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* User Projects */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>User Projects</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {user.tech_transfers && user.tech_transfers.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Project Name</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Start Date</TableHead>
                                            <TableHead>End Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {user.tech_transfers.map((project: TechTransfer) => (
                                            <TableRow key={project.id}>
                                                <TableCell className="font-medium">{project.name}</TableCell>
                                                <TableCell>{project.category || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {project.end_date && new Date(project.end_date) < new Date()
                                                            ? 'Completed'
                                                            : 'Active'
                                                        }
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {project.start_date ? formatDateShort(project.start_date) : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {project.end_date ? formatDateShort(project.end_date) : 'N/A'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">No projects found for this user.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
