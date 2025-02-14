
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";

export interface Complaint {
    _id: string;
    title: string;
    description: string;
    faculty: string;
    upvotes: number;
    createdAt: string;
    studentId: string;
    upvotedBy: string[];
}

export function StudentLanding() {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showMostUpvoted, setShowMostUpvoted] = useState(false);
    const [showUserComplaints, setShowUserComplaints] = useState(false);
    const studentId = localStorage.getItem("studentId");
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/studentlogin");
            return;
        }

        const fetchComplaints = async () => {
            try {
                setError(null);
                const response = await fetch("http://localhost:3000/allComplaints");
                if (!response.ok) {
                    throw new Error("Failed to fetch complaints");
                }
                const data = await response.json();
                setComplaints(data);
            } catch (error) {
                console.error("Error fetching complaints:", error);
                setError("Failed to load complaints. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchComplaints();
    }, [navigate, token]);

    const handleUpvote = async (complaintId: string) => {
        if (!token) {
            alert("Please log in to upvote");
            navigate("/studentlogin");
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:3000/upvoteComplaint/${complaintId}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}` // Correct header
                    },
                    body: JSON.stringify({}) // Remove studentId from body
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || "Failed to upvote");
            }

            const data = await response.json();
            setComplaints(prev => 
                prev.map(c => c._id === data.complaint._id ? data.complaint : c)
            );
        } catch (error) {
            console.error("Error upvoting:", error);
            alert(error instanceof Error ? error.message : "Failed to upvote complaint");
        }
    };

    const filteredComplaints = complaints
    .filter(c => {
      if (showUserComplaints) return c.studentId === studentId;
      if (showMostUpvoted) return c.upvotes >= 1; 
      return true;
    })
    .sort((a, b) => 
      showMostUpvoted 
        ? b.upvotes - a.upvotes 
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (error) {
        return (
            <div className="p-6 text-center text-white">
                <p className="text-red-500">{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-purple-500 rounded-full hover:bg-purple-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto text-white bg-black min-h-screen min-w-screen">
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
                <button
                    onClick={() => navigate("/createComplaint")}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white rounded-full transition-all duration-200"
                >
                    Register New Complaint
                </button>
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => setShowMostUpvoted(!showMostUpvoted)}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white rounded-full transition-all duration-200"
                    >
                        {showMostUpvoted ? "Show All" : "Top Complaints"}
                    </button>

                    <button
                        onClick={() => setShowUserComplaints(!showUserComplaints)}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white rounded-full transition-all duration-200"
                    >
                        {showUserComplaints ? "Show All" : "My Complaints"}
                    </button>

                </div>
            </div>


            <div>
              
              <div>
              <button 
              onClick={() => navigate("/studentAtendance")}
              className="m-2 px-6 py-3 min-w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white rounded-full transition-all duration-200">
              Mark Attendance
              </button>
              </div>
              <div>
              <button 
              onClick={() => navigate("#")}
              className=" m-2 px-6 py-3 min-w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white rounded-full transition-all duration-200">
                Polls / Quizzes
              </button>
              </div>

            </div>

            <br></br>
            
            <h1 className="m-4 text-4xl font-normal text-center mb-8 bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
                Trending Complaints 
            </h1>
            
            {loading ? (
                <p className="text-center text-gray-400">...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredComplaints.map((complaint) => (
                        <div key={complaint._id} className="bg-gray-900 p-6 rounded-xl hover:bg-gray-800 transition-all duration-200">
                            <h3 className="text-xl font-semibold mb-3">{complaint.title}</h3>
                            <p className="text-gray-300 mb-4">{complaint.description}</p>
                            
                            <div className="flex justify-between text-sm text-gray-400 mb-4">
                                <span className="bg-gray-700 px-3 py-1 rounded-full">
                                    {complaint.faculty}
                                </span>
                                <span>
                                    {new Date(complaint.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <button 
                                    onClick={() => handleUpvote(complaint._id)}
                                    className="group flex items-center gap-2 hover:text-purple-400 transition-colors"
                                    disabled={complaint.upvotedBy.includes(studentId || '')}
                                >
                                    {complaint.upvotedBy.includes(studentId || '') ? (
                                        <FaHeart className="text-purple-500 text-lg" />
                                    ) : (
                                        <FaRegHeart className="text-purple-400 text-lg group-hover:text-purple-300" />
                                    )}
                                    <span>{complaint.upvotes}</span>
                                </button>
                                <span className="text-sm text-gray-400">
                                    ID: {complaint.studentId.slice(0, 6)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}