import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, List, AlignLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const Typewriter = ({ text, delay = 15 }) => {
    const [currentText, setCurrentText] = useState('');

    useEffect(() => {
        if (!text) return;
        let i = 0;
        const timer = setInterval(() => {
            setCurrentText(text.slice(0, i + 1));
            i++;
            if (i >= text.length) clearInterval(timer);
        }, delay);
        return () => clearInterval(timer);
    }, [text, delay]);

    return <span>{currentText}</span>;
};

export default function SummaryDisplay({ data }) {
    const [activeTab, setActiveTab] = useState('summary');

    if (!data) return null;

    const { summary, topics, notes } = data;

    // Helper to safely parse and render notes
    const renderNotes = (notesData) => {
        let parsedNotes = notesData;

        // Try to parse if it's a JSON string
        // But if it looks like Markdown (starts with # or contains headers), skip parsing or handle carefully
        if (typeof notesData === 'string') {
            const trimmed = notesData.trim();
            // Heuristic: If it starts with '###' or has typical markdown tables, don't treat as JSON
            const seemsLikeMarkdown = trimmed.startsWith('#') || trimmed.includes('| --- |');

            if (!seemsLikeMarkdown) {
                try {
                    // Check if it looks like a JSON array or object
                    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
                        parsedNotes = JSON.parse(notesData);
                    }
                } catch (e) {
                    // If parsing fails, just treat as string/markdown
                    parsedNotes = notesData;
                }
            }
        }

        // Case 1: Array (List of strings)
        if (Array.isArray(parsedNotes)) {
            return (
                <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                    {parsedNotes.map((note, index) => (
                        <li key={index} style={{ marginBottom: '10px' }}>{note}</li>
                    ))}
                </ul>
            );
        }

        // Case 2: Object (Sections -> Content)
        if (typeof parsedNotes === 'object' && parsedNotes !== null) {
            return Object.entries(parsedNotes).map(([sectionTitle, points], i) => (
                <div key={i} style={{ marginBottom: '20px' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '10px', marginTop: '0' }}>{sectionTitle}</h4>
                    {Array.isArray(points) ? (
                        <ul style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                            {points.map((point, j) => (
                                <li key={j} style={{ marginBottom: '8px', color: '#e2e8f0' }}>{point}</li>
                            ))}
                        </ul>
                    ) : (
                        <div style={{ color: '#e2e8f0' }}>
                            {/* Recursive or simple string render */}
                            {typeof points === 'string' ? <ReactMarkdown>{points}</ReactMarkdown> : String(points)}
                        </div>
                    )}
                </div>
            ));
        }

        // Case 3: String (Markdown)
        return (
            <div className="markdown-content" style={{ color: '#e2e8f0', lineHeight: '1.6' }}>
                <ReactMarkdown
                    components={{
                        h1: ({ node, ...props }) => <h2 style={{ color: '#6ee7b7', marginTop: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }} {...props} />,
                        h2: ({ node, ...props }) => <h3 style={{ color: '#6ee7b7', marginTop: '25px', marginBottom: '15px' }} {...props} />,
                        h3: ({ node, ...props }) => <h4 style={{ color: 'var(--primary)', marginTop: '20px', marginBottom: '10px', fontSize: '1.1em' }} {...props} />,
                        ul: ({ node, ...props }) => <ul style={{ paddingLeft: '20px', marginBottom: '15px' }} {...props} />,
                        li: ({ node, ...props }) => <li style={{ marginBottom: '8px' }} {...props} />,
                        p: ({ node, ...props }) => <p style={{ marginBottom: '15px', lineHeight: '1.7' }} {...props} />,
                        table: ({ node, ...props }) => (
                            <div style={{ overflowX: 'auto', marginBottom: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95em' }} {...props} />
                            </div>
                        ),
                        thead: ({ node, ...props }) => <thead style={{ background: 'rgba(255,255,255,0.05)' }} {...props} />,
                        th: ({ node, ...props }) => <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--primary)' }} {...props} />,
                        td: ({ node, ...props }) => <td style={{ padding: '12px 15px', borderBottom: '1px solid rgba(255,255,255,0.05)' }} {...props} />,
                        blockquote: ({ node, ...props }) => <blockquote style={{ borderLeft: '4px solid var(--primary)', paddingLeft: '15px', fontStyle: 'italic', background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '0 4px 4px 0', margin: '20px 0' }} {...props} />,
                        code: ({ node, inline, ...props }) => inline
                            ? <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.9em', color: '#ff79c6' }} {...props} />
                            : <block style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '8px', display: 'block', overflowX: 'auto', fontFamily: 'monospace', margin: '15px 0', fontSize: '0.9em', border: '1px solid rgba(255,255,255,0.05)' }} {...props} />
                    }}
                >
                    {parsedNotes}
                </ReactMarkdown>
            </div>
        );
    };

    const tabs = [
        { id: 'summary', label: 'Summary', icon: <AlignLeft size={18} /> },
        { id: 'topics', label: 'Key Topics', icon: <List size={18} /> },
        { id: 'notes', label: 'Detailed Notes', icon: <FileText size={18} /> },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel"
            style={{ marginTop: '30px', padding: '0', overflow: 'hidden' }}
        >
            {/* Tabs Header */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            flex: 1,
                            padding: '15px',
                            background: activeTab === tab.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                            border: 'none',
                            color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.3s ease',
                            borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent'
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div style={{ padding: '30px', minHeight: '300px', textAlign: 'left' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'summary' && (
                            <div>
                                <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#fff' }}>Quick Summary</h3>
                                <p style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#e2e8f0' }}>
                                    <Typewriter text={summary} delay={10} />
                                </p>
                            </div>
                        )}

                        {activeTab === 'topics' && (
                            <div>
                                <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#fff' }}>Topics Covered</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    {Array.isArray(topics) ? topics.map((topic, i) => {
                                        let topicText = topic;
                                        if (typeof topic === 'object' && topic !== null) {
                                            topicText = topic.topic || topic.content || JSON.stringify(topic);
                                        }
                                        return (
                                            <span key={i} className="glass-panel" style={{ padding: '8px 16px', fontSize: '0.9rem', borderRadius: '20px', background: 'rgba(255,255,255,0.05)' }}>
                                                # {topicText}
                                            </span>
                                        );
                                    }) : <p>{JSON.stringify(topics)}</p>}
                                </div>
                            </div>
                        )}

                        {activeTab === 'notes' && (
                            <div className="notes-container">
                                {renderNotes(notes)}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
