const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
    console.log('Testing with:');
    console.log('USER:', process.env.EMAIL_USER);
    console.log('PASS:', process.env.EMAIL_PASS ? '********' : 'MISSING');

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        await transporter.verify();
        console.log('✅ SMTP connection is verified!');

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'Solo Leveling Test',
            text: 'If you see this, email sending works!'
        });
        console.log('✅ Test email sent to yourself!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Email Test Failed:');
        console.error(error);
        process.exit(1);
    }
}

testEmail();
