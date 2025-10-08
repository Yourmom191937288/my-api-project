const fetch = require('node-fetch'); // Uses the node-fetch library
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// --- ENDPOINT #1: TEXT SOLVER ---
app.post('/solve-math', async (req, res) => {
  try {
    const TEXT_API_URL = "https://api-inference.huggingface.co/models/google/gemma-2b-it";
    const userProblem = req.body.problem;
    if (!userProblem) return res.status(400).json({ error: "No problem provided." });

    const response = await fetch(TEXT_API_URL, {
      headers: { "Authorization": `Bearer ${process.env.HF_TOKEN}` },
      method: "POST",
      body: JSON.stringify({ inputs: userProblem }),
    });

    if (!response.ok) throw new Error(await response.text());
    const result = await response.json();
    res.json({ answer: result[0].generated_text });
  } catch (error) {
    console.error("Error calling Hugging Face Text API:", error);
    res.status(500).json({ error: "Something went wrong on the server." });
  }
});

// --- ENDPOINT #2: IMAGE READER (FROM URL) ---
app.post('/read-image-from-url', async (req, res) => {
  try {
    const VQA_API_URL = "https://api-inference.huggingface.co/models/Salesforce/blip-vqa-base";
    const { prompt, imageUrl } = req.body;
    if (!prompt || !imageUrl) return res.status(400).json({ error: "A prompt and imageUrl are required." });

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) throw new Error(`Failed to fetch image. Status: ${imageResponse.status}`);

    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');

    const hfResponse = await fetch(VQA_API_URL, {
      headers: {
        "Authorization": `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({
        inputs: {
          question: prompt,
          image: imageBase64
        }
      }),
    });

    if (!hfResponse.ok) throw new Error(await hfResponse.text());
    const result = await hfResponse.json();
    res.json({ answer: result[0].answer });

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
});