const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, attachments = []) => {
    try {
        // Create transporter
        // Note: In a real app, these should be in .env
        // For development, we might need to use a service like Ethereal or just log it if credentials aren't present
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail', // e.g., 'gmail'
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn('Email credentials not found in environment variables. Email will not be sent.');
            console.log('--- EMAIL SIMULATION ---');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Attachments: ${attachments.length}`);
            console.log('------------------------');
            return false;
        }

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"LMS Platform" <noreply@lms.com>',
            to,
            subject,
            text,
            attachments
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = { sendEmail };
