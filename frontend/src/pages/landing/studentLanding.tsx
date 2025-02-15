
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaHeart, FaRegHeart, FaPlus, FaFire, FaUser, FaClipboardCheck, FaPollH } from "react-icons/fa";
// import ChatBot from "../components_student/Chat_bot";

// export interface Complaint {
//     _id: string;
//     title: string;
//     description: string;
//     faculty: string;
//     upvotes: number;
//     createdAt: string;
//     studentId: string;
//     upvotedBy: string[];
// }

// export function StudentLanding() {
//     const navigate = useNavigate();
//     const [complaints, setComplaints] = useState<Complaint[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [showMostUpvoted, setShowMostUpvoted] = useState(false);
//     const [showUserComplaints, setShowUserComplaints] = useState(false);
//     const studentId = localStorage.getItem("studentId");
//     const token = localStorage.getItem("token");

//     useEffect(() => {
//         if (!token) {
//             navigate("/studentlogin");
//             return;
//         }

//         const fetchComplaints = async () => {
//             try {
//                 setError(null);
//                 const response = await fetch("http://localhost:3000/allComplaints");
//                 if (!response.ok) {
//                     throw new Error("Failed to fetch complaints");
//                 }
//                 const data = await response.json();
//                 setComplaints(data);
//             } catch (error) {
//                 console.error("Error fetching complaints:", error);
//                 setError("Failed to load complaints. Please try again later.");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchComplaints();
//     }, [navigate, token]);

//     const handleUpvote = async (complaintId: string) => {
//         if (!token) {
//             alert("Please log in to upvote");
//             navigate("/studentlogin");
//             return;
//         }

//         try {
//             const response = await fetch(
//                 `http://localhost:3000/upvoteComplaint/${complaintId}`,
//                 {
//                     method: "POST",
//                     headers: {
//                         "Content-Type": "application/json",
//                         "Authorization": `Bearer ${token}`
//                     },
//                     body: JSON.stringify({})
//                 }
//             );

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.msg || "Failed to upvote");
//             }

//             const data = await response.json();
//             setComplaints(prev => 
//                 prev.map(c => c._id === data.complaint._id ? data.complaint : c)
//             );
//         } catch (error) {
//             console.error("Error upvoting:", error);
//             alert(error instanceof Error ? error.message : "Failed to upvote complaint");
//         }
//     };

//     const filteredComplaints = complaints
//     .filter(c => {
//       if (showUserComplaints) return c.studentId === studentId;
//       if (showMostUpvoted) return c.upvotes >= 1; 
//       return true;
//     })
//     .sort((a, b) => 
//       showMostUpvoted 
//         ? b.upvotes - a.upvotes 
//         : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//     );

//     if (error) {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center p-6">
//                 <p className="text-red-400 text-lg mb-4">{error}</p>
//                 <button 
//                     onClick={() => window.location.reload()}
//                     className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full hover:scale-105 transition-transform text-white font-semibold flex items-center gap-2"
//                 >
//                     Retry
//                 </button>
//             </div>
//         );
//     }

//     return (
        

        
    
//         <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
//             <ChatBot />
//             {/* newnew   */}
//             <div className="max-w-7xl mx-auto">
//                 {/* Header Section */}
//                 <div className="mb-12 text-center">
//                     <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
//                         Student Dashboard
//                     </h1>
                    
//                     <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
//                         <button
//                             onClick={() => navigate("/createComplaint")}
//                             className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full hover:scale-105 transition-transform text-white font-semibold flex items-center gap-2"
//                         >
//                             <FaPlus className="text-lg" />
//                             New Complaint
//                         </button>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
//                         <button 
//                             onClick={() => navigate("/studentAtendance")}
//                             className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all flex items-center gap-3 group"
//                         >
//                             <FaClipboardCheck className="text-2xl text-cyan-400 group-hover:text-cyan-300 transition-colors" />
//                             <span className="text-white font-medium">Mark Attendance</span>
//                         </button>
                        
//                         <button 
//                             onClick={() => navigate("#")}
//                             className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-all flex items-center gap-3 group"
//                         >
//                             <FaPollH className="text-2xl text-purple-400 group-hover:text-purple-300 transition-colors" />
//                             <span className="text-white font-medium">Polls & Quizzes</span>
//                         </button>
//                     </div>
//                 </div>

//                 {/* Filter Controls */}
//                 <div className="flex flex-wrap gap-4 justify-center mb-12">
//                     <button
//                         onClick={() => setShowMostUpvoted(!showMostUpvoted)}
//                         className={`px-6 py-2 rounded-full transition-all flex items-center gap-2 ${
//                             showMostUpvoted 
//                             ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white' 
//                             : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
//                         }`}
//                     >
//                         <FaFire />
//                         {showMostUpvoted ? "Show All" : "Top Complaints"}
//                     </button>

//                     <button
//                         onClick={() => setShowUserComplaints(!showUserComplaints)}
//                         className={`px-6 py-2 rounded-full transition-all flex items-center gap-2 ${
//                             showUserComplaints 
//                             ? 'bg-gradient-to-r from-cyan-600 to-blue-500 text-white' 
//                             : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
//                         }`}
//                     >
//                         <FaUser />
//                         {showUserComplaints ? "Show All" : "My Complaints"}
//                     </button>
//                 </div>

//                 {/* Content Section */}
//                 <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
//                     {showMostUpvoted ? "🔥 Trending Issues" : "📢 Recent Complaints"}
//                 </h2>

//                 {loading ? (
//                     <div className="flex justify-center items-center h-64">
//                         <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-500"></div>
//                     </div>
//                 ) : (
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                         {filteredComplaints.map((complaint) => (
//                             <div 
//                                 key={complaint._id} 
//                                 className="bg-gray-800 p-6 rounded-2xl hover:transform hover:-translate-y-2 transition-all duration-300 shadow-xl"
//                             >
//                                 <div className="mb-4">
//                                     <h3 className="text-xl font-bold text-white mb-2">{complaint.title}</h3>
//                                     <p className="text-gray-400 text-sm leading-relaxed">{complaint.description}</p>
//                                 </div>

//                                 <div className="flex flex-wrap gap-2 mb-4">
//                                     <span className="px-3 py-1 bg-gray-700 rounded-full text-sm text-cyan-400">
//                                         {complaint.faculty}
//                                     </span>
//                                     <span className="px-3 py-1 bg-gray-700 rounded-full text-sm text-purple-400">
//                                         {new Date(complaint.createdAt).toLocaleDateString()}
//                                     </span>
//                                 </div>

//                                 <div className="flex items-center justify-between mt-4">
//                                     <button 
//                                         onClick={() => handleUpvote(complaint._id)}
//                                         className="flex items-center gap-2 hover:text-purple-400 transition-colors"
//                                         disabled={complaint.upvotedBy.includes(studentId || '')}
//                                     >
//                                         {complaint.upvotedBy.includes(studentId || '') ? (
//                                             <FaHeart className="text-purple-500 text-xl animate-pulse" />
//                                         ) : (
//                                             <FaRegHeart className="text-xl hover:scale-125 transition-transform" />
//                                         )}
//                                         <span className="font-medium">{complaint.upvotes}</span>
//                                     </button>
//                                     <span className="text-sm text-gray-400 font-mono">
//                                         #{complaint.studentId.slice(0, 6)}
//                                     </span>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }




import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaPlus, FaFire, FaUser, FaClipboardCheck, FaPollH } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import ChatBot from "../components_student/Chat_bot";


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
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({})
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
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center p-6">
                <p className="text-red-400 text-lg mb-4">{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full hover:scale-105 transition-transform text-white font-semibold flex items-center gap-2"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 p-6">
            <ChatBot />
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-12 text-center"
                >
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">
                        Student Portal
                    </h1>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate("/createComplaint")}
                            className="px-6 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all text-white font-medium flex items-center gap-2 border border-gray-700"
                        >
                            <FaPlus className="text-lg" />
                            New Issue
                        </motion.button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {['Attendance', 'Polls'].map((item, idx) => (
                            <motion.button
                                key={item}
                                initial={{ opacity: 0, x: idx % 2 ? 20 : -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl transition-all flex items-center gap-3 backdrop-blur-sm border border-gray-700"
                                onClick={() => navigate(item === 'Attendance' ? "/studentAtendance" : "/PollList")}
                            >
                                {item === 'Attendance' ? (
                                    <FaClipboardCheck className="text-xl text-cyan-400" />
                                ) : (
                                    <FaPollH className="text-xl text-purple-400" />
                                )}
                                <span className="text-gray-300 font-medium">{item}</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Filter Controls */}
                <motion.div 
                    className="flex flex-wrap gap-3 justify-center mb-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {[
                        { icon: <FaFire />, state: showMostUpvoted, action: setShowMostUpvoted, label: 'Top' },
                        { icon: <FaUser />, state: showUserComplaints, action: setShowUserComplaints, label: 'My' }
                    ].map((btn, idx) => (
                        <motion.button
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => btn.action(!btn.state)}
                            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                                btn.state 
                                ? 'bg-gray-800 text-white border border-cyan-400' 
                                : 'bg-gray-800/30 hover:bg-gray-800/50 text-gray-300 border border-transparent'
                            }`}
                        >
                            {btn.icon}
                            {btn.state ? "Show All" : `${btn.label} Issues`}
                        </motion.button>
                    ))}
                </motion.div>

                {/* Content Section */}
                <motion.h2 
                    key={showMostUpvoted ? 'trending' : 'recent'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold mb-8 text-center bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent"
                >
                    {showMostUpvoted ? "🔥 Trending Now" : "🆕 Recent Issues"}
                </motion.h2>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            className="h-8 w-8 border-4 border-cyan-400/50 border-t-cyan-400 rounded-full"
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <AnimatePresence>
                            {filteredComplaints.map((complaint) => (
                                <motion.div
                                    key={complaint._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-gray-800/50 p-5 rounded-xl border border-gray-700 backdrop-blur-sm hover:border-cyan-400/30 transition-all"
                                >
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold text-gray-100 mb-2">{complaint.title}</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">{complaint.description}</p>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="px-2.5 py-1 bg-gray-700/50 rounded-lg text-xs text-cyan-300">
                                            {complaint.faculty}
                                        </span>
                                        <span className="px-2.5 py-1 bg-gray-700/50 rounded-lg text-xs text-purple-300">
                                            {new Date(complaint.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        <motion.button 
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleUpvote(complaint._id)}
                                            className="flex items-center gap-2 group"
                                            disabled={complaint.upvotedBy.includes(studentId || '')}
                                        >
                                            {complaint.upvotedBy.includes(studentId || '') ? (
                                                <FaHeart className="text-cyan-400 text-lg animate-pulse" />
                                            ) : (
                                                <FaRegHeart className="text-lg text-gray-400 group-hover:text-cyan-400 transition-colors" />
                                            )}
                                            <span className="text-sm font-medium text-gray-300">
                                                {complaint.upvotes}
                                            </span>
                                        </motion.button>
                                        <span className="text-xs text-gray-500 font-mono">
                                            #{complaint.studentId.slice(0, 6)}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}