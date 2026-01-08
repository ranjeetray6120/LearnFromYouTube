import { useState, useEffect } from 'react';
import { BASE_API } from '../config';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import SummaryDisplay from '../components/SummaryDisplay';
import { Link } from 'react-router-dom';

const fetchNotes = async (token) => {
    const response = await fetch(`${BASE_API}/api/notes`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch notes');
    return response.json();
};

export default function Dashboard() {
    const { token, user } = useAuth();
    const [selectedNote, setSelectedNote] = useState(null);

    const { data: notes, isLoading, error } = useQuery({
        queryKey: ['notes'],
        queryFn: () => fetchNotes(token),
        enabled: !!token
    });

    if (isLoading) return <p>Loading history...</p>;
    if (error) return <p>Error loading notes: {error.message}</p>;

    return (
        <div style={{ maxWidth: '1000px', margin: 'auto', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>📚 My Study History</h2>
                <Link to="/"><button>Create New</button></Link>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                {/* LIST */}
                <div style={{ width: '30%', borderRight: '1px solid #ccc', paddingRight: '10px' }}>
                    {notes && notes.length === 0 ? <p>No notes found.</p> : null}
                    {notes && notes.map(note => (
                        <div
                            key={note.id}
                            onClick={() => setSelectedNote(note)}
                            style={{
                                padding: '10px',
                                borderBottom: '1px solid #eee',
                                cursor: 'pointer',
                                background: selectedNote?.id === note.id ? '#f0f0f0' : 'white'
                            }}
                        >
                            <p style={{ fontWeight: 'bold', margin: '0 0 5px 0' }}>Video ID: {note.videoUrl}</p>
                            <small style={{ color: 'gray' }}>{new Date(note.createdAt).toLocaleDateString()}</small>
                        </div>
                    ))}
                </div>

                {/* DETAIL */}
                <div style={{ width: '70%' }}>
                    {selectedNote ? (
                        <div>
                            <h3>Stored Note</h3>
                            <SummaryDisplay data={selectedNote} />
                        </div>
                    ) : (
                        <p>Select a note from the list to view details.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
