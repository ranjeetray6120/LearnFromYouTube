import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';

const registerUser = async (userData) => {
    const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Registration failed');
    }
    return response.text();
};

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const mutation = useMutation({
        mutationFn: registerUser,
        onSuccess: () => {
            alert('Registration successful! Please login.');
            navigate('/login');
        },
        onError: (error) => {
            alert(error.message);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate({ name, email, password });
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
                        <div style={{ fontSize: '40px', marginBottom: '10px' }}>🚀</div>
                        <h2 style={{ margin: 0, fontSize: '24px' }}>Create Account</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Join us and start learning smarter</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="glass-input"
                                    style={{ width: '100%', paddingLeft: '40px', boxSizing: 'border-box' }}
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>
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
                            {mutation.isPending ? 'Creating Account...' : (
                                <>Sign Up <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                            Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Login</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </>
    );
}
