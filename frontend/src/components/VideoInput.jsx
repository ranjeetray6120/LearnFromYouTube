import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

const generateSummary = async (url) => {
    const response = await fetch('https://api.ranjeetdev.online/api/youtube/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Generation failed');
    }
    return response.json();
};

export default function VideoInput({ onSummaryGenerated }) {
    const [url, setUrl] = useState('');

    const mutation = useMutation({
        mutationFn: generateSummary,
        onSuccess: (data) => {
            onSummaryGenerated(data, url);
        },
        onError: (error) => {
            alert(error.message);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!url) return;
        mutation.mutate(url);
    };

    return (
        <div style={{ margin: '20px 0', textAlign: 'center' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste YouTube Link Here..."
                    style={{ width: '60%', padding: '10px', fontSize: '16px' }}
                />
                <button type="submit" disabled={mutation.isPending} style={{ padding: '10px 20px' }}>
                    {mutation.isPending ? 'Generating...' : 'Generate Notes'}
                </button>
            </form>
        </div>
    );
}
