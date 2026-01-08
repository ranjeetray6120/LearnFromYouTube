import { useState, useEffect } from 'react';
import { BASE_API } from '../config';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AnimatedBackground from '../components/AnimatedBackground';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

const loginUser = async (credentials) => {
    const response = await fetch(`${BASE_API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
    if (!response.ok) {
        throw new Error('Login failed');
    }
    return response.json();
};

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Handle OAuth2 Redirect
    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            // We need to fetch user details or just decode token.
            // For now, let's just save token and assume we are logged in.
            // Ideally, we call a "me" endpoint.
            login({ token, name: 'Google User', email: 'google@example.com' }); // Simplified
            navigate('/');
        }
    }, [searchParams, login, navigate]);

    const mutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            login(data);
            navigate('/');
        },
        onError: (error) => {
            alert(error.message);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate({ email, password });
    };

    return (
        <>
            <AnimatedBackground />
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="glass-panel"
                    style={{ width: '100%', maxWidth: '400px', padding: '40px' }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔐</div>
                        <h2 style={{ margin: 0, fontSize: '24px' }}>Welcome Back</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Login to continue your learning journey</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="glass-input"
                                    style={{ width: '100%', paddingLeft: '40px', boxSizing: 'border-box' }}
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>
                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="glass-input"
                                    style={{ width: '100%', paddingLeft: '40px', boxSizing: 'border-box' }}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={mutation.isPending} className="glass-btn glass-btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', padding: '12px' }}>
                            {mutation.isPending ? 'Logging in...' : (
                                <>In <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <div style={{ marginTop: '30px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>OR</span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
                        </div>

                        <a href={`${BASE_API}/oauth2/authorization/google`} style={{ textDecoration: 'none' }}>
                            <button className="glass-btn" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', background: 'white', color: '#333' }}>
                                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" fillRule="evenodd"></path>
                                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.715H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" fillRule="evenodd"></path>
                                    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.448 2.812 1.207 3.964l2.757-2.254z" fill="#FBBC05" fillRule="evenodd"></path>
                                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.716 7.145C4.423 5.013 6.408 3.58 9 3.58z" fill="#EA4335" fillRule="evenodd"></path>
                                </svg>
                                Continue with Google
                            </button>
                        </a>

                        <p style={{ marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
                            Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Register</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </>
    );
}
