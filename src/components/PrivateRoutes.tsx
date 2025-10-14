import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import { Spinner } from "./ui/spinner";

export const UserRoute = () => {
    const { user, isLoading } = useAuth();

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner className="size-24 text-red-800" />
            </div>
        );
    }

    // Check if user exists and has user role
    if (!user) {
        return <Navigate to="/" />;
    }

    if (user.role !== 'user') {
        return <Navigate to="/admin/dashboard" />;
    }

    return <Outlet />;
};