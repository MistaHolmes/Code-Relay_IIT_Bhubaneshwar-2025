// attendance.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export function Attendance() {
    const navigate = useNavigate();
    const [activeSessions, setActiveSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [checkingLocation, setCheckingLocation] = useState(false); // New state
    const [locationError, setLocationError] = useState<string | null>(null); // New state
    const token = localStorage.getItem("token");
    const studentId = localStorage.getItem("studentId");

    useEffect(() => {
        if (!token) {
            navigate("/studentlogin");
            return;
        }

        const fetchActiveSessions = async () => {
            try {
                setError(null);
                const response = await fetch("http://localhost:3000/activeSessions", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (!response.ok) {
                    if (response.status === 401) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('studentId');
                        navigate('/studentlogin');
                        return;
                    }
                    throw new Error(data.msg || "Failed to fetch sessions");
                }

                
                if (!response.ok) {
                    throw new Error(data.msg || "Failed to fetch sessions");
                }
        
                setActiveSessions(data);
            } catch (error) {
                console.error("Fetch Error:", error);
                setError(error instanceof Error ? error.message : "Connection failed");
            } finally {
                setLoading(false);
            }
        };

        fetchActiveSessions();
        const interval = setInterval(fetchActiveSessions, 10000); // Refresh every 10 seconds
        return () => clearInterval(interval);
    }, [navigate, token]);

    const handleMarkAttendance = async (sessionId: string) => {
        if (!token || !studentId) return;

        setCheckingLocation(true);
        setLocationError(null);

        try {
            // Get student's location
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    timeout: 5000,
                });
            });

            // Hardcoded allowed coordinates (from server.js)
            const allowedCoords = {
                latitude: 20.1493,
                longitude: 85.6704,
            };
            
            // Calculate distance
            const distance = getDistance(
                position.coords.latitude,
                position.coords.longitude,
                allowedCoords.latitude,
                allowedCoords.longitude
            );

            // Check if within 100 meters radius
            // if (distance > 1000) {
            //     setLocationError("You must be within campus premises to mark attendance.");
            //     return;
            // }

            // Proceed to mark attendance
            const response = await fetch("http://localhost:3000/markAttendance", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ sessionId, studentId })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || "Failed to mark attendance");
            }

            alert("Attendance marked successfully!");
            setActiveSessions(prev => prev.filter(s => s._id !== sessionId));
        } catch (error) {
            console.error("Error marking attendance:", error);
            if (error instanceof GeolocationPositionError) {
                setLocationError("Location access denied or timed out. Enable permissions.");
            } else {
                alert(error instanceof Error ? error.message : "Failed to mark attendance");
            }
        } finally {
            setCheckingLocation(false);
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
                Active Attendance Sessions
            </h1>

            {loading ? (
                <p className="text-center text-gray-400">Loading sessions...</p>
            ) : activeSessions.length === 0 ? (
                <p className="text-center text-gray-400">No active attendance sessions</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeSessions.map((session) => (
                        <div key={session._id} className="bg-gray-900 p-6 rounded-xl hover:bg-gray-800 transition-all duration-200">
                            <h3 className="text-xl font-semibold mb-3">{session.subject}</h3>
                            <div className="flex justify-between text-sm text-gray-400 mb-4">
                                <span className="bg-gray-700 px-3 py-1 rounded-full">
                                    {session.faculty}
                                </span>
                                <span>
                                    {new Date(session.createdAt).toLocaleTimeString()}
                                </span>
                            </div>


                            {checkingLocation && (
                <p className="text-center text-gray-400 mb-4 animate-pulse">
                    Checking your location...
                </p>
            )}
            {locationError && (
                <p className="text-center text-red-500 mb-4">{locationError}</p>
            )}


                            <button
                                onClick={() => handleMarkAttendance(session._id)}
                                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white rounded-full transition-all duration-200"
                            >
                                Mark Attendance
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}