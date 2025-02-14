
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
const sendEmail = require("./emailServices");
const QRCode = require('qrcode');
const cors = require('cors');
const crypto = require('crypto');

const coords = { latitude: 20.2961, longitude: 85.8245 };

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
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
const authentication = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ msg: "No token provided" });
    }
    
    const token = authHeader.split(" ")[1];
    
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("JWT Verification Error:", err);
            return res.status(401).json({ msg: "Invalid or expired token" });
        }
        req.user = decoded;
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

        const token = jwt.sign(
            {
                studentId: existingUser.studentId,
                email: existingUser.email,
                username: existingUser.username
            },
            JWT_SECRET,
            { expiresIn: '2h' } // Increased expiration time
        );

        res.status(200).json({
            msg: "Welcome back!",
            token: token, // Raw token without Bearer
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
            token: ` ${token}`,
            teacherId: teacher.teacherId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
/* Authentication */

/* POLLS */
// Generate Poll
app.post('/create-poll', teacherAuth ,async (req, res) => {
    try {
        const { title, description, options, expiresAt } = req.body;
        if (!title || !options || options.length < 2) {
            return res.status(400).json({ msg: 'Poll must have a title and at least two options.' });
        }
        const newPoll = new Poll({
            title,
            description,
            options: options.map(option => ({ text: option })),
            expiresAt
        });
        await newPoll.save();
        res.status(201).json({ msg: 'Poll created successfully!', pollId: newPoll._id });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

// Vote in Poll
app.post('/vote/:pollId', authentication, async (req, res) => {
    try {
        const { pollId } = req.params;
        const { optionIndex } = req.body;
        const poll = await Poll.findById(pollId);
        if (!poll) {
            return res.status(404).json({ msg: 'Poll not found' });
        }
        if (optionIndex < 0 || optionIndex >= poll.options.length) {
            return res.status(400).json({ msg: 'Invalid option index' });
        }
        poll.options[optionIndex].votes += 1;
        await poll.save();
        res.status(200).json({ msg: 'Vote recorded successfully!', poll });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

// Get Poll Results
app.get('/poll/result/:pollId', teacherAuth, async (req, res) => {
    try {
        const { pollId } = req.params;
        const poll = await Poll.findById(pollId);
        if (!poll) {
            return res.status(404).json({ msg: 'Poll not found' });
        }
        res.status(200).json({ poll });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
});
/* POLLS */


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
app.post('/postComplaint', authentication, async (req, res) => {
    try {
        const { subject, faculty, title, description } = req.body;
        const studentId = req.user.studentId;

        if (!title || !description) {
            return res.status(400).json({ msg: "Title and description are required" });
        }

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
        res.status(500).json({ msg: "Internal server error" });
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


app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`);
});
