const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, attachments = []) => {
    try {
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;
        const emailService = process.env.EMAIL_SERVICE || 'gmail';


        if (!emailUser || !emailPass) {
            console.error('Email credentials not found in environment variables.');
            return { success: false, error: 'Email credentials missing' };
        }

        
        // Remove spaces from password
        const cleanPass = emailPass.trim();
        const cleanUser = emailUser.trim();
        
        // Use explicit SMTP configuration for better reliability
        const transportConfig = emailService.toLowerCase() === 'gmail' 
            ? {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false, // Use TLS (not SSL)
                auth: {
                    user: cleanUser,
                    pass: cleanPass
                },
                connectionTimeout: 10000,
                socketTimeout: 10000,
                maxConnections: 5,
                maxMessages: 100,
                rateDelta: 1000,
                rateLimit: 5
            }
            : {
                service: emailService,
                auth: {
                    user: cleanUser,
                    pass: cleanPass
                }
            };

        const transporter = nodemailer.createTransport(transportConfig);

        console.log(` Verifying email credentials...`); // for mine
        await transporter.verify(); // check connection with smtp server
        console.log('✅ Email transporter verified successfully');

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"LMS Platform" <noreply@lms.com>',
            to,
            subject,
            text,
            attachments
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully!`);
        console.log(`   Response: ${info.response}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('\n Error sending email:');
        console.error(`   Message: ${error.message}`);
        console.error(`   Code: ${error.code}`);
        console.error('   Full error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendEmail };
