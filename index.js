const express = require('express');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios'); // Use the axios library

const app = express();
app.use(express.json());
app.use(cors());

// --- ENDPOINT #1: TEXT SOLVER ---
app.post('/solve-math', async (req, res) => {
  try {
    const TEXT_API_URL = "https://api-inference.huggingface.co/models/google/gemma-2b-it";
    const userProblem = req.body.problem;
    if (!userProblem) return res.status(400).json({ error: "No problem provided." });

    const response = await axios.post(TEXT_API_URL, { inputs: userProblem }, {
      headers: { "Authorization": `Bearer ${process.env.HF_TOKEN}` }
    });

    res.json({ answer: response.data[0].generated_text });
  } catch (error) {
    console.error("Error calling Hugging Face Text API:", error);
    res.status(500).json({ error: "Something went wrong on the server." });
  }
});

// --- ENDPOINT #2: IMAGE READER (FROM URL) ---
app.post('/read-image-from-url', async (req, res) => {
  try {
    const VQA_API_URL = "https://api-inference.huggingface.co/models/dandelin/vilt-b32-finetuned-vqa";
    const { prompt, imageUrl } = req.body;
    if (!prompt || !imageUrl) return res.status(400).json({ error: "A prompt and imageUrl are required." });

    // Server fetches the image
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBase64 = Buffer.from(imageResponse.data).toString('base64');

    // Server sends the question and image to the Hugging Face API using axios
    const hfResponse = await axios.post(VQA_API_URL, {
      inputs: {
        question: prompt,
        image: imageBase64
      }
    }, {
      headers: { "Authorization": `Bearer ${process.env.HF_TOKEN}` }
    });

    res.json({ answer: hfResponse.data[0].answer });

  } catch (error) {
    console.error("FULL ERROR OBJECT:", error);
    res.status(500).json({ error: "Something went wrong. Check the logs." });
  }
});

// 5. Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});