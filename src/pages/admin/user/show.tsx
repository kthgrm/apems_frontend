import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/layout/app-layout";
import type { BreadcrumbItem, User } from "@/types";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Edit, Shield, ShieldCheck, Trash2, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { asset } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
        logo: string;
        campus?: {
            id: number;
            name: string;
        };
    };
    first_name: string;
    last_name: string;
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

        if (confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}?`)) {
            try {
                await api.delete(`/users/${user.id}`);
                toast.success('User deleted successfully');
                navigate('/admin/users');
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Failed to delete user');
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
                            <h1 className="text-3xl font-bold">User Details</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge
                            variant={user.role === 'admin' ? "default" : "secondary"}
                        >
                            {user.role === 'admin' ? (
                                <>
                                    <ShieldCheck className="mr-1 h-3 w-3" />
                                    Admin
                                </>
                            ) : (
                                <>
                                    <Shield className="mr-1 h-3 w-3" />
                                    CESU
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
                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserIcon className="h-5 w-5" />
                            User Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">First Name</Label>
                                <Input value={user.first_name} readOnly className="text-lg font-medium" />
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Last Name</Label>
                                <Input value={user.last_name} readOnly className="text-lg font-medium" />
                            </div>
                            <div className="col-span-2">
                                <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
                                <Input value={user.email} readOnly className="text-lg font-medium" />
                            </div>

                            <div className="col-span-2">
                                <Label className="text-sm font-medium text-muted-foreground">Campus & College</Label>
                                {user.college ? (
                                    <div className="flex items-center gap-2">
                                        <img src={asset(user.college.logo)} alt={user.college.campus?.name} className="w-12" />
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
            </div>
        </AppLayout>
    );
}
