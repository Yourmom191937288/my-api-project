// 1. Import necessary libraries
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// 2. Configure the server
const app = express();
app.use(express.json({ limit: '10mb' })); // Increase limit to accept larger image data

// Stronger CORS setup to allow browser access
const corsOptions = {
  origin: "*", // Allows all sites to access your API
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests

// 3. Initialize the Google AI Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- ENDPOINT #1: MATH SOLVER ---
app.post('/solve-math', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const userProblem = req.body.problem;

    if (!userProblem) {
      return res.status(400).json({ error: "No problem provided." });
    }

    const result = await model.generateContent(userProblem);
    const response = await result.response;
    const aiAnswer = response.text();

    console.log(`Problem: "${userProblem}" | Answer: "${aiAnswer}"`);
    res.json({ answer: aiAnswer });

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Something went wrong on the server." });
  }
});

// --- ENDPOINT #2: IMAGE OCR ---
app.post('/read-image', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const { prompt, imageBase64, mimeType } = req.body;

    if (!prompt || !imageBase64 || !mimeType) {
      return res.status(400).json({ error: "A prompt, imageBase64 string, and mimeType are required." });
    }

    const imagePart = {
      inlineData: { data: imageBase64, mimeType }
    };
    
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const aiAnswer = response.text();
    
    res.json({ answer: aiAnswer });

  } catch (error) {
    console.error("Error with OCR request:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// 5. Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});