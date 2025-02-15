import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

interface Poll {
    _id: string;
    title: string;
    description: string;
    options: { text: string; votes: number }[];
    votedBy: string[];
}

const PollList = () => {
    const navigate = useNavigate();
    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const token = localStorage.getItem("token");
    const studentId = localStorage.getItem("studentId");

    useEffect(() => {
        const fetchPolls = async () => {
            try {
                const response = await fetch("http://localhost:3000/polls");
                if (!response.ok) throw new Error("Failed to fetch polls");

                const data: Poll[] = await response.json();
                setPolls(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error fetching polls");
            } finally {
                setLoading(false);
            }
        };

        fetchPolls();
    }, []);

    const handleVote = async (pollId: string, optionIndex: number) => {
        try {

            const token = localStorage.getItem("token");
            if (!token) {
              alert("Please log in to vote");
              navigate("/studentlogin");
              return;
            }
        
            const response = await fetch(`http://localhost:3000/vote/${pollId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ optionIndex }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || "Failed to vote");
            }

            const updatedPoll = await response.json();
            setPolls(polls.map(p => (p._id === updatedPoll.poll._id ? updatedPoll.poll : p)));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to vote");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-8">
                    Active Polls
                </h1>

                {loading && <p className="text-center text-gray-400">Loading polls...</p>}
                {error && <p className="text-center text-red-400">{error}</p>}

                <div className="space-y-6">
                    {polls.map((poll) => (
                        <div key={poll._id} className="bg-gray-800 p-6 rounded-2xl shadow-xl">
                            <h2 className="text-2xl font-bold text-white mb-2">{poll.title}</h2>
                            <p className="text-gray-400 mb-4">{poll.description}</p>

                            <div className="space-y-2">
                                {poll.options.map((option, index) => (
                                    <button
                                        key={index}
                                        className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all flex justify-between px-4 text-gray-300"
                                        onClick={() => handleVote(poll._id, index)}
                                        disabled={poll.votedBy.includes(studentId || "")}
                                    >
                                        <span>{option.text}</span>
                                        <span className="text-cyan-400">{option.votes} votes</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PollList;
