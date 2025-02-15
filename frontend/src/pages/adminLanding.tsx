import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUserGraduate, FaChalkboardTeacher, FaTrash, FaPlus } from "react-icons/fa";

interface User {
  _id: string;
  studentId?: string;
  teacherId?: string;
  username: string;
  email: string;
}

export function AdminLanding() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"students" | "teachers">("students");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "student"
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/adminLogin");
    fetchUsers();
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const endpoint = activeTab === "students" ? "http://localhost:3000/allStudents" : "http://localhost:3000/allTeachers";
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = newUser.role === "student" ? "http://localhost:3000/AddStudent" : "http://localhost:3000/addTeacher";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      });
      
      if (!response.ok) throw new Error("Failed to add user");
      await fetchUsers();
      setNewUser({ username: "", email: "", password: "", role: "student" });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to add user");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const endpoint = activeTab === "students" 
        ? `http://localhost:3000/deleteStudent/${id}`
        : `http://localhost:3000/deleteTeacher/${id}`;
        
      const response = await fetch(endpoint, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete user");
      fetchUsers();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete user");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center p-6">
        <p className="text-red-400 text-lg mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full hover:scale-105 transition-transform text-white font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>

          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-8">
            {["students", "teachers"].map((tab) => (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.05 }}
                className={`px-6 py-2 rounded-full transition-all ${
                  activeTab === tab
                    ? "bg-gray-800 text-white border border-cyan-400"
                    : "bg-gray-800/30 hover:bg-gray-800/50 text-gray-300"
                }`}
                onClick={() => setActiveTab(tab as "students" | "teachers")}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </motion.button>
            ))}
          </div>

          {/* Add User Form */}
          <motion.form 
            onSubmit={handleAddUser}
            className="bg-gray-800/50 p-6 rounded-xl mb-8 border border-gray-700 backdrop-blur-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <input
                type="text"
                placeholder="Username"
                className="p-2 bg-gray-700 rounded-lg text-white"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="p-2 bg-gray-700 rounded-lg text-white"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="p-2 bg-gray-700 rounded-lg text-white"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
              <select
                className="p-2 bg-gray-700 rounded-lg text-white"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-6 py-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full text-white font-semibold flex items-center gap-2 mx-auto"
              type="submit"
            >
              <FaPlus /> Add {newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1)}
            </motion.button>
          </motion.form>

          {/* User List */}
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
              {users.map((user) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-800/50 p-5 rounded-xl border border-gray-700 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100">{user.username}</h3>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                    {activeTab === "students" ? (
                      <FaUserGraduate className="text-2xl text-cyan-400" />
                    ) : (
                      <FaChalkboardTeacher className="text-2xl text-purple-400" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="bg-gray-700/50 px-3 py-1 rounded-lg text-cyan-300">
                      {activeTab === "students" ? user.studentId : user.teacherId}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(activeTab === "students" ? user.studentId! : user.teacherId!)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <FaTrash />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}