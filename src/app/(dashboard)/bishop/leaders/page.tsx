'use client';
import { useState, useEffect } from 'react';

interface Leader {
    _id: string;
    name: string;
    email: string;
    password?: string;
    group?: {
        name: string;
    };
}

export default function LeaderManagement() {
    const [leaders, setLeaders] = useState<Leader[]>([]);
    const [form, setForm] = useState({ name: '', email: '', password: '', groupName: '' });

    const fetchLeaders = async () => {
        const res = await fetch('/api/bishop/leaders');
        const data = await res.json();
        setLeaders(data.leaders);
    };

    const createLeader = async () => {
        if (!form.name || !form.email || !form.password || !form.groupName) return alert('Fill all fields');
        const res = await fetch('/api/bishop/leaders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });
        if (res.ok) {
            setForm({ name: '', email: '', password: '', groupName: '' });
            await fetchLeaders();
        }
    };

    useEffect(() => {
        fetchLeaders()
            .then()
            .catch(err => console.error('Error fetching leaders:', err));
    }, []);

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold text-white">Create Leader & Login</h1>

            <div className="bg-blue-950 p-4 rounded-xl space-y-2">
                <input
                    placeholder="Leader Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input"
                />
                <input
                    placeholder="Email (for login)"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input"
                />
                <input
                    type="password"
                    placeholder="Password (for login)"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input"
                />
                <input
                    placeholder="Group Name"
                    value={form.groupName}
                    onChange={(e) => setForm({ ...form, groupName: e.target.value })}
                    className="input"
                />

                <button onClick={createLeader} className="btn">
                    Create Leader & Group
                </button>
            </div>

            <ul className="space-y-2">
                {leaders.map((leader: Leader) => (
                    <li key={leader._id} className="bg-blue p-3 rounded shadow flex justify-between items-center">
                        <span>{leader.name} ({leader.email}) - Group: {leader.group?.name}</span>
                        <button
                            onClick={async () => {
                                await fetch(`/api/bishop/leaders/${leader._id}`, { method: 'DELETE' });
                                await fetchLeaders();
                            }}
                            className="text-red-600"
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}