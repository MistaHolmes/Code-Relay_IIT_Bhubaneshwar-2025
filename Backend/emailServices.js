require("dotenv").config();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (to, subject, text) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to, 
        subject, 
        text, 
        html: `<p>${text}</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Notification email sent to ${to}`);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

module.exports = sendEmail;