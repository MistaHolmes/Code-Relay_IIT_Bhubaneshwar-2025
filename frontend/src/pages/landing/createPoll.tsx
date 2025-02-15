import React, { useState } from 'react';
import { FaPlus, FaPollH, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export const CreatePoll = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [error, setError] = useState('');
    const token = localStorage.getItem('token');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (title.length < 3) {
            setError('Title must be at least 3 characters long');
            return;
        }
        if (options.some(option => option.trim() === '')) {
            setError('All options must have text');
            return;
        }
        try {
            const response = await fetch('http://localhost:3000/create-poll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    options: options.filter(opt => opt.trim() !== '')
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Failed to create poll');
            }
            navigate('/profLanding');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create poll');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6 flex items-center justify-center">
            <div className="max-w-3xl w-full bg-gray-800 p-8 rounded-2xl shadow-2xl">
                <h1 className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                    Create New Poll
                </h1>
                {error && (
                    <div className="mb-4 p-4 bg-red-800/30 rounded-lg border border-red-600">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-cyan-300 text-lg mb-2">Poll Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                setError('');
                            }}
                            className="w-full bg-gray-900 rounded-xl px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500"
                            placeholder="Enter poll title..."
                        />
                    </div>
                    <div>
                        <label className="block text-cyan-300 text-lg mb-2">Description (Optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-gray-900 rounded-xl px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500"
                            placeholder="Add a description..."
                            rows={3}
                        />
                    </div>
                    <div>
                        <label className="block text-cyan-300 text-lg mb-4">Poll Options</label>
                        <div className="space-y-4">
                            {options.map((option, index) => (
                                <div key={index} className="flex gap-3 items-center">
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => {
                                            const newOptions = [...options];
                                            newOptions[index] = e.target.value;
                                            setOptions(newOptions);
                                            setError('');
                                        }}
                                        className="flex-1 bg-gray-900 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500"
                                        placeholder={`Option ${index + 1}`}
                                    />
                                    {options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => setOptions(options.filter((_, i) => i !== index))}
                                            className="p-2 text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            <FaTimes className="text-xl" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => setOptions([...options, ''])}
                            className="mt-4 px-5 py-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-all flex items-center gap-2 text-gray-300"
                        >
                            <FaPlus className="text-cyan-400" />
                            Add Option
                        </button>
                    </div>
                    <div className="mt-8">
                        <button
                            type="submit"
                            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-lg font-bold tracking-wide text-white flex items-center justify-center gap-3 hover:scale-105 transition-all"
                        >
                            <FaPollH className="text-xl" />
                            Create Poll
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
