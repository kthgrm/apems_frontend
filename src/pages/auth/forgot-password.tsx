import { useState } from 'react';
import type { FormEventHandler } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/lib/axios';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layout/auth-layout';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<{ email?: string }>({});
    const [status, setStatus] = useState('');

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});
        setStatus('');

        try {
            const response = await api.post('/forgot-password', { email });

            if (response.data.success) {
                setStatus(response.data.message || 'Password reset link has been sent to your email!');
                setEmail('');
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
        <AuthLayout title="Forgot password">
            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}

            <div className="space-y-6">
                <form onSubmit={submit}>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="off"
                            value={email}
                            autoFocus
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@example.com"
                        />

                        <InputError message={errors.email} />
                    </div>

                    <div className="my-6 flex items-center justify-start">
                        <Button className="w-full bg-red-800 hover:bg-red-900" disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Email password reset link
                        </Button>
                    </div>
                </form>

                <div className="space-x-1 text-center text-sm text-muted-foreground">
                    <span>Or, return to</span>
                    <Link to="/login" className='text-red-800 hover:text-red-900 underline'>log in</Link>
                </div>
            </div>
        </AuthLayout>
    );
}
