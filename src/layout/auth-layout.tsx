import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthLayoutProps {
    title: string;
    description?: string;
    children: ReactNode;
}

export default function AuthLayout({ title, description, children }: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#212529]">
            <div className="w-full max-w-md p-6">
                <Card className="rounded-xl px-10 py-6">
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">{title}</CardTitle>
                    </CardHeader>
                    <CardContent className="">{children}</CardContent>
                </Card>
            </div>
        </div>
    );
}
