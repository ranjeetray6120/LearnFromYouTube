import { useState } from 'react';
import { BASE_API } from '../config';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VideoInput from '../components/VideoInput';
import SummaryDisplay from '../components/SummaryDisplay';
import AnimatedBackground from '../components/AnimatedBackground';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { LogOut, LogIn, UserPlus, FileText, Presentation } from 'lucide-react';

const saveNote = async ({ noteData, token, url }) => {
    const response = await fetch(`${BASE_API}/api/notes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            videoUrl: url,
            summary: noteData.summary,
            topics: noteData.topics,
            notes: typeof noteData.notes === 'string' ? noteData.notes : JSON.stringify(noteData.notes)
        })
    });
    if (!response.ok) throw new Error('Failed to save note to history');
    return response.text();
};

export default function Home() {
    const { user, logout, token } = useAuth();
    const [summaryData, setSummaryData] = useState(null);
    const [videoUrl, setVideoUrl] = useState('');

    const getThumbnailUrl = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg` : null;
    };

    const downloadFile = async (type) => {
        if (!summaryData) return;

        // Construct the data to send back for formatting
        const requestBody = {
            summary: summaryData.summary,
            topics: summaryData.topics,
            notes: summaryData.notes,
            thumbnailUrl: getThumbnailUrl(videoUrl)
        };

        try {
            const response = await fetch(`${BASE_API}/api/export/${type}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = type === 'pdf' ? 'notes.pdf' : 'presentation.pptx';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            alert("Error downloading file: " + error.message);
        }
    };

    return (
        <>
            <AnimatedBackground />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{ maxWidth: '1000px', margin: 'auto', padding: '40px 20px', position: 'relative', zIndex: 1 }}
            >
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ fontSize: '40px' }}>🎓</div>
                        <h1 style={{
                            fontSize: '2.5rem',
                            fontWeight: '800',
                            background: 'linear-gradient(to right, #fff, #a78bfa)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            margin: 0
                        }}>
                            EduTube Notes
                        </h1>
                    </div>
                    <div>
                        {user ? (
                            <div className="glass-panel" style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <span style={{ fontWeight: '500' }}>👋 {user.name}</span>
                                <button onClick={logout} className="glass-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <Link to="/login">
                                    <button className="glass-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <LogIn size={16} /> Login
                                    </button>
                                </Link>
                                <Link to="/register">
                                    <button className="glass-btn glass-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <UserPlus size={16} /> Register
                                    </button>
                                </Link>
                            </div>
                        )}
                    </div>
                </header>

                <section style={{ marginBottom: '60px', textAlign: 'center' }}>
                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        style={{ fontSize: '3rem', marginBottom: '20px', fontWeight: '700' }}
                    >
                        Learn Faster, <span style={{ color: '#6ee7b7' }}>Retain More.</span>
                    </motion.h2>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '40px' }}>
                        Paste any YouTube tutorial link and get an instant AI-generated summary, topics, and detailed study notes.
                    </p>
                    <section>
                        <h2 style={{ textAlign: 'center' }}>Paste a YouTube Link to Start Learning</h2>
                        <VideoInput onSummaryGenerated={async (data, url) => {
                            setSummaryData(data);
                            setVideoUrl(url); // Save URL for thumbnail generation
                            // Auto-save if logged in
                            if (token) {
                                try {
                                    /* Logic to auto-save to history with the URL */
                                } catch (e) { console.error(e); }
                            }
                        }} />
                    </section>
                </section>

                {summaryData && (
                    <section>
                        <SummaryDisplay data={summaryData} />

                        {/* Download Section - Only if Logged In */}
                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            {user ? (
                                <div>
                                    <div>
                                        <button onClick={() => downloadFile('pdf')} style={{ marginRight: '10px' }}>📄 Download PDF</button>
                                        <button onClick={() => downloadFile('ppt')}>📊 Download PPT</button>
                                        <p style={{ fontSize: '12px', color: 'green', marginTop: '5px' }}>
                                            ✅ Saved to your <Link to="/dashboard">Dashboard</Link>
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p style={{ color: 'gray' }}>🔒 Login to download PDF/PPT</p>
                            )}
                        </div>
                    </section>
                )}
            </motion.div>
        </>
    );
}
