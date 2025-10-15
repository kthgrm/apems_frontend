import { useState, useEffect } from 'react';
import type { FormEventHandler } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import api from '@/lib/axios';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layout/auth-layout';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
        password_confirmation?: string
    }>({});
    const [status, setStatus] = useState('');

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        const emailParam = searchParams.get('email');

        if (tokenParam) setToken(tokenParam);
        if (emailParam) setEmail(emailParam);
    }, [searchParams]);

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        setStatus('');

        try {
            const response = await api.post('/reset-password', {
                token,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });

            if (response.data.success) {
                setStatus(response.data.message || 'Password has been reset successfully!');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else if (error.response?.data?.message) {
                setErrors({ email: error.response.data.message });
            } else {
                setErrors({ email: 'An error occurred. Please try again.' });
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AuthLayout title="Reset password">
            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className='text-sm font-light'>Email</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={email}
                            className="block w-full"
                            readOnly
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <InputError message={errors.email} className="text-xs" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password" className='text-sm font-light'>Password</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            autoComplete="new-password"
                            value={password}
                            className="block w-full"
                            autoFocus
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                        />
                        <InputError message={errors.password} className="text-xs" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation" className='text-sm font-light'>Confirm password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            autoComplete="new-password"
                            value={passwordConfirmation}
                            className="block w-full"
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            placeholder="Confirm password"
                        />
                        <InputError message={errors.password_confirmation} className="text-xs" />
                    </div>

                    <Button type="submit" className="mt-4 w-full bg-red-800 hover:bg-red-900" disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Reset password
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
}
