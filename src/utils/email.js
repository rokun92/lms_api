const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, attachments = []) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('❌ Email credentials not found in environment variables.');
            console.log('--- EMAIL SIMULATION ---');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Attachments: ${attachments.length}`);
            console.log('------------------------');
            return { success: false, error: 'Email credentials missing' };
        }

        console.log(`📧 Initializing email transporter with service: ${process.env.EMAIL_SERVICE || 'gmail'}`);
        
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Verify transporter connection
        await transporter.verify();
        console.log('✅ Email transporter verified successfully');

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"LMS Platform" <noreply@lms.com>',
            to,
            subject,
            text,
            attachments
        };

        console.log(`📤 Sending email to ${to}...`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully: ${info.response}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        console.error('Full error details:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendEmail };
