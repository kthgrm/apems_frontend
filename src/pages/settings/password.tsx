import InputError from '@/components/input-error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AppLayout from '@/layout/app-layout'
import SettingsLayout from '@/layout/settings-layout'
import api from '@/lib/axios'
import React, { useRef, useState } from 'react'
import toast from 'react-hot-toast'

const breadcrumbs = [
    { title: 'Password settings', href: '/settings/password' },
]

const Password = () => {
    const passwordInput = useRef<HTMLInputElement>(null);
    const [errors, setErrors] = useState<any>({});
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const [processing, setProcessing] = useState(false);

    const [data, setData] = useState<{
        current_password: string;
        password: string;
        password_confirmation: string;
    }>({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const token = localStorage.getItem('token');

            await api.put('/auth/password', data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            toast.success('Password updated successfully');

            // Reset form
            setData({
                current_password: '',
                password: '',
                password_confirmation: '',
            });

            // Focus on current password input
            if (currentPasswordInput.current) {
                currentPasswordInput.current.focus();
            }
        } catch (err: any) {
            const validationErrors = err.response?.data?.errors || {};
            setErrors(validationErrors);

            toast.error(err.response?.data?.message || 'Failed to update password');

            // Focus on the field with error
            if (validationErrors.current_password && currentPasswordInput.current) {
                currentPasswordInput.current.focus();
            } else if (validationErrors.password && passwordInput.current) {
                passwordInput.current.focus();
            }
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
                            <Label htmlFor="current_password">Current password</Label>

                            <Input
                                id="current_password"
                                ref={currentPasswordInput}
                                value={data.current_password}
                                onChange={handleChange}
                                type="password"
                                className="mt-1 block w-full"
                                autoComplete="current-password"
                                placeholder="Current password"
                            />

                            <InputError message={errors.current_password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">New password</Label>

                            <Input
                                id="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={handleChange}
                                type="password"
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                placeholder="New password"
                            />

                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Confirm password</Label>

                            <Input
                                id="password_confirmation"
                                value={data.password_confirmation}
                                onChange={handleChange}
                                type="password"
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                placeholder="Confirm password"
                            />

                            <InputError message={errors.password_confirmation} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing} className='bg-blue-500 hover:bg-blue-600'>Save password</Button>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    )
}

export default Password