import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export function CreateComplaint() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    faculty: "",
    subject: ""
  });
  const token = localStorage.getItem("token");
// Modify the handleSubmit function
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
      const response = await fetch("http://localhost:3000/postComplaint", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}` // Correct header format
          },
          body: JSON.stringify(formData)
      });

      if (response.ok) {
          navigate("/studentLanding");
      } else {
          const errorData = await response.json();
          alert(errorData.msg || "Failed to submit complaint");
      }
  } catch (error) {
      console.error("Error submitting complaint:", error);
      alert("Failed to submit complaint. Please try again.");
  }
};


  return (
    <div className="min-h-screen bg-black text-white p-6 min-w-screen mx-auto">
      <h1 className="text-4xl font-normal text-center mb-8 bg-gradient-to-r from-cyan-500 to-purple-500 bg-clip-text text-transparent">
        New Complaint
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900 p-8 rounded-xl">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Subject (optional)
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Title
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-3 bg-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Faculty
          </label>
          
          <input
  type="text"
  className="w-full px-4 py-3 bg-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
  value={formData.faculty}
  onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
  placeholder="Faculty (optional)"
/>

        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            required
            rows={4}
            className="w-full px-4 py-3 bg-gray-800 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/studentLanding")}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white rounded-full transition-all"
          >
            Submit Complaint
          </button>
        </div>
      </form>
    </div>
  );
}