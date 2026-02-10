const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Player = require('../models/Player');
const OTP = require('../models/OTP');
const { generateOTP, sendVerificationEmail } = require('../services/emailService');

// SEND VERIFICATION CODE
router.post('/send-verification', async (req, res) => {
    try {
        const { email } = req.body;

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email.toLowerCase())) {
            return res.status(400).json({ error: 'Please use a valid email address' });
        }

        // Check if email already registered
        const existingPlayer = await Player.findOne({ email: email.toLowerCase() });
        if (existingPlayer) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Generate OTP
        const code = generateOTP();

        // Delete any existing OTPs for this email
        await OTP.deleteMany({ email: email.toLowerCase() });

        // Save new OTP
        const otp = new OTP({
            email: email.toLowerCase(),
            code: code
        });
        await otp.save();

        // Send email
        await sendVerificationEmail(email, code);

        res.json({ message: 'Verification code sent to your email' });
    } catch (err) {
        console.error('Send verification error details:', {
            message: err.message,
            stack: err.stack,
            email: req.body.email
        });
        res.status(500).json({ error: `Failed to send verification code: ${err.message}` });
    }
});

// VERIFY EMAIL CODE
router.post('/verify-email', async (req, res) => {
    try {
        const { email, code } = req.body;

        // Find OTP
        const otp = await OTP.findOne({
            email: email.toLowerCase(),
            code: code
        });

        if (!otp) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        // Check if expired
        if (new Date() > otp.expiresAt) {
            await OTP.deleteOne({ _id: otp._id });
            return res.status(400).json({ error: 'Verification code expired' });
        }

        // Mark as verified
        otp.verified = true;
        await otp.save();

        // Return verification token (just the OTP ID for now)
        res.json({
            message: 'Email verified successfully',
            verificationToken: otp._id.toString()
        });
    } catch (err) {
        console.error('Verify email error:', err);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// REGISTER (after email verification)
router.post('/register', async (req, res) => {
    try {
        const { email, name, password, verificationToken } = req.body;

        // Verify the token
        const otp = await OTP.findById(verificationToken);
        if (!otp || !otp.verified || otp.email !== email.toLowerCase()) {
            return res.status(400).json({ error: 'Invalid or expired verification' });
        }

        // Check if email already registered
        let player = await Player.findOne({ email: email.toLowerCase() });
        if (player) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Check if name already taken
        player = await Player.findOne({ name: name });
        if (player) {
            return res.status(400).json({ error: 'Player name already taken' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create player
        player = new Player({
            email: email.toLowerCase(),
            name: name,
            password: hashedPassword
        });

        await player.save();

        // Delete the used OTP
        await OTP.deleteOne({ _id: otp._id });

        res.json(player);
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: err.message });
    }
});

// LOGIN (with name and password)
router.post('/login', async (req, res) => {
    try {
        const { name, password } = req.body;

        // Check user by name
        const player = await Player.findOne({ name: name });
        if (!player) {
            return res.status(400).json({ error: 'Player not found' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, player.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        res.json(player);
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
