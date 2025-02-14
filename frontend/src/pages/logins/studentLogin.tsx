

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./studentLogin.css"

const StudentSignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post("http://localhost:3000/signin", {
        email,
        password,
      });
      alert(response.data.msg);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("studentId", response.data.studentId);
      navigate("/studentLanding");
    } catch (err:any) {
      setError(err.response?.data?.msg || "Something went wrong");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-900 rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-purple-500">
          Student SignIn
        </h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 mt-1 text-white bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 mt-1 text-white bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>


          <button
            type="submit"
            className="w-full h-15 py-2 mt-4 font-medium text-white rounded-lg bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 bg-[length:200%_auto] hover:opacity-90 animate-gradient"
          >
            Sign In
          </button>

          
        </form>

      </div>
    </div>
  );
};

export default StudentSignIn;