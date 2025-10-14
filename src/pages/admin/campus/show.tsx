import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layout/app-layout';
import api from '@/lib/axios';
import { asset } from '@/lib/utils';
import type { BreadcrumbItem, Campus } from '@/types';
import { Building, Calendar, Edit, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';

const DeleteCampusButton = ({ campus }: { campus: Campus }) => {
    const navigate = useNavigate();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const openDialog = () => {
        setIsDialogOpen(true);
        setPassword('');
        setErrorMessage('');
        setIsLoading(false);
    };

    const closeDialog = () => {
        if (isLoading) return; // Prevent closing during loading
        setIsDialogOpen(false);
        setPassword('');
        setErrorMessage('');
        setIsLoading(false);
    };

    const handleDelete = async () => {
        if (!password.trim()) {
            setErrorMessage('Please enter your password to confirm.');
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            await api.delete(`/campuses/${campus.id}`, {
                data: { password }
            });
            toast.success('Campus deleted successfully');
            setIsDialogOpen(false);
            setPassword('');
            setErrorMessage('');
            navigate(-1);
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.password) {
                setErrorMessage(error.response.data.password);
            } else if (error.response && error.response.data && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('Archive failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="destructive"
                className='bg-red-800 hover:bg-red-900'
                onClick={openDialog}
            >
                Delete Campus
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={() => { }}>
                <DialogContent
                    className="sm:max-w-[425px]"
                    onInteractOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>Delete Campus</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{campus?.name}" campus?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="password" className="text-sm font-medium">
                                Enter your password to confirm:
                            </label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full"
                                placeholder="Password"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleDelete();
                                    }
                                }}
                            />
                            {errorMessage && <InputError message={errorMessage} />}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeDialog}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isLoading || !password.trim()}
                            className="bg-red-700 hover:bg-red-800"
                        >
                            {isLoading ? (
                                <>
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    Delete Campus
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

const CampusShow = () => {
    const [campus, setCampus] = useState<Campus | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { id } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await api.get(`/campuses/${id}`);
                setCampus(res.data.data);
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

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Campus', href: '/admin/campus' },
        { title: 'Details', href: `/admin/campus/${id}` }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {isLoading ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                    Loading campus...
                </div>
            ) : (
                <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">
                    {/* Header Section */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div>
                                    <h1 className="text-2xl font-bold">{campus?.name}</h1>
                                    <p className="text-muted-foreground">Campus Details & Information</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" asChild>
                                <Link to={`/admin/campus/${campus?.id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Campus
                                </Link>
                            </Button>
                            <DeleteCampusButton campus={campus!} />
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
                                            <Label className="text-sm font-medium text-muted-foreground">Campus Name</Label>
                                            <Input
                                                value={campus?.name}
                                                readOnly
                                                className="bg-muted font-medium"
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <Label className="text-sm font-medium text-muted-foreground">Campus Logo</Label>
                                        {campus?.logo ? (
                                            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                                                <Avatar className="h-16 w-16">
                                                    <AvatarImage
                                                        src={asset(campus.logo)}
                                                        alt={`${campus.name} logo`}
                                                    />
                                                    <AvatarFallback>
                                                        <Building className="h-8 w-8" />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="overflow-ellipsis">
                                                    <p className="font-medium">Logo Image</p>
                                                    <p className="text-sm text-muted-foreground">Path: {campus.logo}</p>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="mt-2"
                                                        onClick={() => window.open(asset(campus.logo), '_blank')}
                                                    >
                                                        View Full Size
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center p-8 border-2 border-dashed border-muted rounded-lg">
                                                <div className="text-center">
                                                    <Building className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                                    <p className="text-muted-foreground">No logo uploaded</p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Edit campus to add a logo
                                                    </p>
                                                </div>
                                            </div>
                                        )}
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
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Created</span>
                                            <div className='flex flex-col items-end'>
                                                <span>{campus && campus.created_at ? new Date(campus.created_at).toLocaleDateString() : '-'}</span>
                                                <span className='text-xs text-stone-500'>
                                                    {campus && campus.created_at ? new Date(campus.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Last Updated</span>
                                            <div className='flex flex-col items-end'>
                                                <span>{campus && campus.updated_at ? new Date(campus.updated_at).toLocaleDateString() : '-'}</span>
                                                <span className='text-xs text-stone-500'>
                                                    {campus && campus.updated_at ? new Date(campus.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                                </span>
                                            </div>
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

export default CampusShow