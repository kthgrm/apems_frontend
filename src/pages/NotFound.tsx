import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full">
                <CardContent className="pt-12 pb-12 text-center">
                    {/* 404 Icon */}
                    <div className="mb-8">
                        <div className="text-9xl font-bold text-gray-200 mb-4">404</div>
                        <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
                    </div>

                    {/* Message */}
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">
                        Page Not Found
                    </h1>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Sorry, the page you're looking for doesn't exist or has been moved.
                        Please check the URL or navigate back to a safe location.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button
                            onClick={() => navigate(-1)}
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Go Back
                        </Button>
                        <Button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2"
                        >
                            <Home className="h-4 w-4" />
                            Go to Home
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
