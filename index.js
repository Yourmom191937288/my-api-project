// 1. Import necessary libraries
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');

// 2. Configure the server
const app = express();
app.use(express.json());
app.use(cors());

// --- ENDPOINT #1: TEXT MATH SOLVER (Qwen2.5 Math) ---
app.post('/solve-math', async (req, res) => {
  try {
    const TEXT_API_URL = "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-Math-7B"; // Your chosen model
    const userProblem = req.body.problem;

    if (!userProblem) {
      return res.status(400).json({ error: "No problem provided." });
    }

    const response = await axios.post(
      TEXT_API_URL,
      { inputs: userProblem },
      { headers: { "Authorization": `Bearer ${process.env.HF_TOKEN}` } }
    );

    const result = response.data;
    const aiAnswer = result[0].generated_text;

    res.json({ answer: aiAnswer });
  } catch (error) {
    console.error("Error calling Hugging Face Text API:", error.message);
    res.status(500).json({ error: "Something went wrong on the server." });
  }
});

// --- ENDPOINT #2: IMAGE READER (Qwen2.5 VL) ---
app.post('/read-image-from-url', async (req, res) => {
  try {
    const IMAGE_API_URL = "https://api-inference.huggingface.co/models/unsloth/Qwen2.5-VL-7B-Instruct"; // Your chosen model
    const { prompt, imageUrl } = req.body;

    if (!prompt || !imageUrl) {
      return res.status(400).json({ error: "A prompt and imageUrl are required." });
    }

    const response = await axios.post(
      IMAGE_API_URL,
      { inputs: { image: imageUrl, question: prompt } },
      { headers: { "Authorization": `Bearer ${process.env.HF_TOKEN}` } }
    );
    
    const result = response.data;
    const aiAnswer = result[0].generated_text;

    res.json({ answer: aiAnswer });
  } catch (error) {
    console.error("Error in /read-image-from-url:", error.message);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// 5. Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
