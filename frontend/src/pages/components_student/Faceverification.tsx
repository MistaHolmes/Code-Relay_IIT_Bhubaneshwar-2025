import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // For navigation
import * as faceapi from "face-api.js"; // Ensure face-api.js is installed

interface FaceVerificationProps {
  onSuccess: () => void;
  onClose: () => void;
}


const FaceVerification: React.FC<FaceVerificationProps> = ({ onSuccess, onClose }) => {
  // Refs for video, canvas, and the scanning interval
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanningInterval = useRef<number | null>(null);

  // State for messages and verification status
  const [message, setMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Navigation hook for redirection
  const navigate = useNavigate();

  // Start video, load models, and start detection on mount
  useEffect(() => {
    startVideo();
    loadModels().then(() => {
      faceMyDetect();
    });

    return () => {
      if (scanningInterval.current !== null) {
        clearInterval(scanningInterval.current);
      }
    };
  }, []);

  // Function to start the webcam
  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          console.log("Webcam accessed successfully");
        }
      })
      .catch((err) => {
        console.error("Error accessing webcam:", err);
        setMessage("Webcam access denied. Please enable camera permissions.");
      });
  };

  // Function to load face-api.js models
  const loadModels = () => {
    return Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    ])
      .then(() => {
        console.log("All models loaded successfully");
      })
      .catch((error) => {
        console.error("Error loading models:", error);
      });
  };


  // Function to detect faces continuously and trigger verification
  const faceMyDetect = () => {
    scanningInterval.current = window.setInterval(async () => { // Use window.setInterval
      console.log("Scanning for faces...");
      if (!videoRef.current || isVerifying) return;
  
      const detections = await faceapi.detectAllFaces(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      );
  
      console.log("Detections:", detections);
  
      if (detections.length > 0) {
        console.log("Face(s) detected, triggering verification");
        if (scanningInterval.current !== null) {
          window.clearInterval(scanningInterval.current); // Use window.clearInterval for consistency
          scanningInterval.current = null;
        }
        setIsVerifying(true);
        const embedding = [0.1, 0.2, 0.3, 0.4];
        verifyFaceEmbedding(embedding);
      }
    }, 1000);
  };

  // Function to verify the face embedding
  const verifyFaceEmbedding = async (embedding: number[]) => {
    try {
      const response = await axios.post("http://localhost:3000/verifyFace", {
        embedding,
        studentId: localStorage.getItem("studentId") // Add studentId
      });

      if (response.data.verified) {
        setMessage("Verification successful!");
        onSuccess(); // Add this line
        navigate("/studentLanding");
      } else {
        setMessage("Verification failed. Please try again.");
        setIsVerifying(false);
        faceMyDetect();
      }
    } catch (error) {
      console.error("Verification error:", error);
      setMessage("Error during verification. Please try again.");
      setIsVerifying(false);
      faceMyDetect();
    }
  };

  return (
    <div className="myapp" style={{ textAlign: "center", marginTop: "20px" }}>

      <button 
        onClick={onClose}
        style={{ 
          position: 'absolute', 
          top: '10px', 
          right: '10px', 
          padding: '5px 10px',
          background: 'red',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        X
      </button>

      <h1>Face Verification</h1>
      <div className="appvide">
        <video
          crossOrigin="anonymous"
          ref={videoRef}
          autoPlay
          muted
          width="940"
          height="650"
          style={{ border: "1px solid black" }}
        ></video>
      </div>
      <canvas
        ref={canvasRef}
        width="940"
        height="650"
        className="appcanvas"
        style={{ position: "absolute", top: "20px", left: "20px" }}
      />
      {message && <p style={{ marginTop: "20px", color: "green" }}>{message}</p>}
    </div>
  );
};


export default FaceVerification;
