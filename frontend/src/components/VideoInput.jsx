import { useState } from 'react';
import { BASE_API } from '../config';

export default function VideoInput({ onSummaryGenerated }) {
    const [url, setUrl] = useState('');
    const [language, setLanguage] = useState('en');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const generateSummary = async () => {
        if (!url) return;
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${BASE_API}/api/youtube/process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, language }),
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(errorData || 'Failed to process video');
            }

            const data = await response.json();
            if (onSummaryGenerated) {
                onSummaryGenerated(data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2>Paste YouTube Link</h2>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="https://youtube.com/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    style={{
                        padding: '10px',
                        width: '60%',
                        borderRadius: '5px',
                        border: '1px solid #ddd'
                    }}
                />
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid #ddd'
                    }}
                >
                    <option value="en">English (Default)</option>
                    <option value="hi">Hindi</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="pt">Portuguese</option>
                    <option value="ru">Russian</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                </select>
                <button
                    onClick={generateSummary}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '5px',
                        border: 'none',
                        backgroundColor: '#6C63FF',
                        color: 'white',
                        cursor: 'pointer'
                    }}
                >
                    {loading ? 'Processing...' : 'Generate'}
                </button>
            </div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}
