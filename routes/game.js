const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
require("dotenv").config();
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const sound = require("sound-play");

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { AsyncLocalStorage } = require("async_hooks");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

let currentAudioProcess = null;

let timeLeft = 0; 

let gameStoppedAt = null;
router.get("/doomscrolldetect", async (req, res) => {
  try {
    // const stopTime = AsyncLocalStorage.getItem('gameStoppedAt');
  console.log("WE are DOOMSCroLLING")
    const currentTime = Date.now();
    if(gameStoppedAt) {
        console.log(currentTime - gameStoppedAt);
    }
    if(gameStoppedAt && currentTime - gameStoppedAt < 30000){
        console.log("Fahhhhh");;
        const filePath = path.resolve(__dirname, "..", "fah.mp3");

        // Play the audio file with an optional volume argument (0.5 is default)
        const volume = 0.5;
        sound.play(filePath, volume)
        .then(() => {
            console.log("Audio playback finished.");
        })
        .catch((err) => {
            console.error("Error during audio playback:", err);
        });

        res.status(200).json({ message: "bad boy" });
    } else {
            const result = await model.generateContent(
            "Roast the user for doomscrolling instead of being productive using brainrot langauge.  Mate it three sentences or less"
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
        model_id: "eleven_flash_v2_5",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
    }
    );

    const buffer = Buffer.from(await elevenRes.arrayBuffer());
    fs.writeFileSync("output.mp3", buffer);

    // Play it using the OS
    if (process.platform === "darwin") currentAudioProcess = exec("afplay output.mp3");       // Mac
    else if (process.platform === "win32") currentAudioProcess = exec("start output.mp3");    // Windows
    else currentAudioProcess = exec("mpg123 output.mp3");                                      // Linux

    res.status(200).json({ message: text });
    }
   
    

  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message });
  }
});

router.get("/start", async(req, res) => {
    if (currentAudioProcess) {
        currentAudioProcess.kill();
        currentAudioProcess = null;
        return res.status(200).json({ message: "Audio stopped" });
    }
    res.status(400).json({ error: "No audio playing" });
});

router.get("/stop", async(req, res) => {
    console.log("STOP");
    gameStoppedAt = Date.now();
    console.log("Game stopped. Timer started...");


});

module.exports = router;

