const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, attachments = []) => {
    try {
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;
        const emailService = process.env.EMAIL_SERVICE || 'gmail';

        console.log(`\n📧 Email Configuration:`);
        console.log(`   Service: ${emailService}`);
        console.log(`   From: ${process.env.EMAIL_FROM || 'Not set (using default)'}`);
        console.log(`   User: ${emailUser ? 'Set' : 'Missing'}`);
        console.log(`   Pass: ${emailPass ? 'Set (' + emailPass.length + ' chars)' : 'Missing'}`);

        if (!emailUser || !emailPass) {
            console.error('Email credentials not found in environment variables.');
            return { success: false, error: 'Email credentials missing' };
        }

        console.log(`\n Creating transporter for ${emailService}...`);
        
        // Remove spaces from password
        const cleanPass = emailPass.trim();
        const cleanUser = emailUser.trim();
        
        const transportConfig = emailService.toLowerCase().includes('brevo') 
            ? {
                host: 'smtp-relay.brevo.com',
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

        // Verify transporter connection
        console.log(`Verifying email credentials...`);
        await transporter.verify();
        console.log('Email transporter verified successfully');

        // For SendGrid, use a verified sender email
        let fromAddress = process.env.EMAIL_FROM;
        if (!fromAddress) {
            if (emailService.toLowerCase().includes('sendgrid')) {
                throw new Error('EMAIL_FROM environment variable is required for SendGrid. Please set a verified Sender Identity email address.');
            }
            fromAddress = '"LMS Platform" <noreply@lms.com>';
        }

        const mailOptions = {
            from: fromAddress,
            to,
            subject,
            text,
            attachments
        };

        console.log(`\n Sending email...`);
        console.log(`   To: ${to}`);
        console.log(`   Subject: ${subject}`);
        console.log(`   Attachments: ${attachments.length}`);
        
        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent successfully!`);
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
