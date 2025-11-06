import InputError from '@/components/input-error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import AppLayout from '@/layout/app-layout'
import SettingsLayout from '@/layout/settings-layout'
import api from '@/lib/axios'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const breadcrumbs = [
    { title: 'Profile settings', href: '/settings/profile' },
]

const Profile = () => {
    const [errors, setErrors] = useState<any>({});
    const [processing, setProcessing] = useState(false);
    const { user } = useAuth();

    const [data, setData] = useState<{
        first_name: string;
        last_name: string;
        email: string;
    }>({
        first_name: '',
        last_name: '',
        email: '',
    });

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            await api.put('/auth/profile', data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            toast.success('Profile updated successfully');

            // Update the user context with the new data
            // The user will be updated on next auth check or page reload
            window.location.reload();

        } catch (err: any) {
            const validationErrors = err.response?.data?.errors || {};
            setErrors(validationErrors);

            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <SettingsLayout>
                <div className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="first_name">First Name</Label>

                            <Input
                                id="first_name"
                                className="mt-1 block w-full"
                                value={data.first_name}
                                onChange={handleChange}
                                required
                            />

                            <InputError className="mt-2" message={errors.first_name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="last_name">Last Name</Label>

                            <Input
                                id="last_name"
                                className="mt-1 block w-full"
                                value={data.last_name}
                                onChange={handleChange}
                                required
                            />

                            <InputError className="mt-2" message={errors.last_name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={handleChange}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />

                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing} className='bg-blue-500 hover:bg-blue-600'>Save</Button>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    )
}

export default Profile;