const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

router.get("/doomscrolldetect", async(req,res) => {
    try{
        const result = await model.generateContent("Create a unquie and different angry dialougue towards a user who is doomscrolling instead of working productively");
        console.log(result.response.text());
        res.status(200).json({
            message: result.response.text()
        });
    }
    catch(err){
        console.log(err);
        return res.status(400).json({
            error: err
        });
    }
}); 

router.get("/gamestart", async(req, res) => {
    
});

router.get("/gamedone", async(req, res) => {

});

module.exports = router;

