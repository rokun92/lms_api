const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, attachments = []) => {
    try {
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;
        const emailService = process.env.EMAIL_SERVICE || 'gmail';

        console.log(`\n📧 Email Configuration:`);
        console.log(`   Service: ${emailService}`);
        console.log(`   User: ${emailUser ? '✅ Set' : '❌ Missing'}`);
        console.log(`   Pass: ${emailPass ? '✅ Set (' + emailPass.length + ' chars)' : '❌ Missing'}`);

        if (!emailUser || !emailPass) {
            console.error('❌ Email credentials not found in environment variables.');
            return { success: false, error: 'Email credentials missing' };
        }

        console.log(`\n🔧 Creating transporter for ${emailService}...`);
        
        // Remove spaces from password in case they exist
        const cleanPass = emailPass.trim();
        
        const transporter = nodemailer.createTransport({
            service: emailService,
            auth: {
                user: emailUser.trim(),
                pass: cleanPass
            }
        });

        // Verify transporter connection
        console.log(`🔐 Verifying email credentials...`);
        await transporter.verify();
        console.log('✅ Email transporter verified successfully');

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"LMS Platform" <noreply@lms.com>',
            to,
            subject,
            text,
            attachments
        };

        console.log(`\n📤 Sending email...`);
        console.log(`   To: ${to}`);
        console.log(`   Subject: ${subject}`);
        console.log(`   Attachments: ${attachments.length}`);
        
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully!`);
        console.log(`   Response: ${info.response}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('\n❌ Error sending email:');
        console.error(`   Message: ${error.message}`);
        console.error(`   Code: ${error.code}`);
        console.error('   Full error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendEmail };
