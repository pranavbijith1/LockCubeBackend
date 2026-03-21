const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
require("dotenv").config();
const { execSync } = require("child_process");
const fs = require("fs");

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

router.get("/doomscrolldetect", async (req, res) => {
  try {
    const result = await model.generateContent(
      "Create a unique and different angry dialogue towards a user who is doomscrolling instead of working productively"
    );
    const text = result.response.text();

    const elevenRes = await fetch(
    "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM",
    {
        method: "POST",
        headers: {
        "xi-api-key": process.env.ELEVENLABS_KEY,
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
    }
    );

    // ✅ Check if ElevenLabs returned an error
    if (!elevenRes.ok) {
    const errorText = await elevenRes.text();
    console.log("ElevenLabs error:", errorText);
    return res.status(400).json({ error: errorText });
    }

    const buffer = Buffer.from(await elevenRes.arrayBuffer());
    fs.writeFileSync("output.mp3", buffer);
    execSync("afplay output.mp3");

    // Play it using the OS
    if (process.platform === "darwin") execSync("afplay output.mp3");       // Mac
    else if (process.platform === "win32") execSync("start output.mp3");    // Windows
    else execSync("mpg123 output.mp3");                                      // Linux

    res.status(200).json({ message: text });

  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message });
  }
});

router.get("/start", async(req, res) => {
    
});

router.get("/stop", async(req, res) => {

});

module.exports = router;

