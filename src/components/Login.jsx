import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const { signIn, user } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = React.useState('');

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleLogin = async () => {
        setError('');
        try {
            await signIn();
        } catch (error) {
            console.error(error);
            // Show the actual error message or code to the user
            setError(error.message || "Failed to sign in");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-background-dark)] text-white p-4">
            <div className="bg-[#18181b] p-8 rounded-2xl border border-white/10 shadow-2xl w-full max-w-md text-center">
                <div className="flex justify-center mb-6">
                    <div className="text-4xl">📚</div>
                </div>
                <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
                <p className="text-gray-400 mb-8">Sign in to access your Kanban board</p>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-left">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleLogin}
                    className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                >
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                    Sign in with Google
                </button>
            </div>
        </div>
    );
};

export default Login;
