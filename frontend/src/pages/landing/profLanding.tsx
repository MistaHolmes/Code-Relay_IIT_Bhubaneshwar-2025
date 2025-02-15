import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function ProfLanding() {
    const navigate = useNavigate();
    const [selectedFaculty, setSelectedFaculty] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [activeSessions, setActiveSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [attendanceData, setAttendanceData] = useState<{
        total: number;
        attendees: Array<{ studentId: string; username: string; timestamp: string }>;
    } | null>(null);
    const [selectedSession, setSelectedSession] = useState<{
        sessionId: string;
        subject: string;
    } | null>(null);
    
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/teacherlogin");
            return;
        }

        const fetchActiveSessions = async () => {
            try {
                const response = await fetch("http://localhost:3000/teacherActiveSessions", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
        
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.msg || "Server response error");
                }
        
                setActiveSessions(data);
            } catch (error) {
                console.error("Fetch Error:", error);
                setError(error instanceof Error ? error.message : "Connection error");
            } finally {
                setLoading(false);
            }
        };

        fetchActiveSessions();
        const interval = setInterval(fetchActiveSessions, 10000);
        return () => clearInterval(interval);
    }, [navigate, token]);

    const startAttendanceSession = async () => {
        if (!selectedFaculty || !selectedSubject) {
            alert("Please select both faculty and subject");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/startAttendance", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    subject: selectedSubject,
                    faculty: selectedFaculty
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || "Failed to start session");
            }

            alert("Attendance session started!");
        } catch (error) {
            console.error("Error starting session:", error);
            alert(error instanceof Error ? error.message : "Failed to start session");
        }
    };

    const stopAttendanceSession = async (sessionId: string) => {
        try {
            const response = await fetch(`http://localhost:3000/stopAttendance/${sessionId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Failed to stop session");
            setActiveSessions(prev => prev.filter(s => s._id !== sessionId));
            alert("Session stopped successfully!");
        } catch (error) {
            console.error("Error stopping session:", error);
            alert(error instanceof Error ? error.message : "Failed to stop session");
        }
    };

    const viewAttendance = async (sessionId: string) => {
        try {
            const response = await fetch(`http://localhost:3000/attendance/${sessionId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || "Failed to fetch attendance");
            
            setAttendanceData(data);
            setSelectedSession(activeSessions.find(s => s._id === sessionId) || null);
        } catch (error) {
            console.error("Error:", error);
            alert(error instanceof Error ? error.message : "Failed to load attendance");
        }
    };

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
            <h1 className="m-4 text-4xl font-normal text-center mb-8 bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
                Professor Dashboard
            </h1>

            {/* Session Creation Section */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center items-center">
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
                    <select 
                        value={selectedFaculty}
                        onChange={(e) => setSelectedFaculty(e.target.value)}
                        className="bg-gray-800 text-white px-4 py-3 rounded-full focus:ring-2 focus:ring-purple-500 flex-1"
                    >
                        <option value="">Select Faculty</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Electrical">Electrical Engineering</option>
                        <option value="Mechanical">Mechanical Engineering</option>
                    </select>

                    <select 
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="bg-gray-800 text-white px-4 py-3 rounded-full focus:ring-2 focus:ring-purple-500 flex-1"
                    >
                        <option value="">Select Subject</option>
                        <option value="OS">Operating Systems</option>
                        <option value="DAA">DAA</option>
                        <option value="DCCN">Data Communication</option>
                    </select>
                </div>

                <button
                    onClick={startAttendanceSession}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white rounded-full transition-all duration-200"
                >
                    Start Session
                </button>
            </div>

            {/* Active Sessions Section */}
            <h2 className="text-2xl font-normal text-center mb-6 bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
                Active Attendance Sessions
            </h2>

            {loading ? (
                <p className="text-center text-gray-400">Loading sessions...</p>
            ) : activeSessions.length === 0 ? (
                <p className="text-center text-gray-400">No active sessions found</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeSessions.map((session) => (
                        <div key={session._id} className="bg-gray-900 p-6 rounded-xl hover:bg-gray-800 transition-all duration-200">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-semibold">{session.subject}</h3>
                                <span className="text-sm text-gray-400">
                                    {new Date(session.createdAt).toLocaleTimeString()}
                                </span>
                            </div>
                            
                            <div className="flex justify-between items-center mb-4">
                                <span className="bg-gray-700 px-3 py-1 rounded-full text-sm">
                                    {session.faculty}
                                </span>
                                <span className="text-sm text-purple-400">
                                    {session.active ? "Active" : "Inactive"}
                                </span>
                            </div>

                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => viewAttendance(session._id)}
                                    className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
                                >
                                    View Attendance
                                </button>
                                <button
                                    onClick={() => stopAttendanceSession(session._id)}
                                    className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                                >
                                    End Session
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Attendance Modal */}
            {attendanceData && selectedSession && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-gray-900 p-6 rounded-xl max-w-2xl w-full">
                        <h3 className="text-xl font-semibold mb-4">
                            {selectedSession.subject} Attendance
                            <span className="text-purple-400 ml-2">({attendanceData.total} students)</span>
                        </h3>
                        
                        <div className="max-h-96 overflow-y-auto mb-4">
                            {attendanceData.attendees.map((student) => (
                                <div key={student.studentId} className="bg-gray-800 p-4 rounded-lg mb-2">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{student.username}</p>
                                            <p className="text-sm text-gray-400">{student.studentId}</p>
                                        </div>
                                        <span className="text-sm text-gray-300">
                                            {new Date(student.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => {
                                setAttendanceData(null);
                                setSelectedSession(null);
                            }}
                            className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}