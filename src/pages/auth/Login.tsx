import { LoginForm } from '@/components/login-form'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const Login = () => {
    const navigate = useNavigate();
    const user = useAuth().user

    if (user) {
        if (user.role === 'admin') {
            navigate('/admin/dashboard');
        } else {
            navigate('/user/dashboard');
        }
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-[#212529]">
            <div className="w-full max-w-md">
                <LoginForm />
            </div>
        </div>
    )
}

export default Login