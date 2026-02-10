const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

let openai;
try {
    if (process.env.OPENAI_API_KEY) {
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    } else {
        console.warn("OPENAI_API_KEY not found. OpenAI features will be disabled.");
    }
} catch (err) {
    console.warn("Failed to initialize OpenAI client:", err.message);
}

// Text-to-Speech
router.post('/speak', async (req, res) => {
    try {
        console.log("Received TTS Request");
        if (!openai) return res.status(503).json({ error: 'OpenAI service unavailable (Missing API Key)' });
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'Text is required' });

        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: text,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());

        // In a real app, we might save to file or stream.
        // For simplicity, let's send base64 data URL so frontend can play it immediately without file management
        const audioUrl = `data:audio/mp3;base64,${buffer.toString('base64')}`;
        console.log("TTS Success");
        res.json({ audioUrl });
    } catch (err) {
        console.error('OpenAI TTS Error:', err.message);
        if (err.response) console.error(JSON.stringify(err.response.data));
        res.status(500).json({ error: 'Failed to generate speech', details: err.message });
    }
});

// Chat with System
router.post('/chat', async (req, res) => {
    try {
        console.log("Received Chat Request");
        if (!openai) return res.status(503).json({ error: 'OpenAI service unavailable (Missing API Key)' });
        const { message, context } = req.body;

        const systemPrompt = `You are "The System" from Solo Leveling.
        Context: Player Level ${context?.level || 1}, Rank ${context?.rank || 'E'}, Job ${context?.job || 'None'}.
        Speak in a robotic, authoritative, yet game-like tone. Keep responses short and impactful.`;

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            model: "gpt-3.5-turbo",
        });

        const reply = completion.choices[0].message.content;
        console.log("Chat Success:", reply);
        res.json({ reply });
    } catch (err) {
        console.error('OpenAI Chat Error:', err.message);
        if (err.response) console.error(JSON.stringify(err.response.data));
        res.status(500).json({ error: 'Failed to get system response', details: err.message });
    }
});

module.exports = router;
