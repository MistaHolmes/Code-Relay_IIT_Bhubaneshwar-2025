
require('dotenv').config();
const express = require('express');
const app = express();
const connectDB = require('./db/connections');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const User = require('./db/studentSchema');
const Poll = require('./db/PollSchema');
const { getDistance } = require('geolib');
const Complaint = require('./db/complaintSchema');
const Teacher = require('./db/teacherSchema')
const AttendanceSession =require('./db/attendanceSessionSchema')
const sendEmail = require("./emailServices");
const responses = require("./db/FAQSchema")
const QRCode = require('qrcode');
const cors = require('cors');
const crypto = require('crypto');
const mongoose = require('mongoose'); 
const stringSimilarity = require('string-similarity');

const coords = { latitude: 20.1493, longitude: 85.6704 };

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Authorization"] 
}));

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET;
connectDB();

app.use(express.json());

const signupSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});

app.get('/', (req, res) => {
    res.send('Hello, IIT BBSR!');
});

app.get('/StudentLanding', (req, res) => {
    res.send('Hello, IIT BBSR!');
});

app.get('/TeacherLanding', (req, res) => {
    res.send('Hello, IIT BBSR!');
});

/*For BackEnd Tests*/
// Add Student
app.post("/AddStudent", async (req, res) => {
    try {
        const validatedData = signupSchema.parse(req.body);
        const { username, email, password } = validatedData;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        
        const studentId = `STU${crypto.randomInt(100000, 999999)}`;

        const newUser = new User({ username, email, password,studentId});
        await newUser.save();
        const token = jwt.sign({
            email: newUser.email, username: newUser.username
        }, JWT_SECRET, {expiresIn: '1h'})

        res.status(201).json({ 
            msg: 'User registered successfully!',
            token: `Bearer ${token}`,
            StudentID : studentId
         });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ msg: 'Validation error', errors: error.errors });
        }
        console.error('Error:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

// AddTeacher
app.post('/addTeacher', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher) {
            return res.status(400).json({ error: "Teacher already exists" });
        }

        const teacherId = `STU${crypto.randomInt(100000, 999999)}`;

        const newTeacher = new Teacher({
            teacherId,
            name,
            email,
            password
        });
        await newTeacher.save();
        res.status(201).json({ message: "Teacher registered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/*For BackEnd Tests*/

/* Middlewares */
// server.js - Authentication Middleware
const authentication = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ msg: "No token provided" });
    }
    
    const token = authHeader.split(" ")[1].trim(); // Remove whitespace
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ msg: "Invalid/expired token" });
        }
        
        // Ensure decoded token contains studentId
        req.user = {
            studentId: decoded.studentId, // <-- MUST BE PRESENT
            email: decoded.email,
            username: decoded.username
        };
        
        next();
    });
};
const teacherAuth = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ error: "Access denied, no token provided" });
    }
    try {
        const verified = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
        req.teacher = verified; 
        next();
    } catch (error) {
        res.status(400).json({ error: "Invalid token" });
    }
};
/* Middlewares */

/* Authentication */
// Sign In -- white boy
app.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        
        if (!existingUser || existingUser.password !== password) {
            return res.status(401).json({ msg: "Invalid credentials" });
        }

        // Include studentId in the token payload
        const token = jwt.sign(
            {
                studentId: existingUser.studentId, // <-- MUST BE INCLUDED
                email: existingUser.email,
                username: existingUser.username
            },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.status(200).json({
            msg: "Welcome back!",
            token: token,
            studentId: existingUser.studentId
        });
    } catch (error) {
        console.error("Signin Error:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
});

// Teacher Sign in
app.post('/signin/teacher', async (req, res) => {
    try {
        const { email, password } = req.body;
        const teacher = await Teacher.findOne({ email });

        if (!teacher || teacher.password !== password) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ teacherId: teacher.teacherId }, JWT_SECRET, { expiresIn: "1h" });
        res.json({msg: "Welcome back!", 
            token: `${token}`,
            teacherId: teacher.teacherId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
/* Authentication */

/* POLLS */

/* POLLS */
// Create Poll (Professor)
app.post('/create-poll', teacherAuth, async (req, res) => {
    try {
        const { title, description, options } = req.body;
        
        if (!title || !options || options.length < 2) {
            return res.status(400).json({ msg: "Title and at least 2 options required" });
        }

        const newPoll = new Poll({
            title,
            description: description || "",
            options: options.map(text => ({ text, votes: 0 })),
            votedBy: []
        });

        await newPoll.save();
        res.status(201).json({ msg: "Poll created successfully", poll: newPoll });
    } catch (error) {
        console.error("Poll creation error:", error);
        res.status(500).json({ msg: "Failed to create poll", error: error.message });
    }
});

// Get All Polls
app.get('/polls', async (req, res) => {
    try {
        const polls = await Poll.find().sort({ createdAt: -1 });
        res.json(polls);
    } catch (error) {
        console.error("Error fetching polls:", error);
        res.status(500).json({ msg: "Failed to fetch polls", error: error.message });
    }
});

// Submit Vote
app.post('/vote/:pollId', authentication, async (req, res) => {
    try {
        const { pollId } = req.params;
        const { optionIndex } = req.body;
        const studentId = req.user.studentId;

        const poll = await Poll.findById(pollId);
        if (!poll) return res.status(404).json({ msg: "Poll not found" });

        if (poll.votedBy.includes(studentId)) {
            return res.status(400).json({ msg: "Already voted on this poll" });
        }

        if (optionIndex < 0 || optionIndex >= poll.options.length) {
            return res.status(400).json({ msg: "Invalid option index" });
        }

        poll.options[optionIndex].votes++;
        poll.votedBy.push(studentId);
        await poll.save();

        res.json({ msg: "Vote recorded", poll });
    } catch (error) {
        console.error("Voting error:", error);
        res.status(500).json({ msg: "Failed to process vote", error: error.message });
    }
});


// Fetch Student Attendance
app.get('/attendance', authentication, async (req, res) => {
    try {
        const student = await User.findOne({ email: req.user.email });
        if (!student) {
            return res.status(404).json({ msg: "Student not found" });
        }
        res.json({ attendance: student.attendance });
    } catch (error) {
        console.error("Error fetching attendance:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
});

/* Community Page */
// Post Complaint
// In server.js, modify the postComplaint route to get studentId from the user

///new
app.post('/postComplaint', authentication, async (req, res) => {
    try {
        // Validate required fields first
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({ msg: "Title and description are required" });
        }

        // Get optional fields safely
        const { subject = "", faculty = "" } = req.body;
        const studentId = req.user.studentId;

        const newComplaint = new Complaint({
            studentId,
            subject,
            faculty,
            title,
            description,
        });

        await newComplaint.save();
        res.status(201).json({ 
            msg: "Complaint posted successfully!",
            complaint: newComplaint 
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ msg: "Internal server error", error: error.message });
    }
});


// Upvote Complaint
app.post('/upvoteComplaint/:complaintId', authentication, async (req, res) => {
    try {
        const { complaintId } = req.params;
        const studentId = req.user.studentId; // Get from token

        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return res.status(404).json({ msg: "Complaint not found" });
        }
        if (complaint.upvotedBy.includes(studentId)) {
            return res.status(400).json({ msg: "Already upvoted" });
        }
        
        const updatedComplaint = await Complaint.findByIdAndUpdate(
            complaintId,
            { $inc: { upvotes: 1 }, $push: { upvotedBy: studentId } },
            { new: true }
        );
        
        res.status(200).json({
            msg: "Upvoted successfully!",
            complaint: updatedComplaint
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
});


//Get all complaints
app.get('/allComplaints', async (req, res) => {
    try {
        const complaints = await Complaint.find();
        res.status(200).json(complaints);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
});
/* Community Page */


/* Mail Notification */
app.post("/sendNotificationEmail", teacherAuth, async (req, res) => {
    try {
        const { complaintId } = req.body;
        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return res.status(404).json({ msg: "Complaint not found" });
        }
        const student = await User.findOne({ studentId: complaint.studentId });
        if (!student) {
            return res.status(404).json({ msg: "Student not found" });
        }
        
        // Mail Content
        const subject = "Complaint Resolved Notification";
        const text = "Your complaint has been marked as resolved. If you have any further concerns, please contact your faculty.";

        await sendEmail(student.email, subject, text);
        res.status(200).json({ msg: "Notification email sent successfully!" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
});
/* Mail Notification */

///////////////////////////////////////////NEW

// Active attendance sessions
app.get('/activeSessions', authentication, async (req, res) => {
    try {
        const studentId = req.user.studentId;

        // Fetch active sessions not attended by the student
        const sessions = await AttendanceSession.aggregate([
            { $match: { active: true } },
            {
                $lookup: {
                    from: 'users',
                    let: { sessionId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$studentId', studentId] },
                                        { $in: ['$$sessionId', '$attendance.sessionId'] }
                                    ]
                                }
                            }
                        },
                        { $limit: 1 }
                    ],
                    as: 'attended'
                }
            },
            { $match: { attended: { $size: 0 } } } // Exclude sessions the student attended
     ] );

        res.status(200).json(sessions);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ msg: "Server error loading sessions", error: error.message });
    }
});

// Update the markAttendance route
// server.js - Update the markAttendance route
app.post('/markAttendance', authentication, async (req, res) => {
    try {
        const { sessionId } = req.body;
        const studentId = req.user.studentId;

        const session = await AttendanceSession.findById(sessionId);
        if (!session || !session.active) {
            return res.status(400).json({ msg: "Invalid attendance session" });
        }

        // Check if student already marked attendance
        if (session.students.includes(studentId)) {
            return res.status(400).json({ msg: "Attendance already marked" });
        }

        // Add student ID to the session's students array
        session.students.push(studentId);
        await session.save();

        // Update user's attendance record
        await User.findOneAndUpdate(
            { studentId },
            { 
                $push: { 
                    attendance: { 
                        sessionId: session._id,
                        subject: session.subject,
                        timestamp: new Date()
                    } 
                } 
            }
        );

        res.status(200).json({ msg: "Attendance marked successfully" });
    } catch (error) {
        console.error("Error marking attendance:", error);
        res.status(500).json({ 
            msg: "Internal server error",
            error: error.message // Include error message in response
        });
    }
});

// Start attendance session
app.post('/startAttendance', teacherAuth, async (req, res) => {
    try {
        const { subject, faculty } = req.body;
        
        if (!subject || !faculty) {
            return res.status(400).json({ msg: "Subject and faculty required" });
        }

        const newSession = new AttendanceSession({
            subject,
            faculty,
            active: true
        });
        
        await newSession.save();
        res.status(201).json({ msg: "Attendance session started", session: newSession });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ msg: "Internal server error" });
    }
});

// server.js - Corrected Get Attendance Details Route
// server.js - Update the /attendance/:sessionId route
// Update the /attendance/:sessionId route to pull timestamps from user records
app.get('/attendance/:sessionId', teacherAuth, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await AttendanceSession.findById(sessionId);
        
        if (!session) {
            return res.status(404).json({ msg: "Session not found" });
        }

        // Get student details using the student IDs stored in the session
        const attendees = await User.find(
            { studentId: { $in: session.students } },
            'studentId username'
        );

        res.status(200).json({
            total: session.students.length,
            attendees: attendees.map(student => ({
                studentId: student.studentId,
                username: student.username,
                timestamp: new Date() // You might want to store this differently
            }))
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ 
            msg: "Internal server error",
            error: error.message 
        });
    }
});

// Get teacher's active sessions
app.get('/teacherActiveSessions', teacherAuth, async (req, res) => {
    try {
        const sessions = await AttendanceSession.find({ active: true })
            .catch(err => {
                console.error("Database Error:", err);
                throw new Error("Database query failed");
            });
            
        if (!sessions) {
            return res.status(404).json({ msg: "No sessions found" });
        }
        
        res.status(200).json(sessions);
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ 
            msg: "Failed to fetch sessions",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});




// Stop attendance session
app.post('/stopAttendance/:sessionId', teacherAuth, async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const session = await AttendanceSession.findByIdAndUpdate(
            sessionId,
            { active: false },
            { new: true }
        );

        if (!session) {
            return res.status(404).json({ msg: "Session not found" });
        }

        res.status(200).json({ msg: "Session stopped successfully" });
    } catch (error) {
        console.error("Error stopping session:", error);
        res.status(500).json({ 
            msg: "Internal server error",
            error: error.message 
        });
    }
});


//faceapi 
const HARDCODED_EMBEDDING = [0.1, 0.2, 0.3, 0.4]; // Must match frontend array

app.post('/verifyFace', (req, res) => {
    try {
        const receivedArray = req.body.embedding;
        
        // Simple array comparison (not production-safe!)
        const verified = JSON.stringify(receivedArray) === JSON.stringify(HARDCODED_EMBEDDING);
        
        res.json({
            verified,
            message: verified ? "Face verified!" : "Verification failed"
        });
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ verified: false, message: "Server error" });
    }
});


// Enhanced /api/ask endpoint
app.post('/api/ask', (req, res) => {
    const { question } = req.body;
    const cleanQuestion = question.toLowerCase().trim();
    
    // Handle empty questions
    if (!cleanQuestion) {
        return res.json({ answer: "Please ask a question related to campus activities, academics, or student services." });
    }

    // Get all FAQ questions
    const faqQuestions = Object.keys(responses).filter(k => k !== "default");
    const matches = stringSimilarity.findBestMatch(cleanQuestion, faqQuestions);
    
    const bestMatch = matches.bestMatch;
    const THRESHOLD = 0.6; // Lower threshold for broader matching
    
    const answer = bestMatch.rating >= THRESHOLD
        ? responses[bestMatch.target]
        : responses["default"];

    res.json({ answer });
});


app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`);
});
