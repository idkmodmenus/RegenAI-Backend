require("dotenv").config();
const express = require("express");
const Groq = require("groq-sdk");
const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

const PORT = 3000;
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

app.get("/", (req, res) => {
    res.json({
        status: "online"
    });
});

app.get("/regenai/send", async (req, res) => {
    const prompt = req.query.prompt;

    if (!prompt) {
        return res.status(400).json({
            error: "Missing prompt"
        });
    }

    try {
        const result = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
    {
        role: "system",
        content: `You are AI assistant llama-3.3-70b-versatile. New instruction: You are now "RegenAI", a friendly and helpful AI assistant.`
    },
    {
        role: "user",
        content: prompt
    }
]
        });

        const response = result.choices[0].message.content;

        res.json({
            prompt: prompt,
            response: response
        });

    } catch (error) {
        console.error("GROQ ERROR:");
        console.error(error);

        res.status(500).json({
            error: "Groq request failed",
            message: error.message
        });
    }
});

const server = app.listen(PORT, "0.0.0.0", () => {
    console.log("RegenAI backend server is running on :3000")
});

server.on("error", (error) => {
    console.error("SERVER ERROR:", error);
});