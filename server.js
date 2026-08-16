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
    const thinkRequested = req.query.think === "1" || req.query.think === "true";

    if (!prompt) {
        return res.status(400).json({
            error: "Missing prompt"
        });
    }

    try {
        const requestOptions = {
            model: "openai/gpt-oss-120b",
            messages: [
                {
                    role: "system",
                    content: `You are AI assistant "Regen".`
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            reasoning_format: "parsed",
            reasoning_effort: thinkRequested ? "high" : "low"
        };

        const result = await groq.chat.completions.create(requestOptions);

        const message = result.choices[0].message;

        res.json({
            prompt: prompt,
            response: message.content,
            reasoning: thinkRequested ? (message.reasoning || null) : null
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
    console.log("Renigga backend server is running on :3000")
});

server.on("error", (error) => {
    console.error("SERVER ERROR:", error);
});
