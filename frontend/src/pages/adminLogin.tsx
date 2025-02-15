import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaLock, FaUser } from "react-icons/fa";

export function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/signin/teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) throw new Error("Invalid credentials");
      const data = await response.json();
      localStorage.setItem("token", data.token);
      navigate("/AdminLanding");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 p-8 rounded-xl border border-gray-700 backdrop-blur-sm w-full max-w-md"
      >
        <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          Admin Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-gray-700/50 p-3 rounded-lg">
              <FaUser className="text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                className="w-full bg-transparent text-white focus:outline-none"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                required
              />
            </div>
            
            <div className="flex items-center gap-3 bg-gray-700/50 p-3 rounded-lg">
              <FaLock className="text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-transparent text-white focus:outline-none"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <motion.button
            whileHover={{ scale: 1.05 }}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg text-white font-semibold transition-all"
            type="submit"
          >
            Login
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}