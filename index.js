// 1. Import necessary libraries
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const axios = require('axios');

// 2. Configure the server
const app = express();
app.use(express.json());
app.use(cors());

// --- VISUAL QUESTION ANSWERING (BLIP VQA) ENDPOINT ---
app.post('/read-image-from-url', async (req, res) => {
  try {
    const IMAGE_API_URL = "https://api-inference.huggingface.co/models/Salesforce/blip-vqa-base";
    const { prompt, imageUrl } = req.body;

    if (!prompt || !imageUrl) {
      return res.status(400).json({ error: "A prompt and imageUrl are required." });
    }

    // STEP 1: Your server downloads the image from the URL
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageData = imageResponse.data;

    // STEP 2: Your server sends the image DATA and the prompt to the BLIP model
    // The BLIP VQA API expects the prompt to be part of the URL parameters
    const response = await axios.post(
      `${IMAGE_API_URL}?question=${encodeURIComponent(prompt)}`, // Prompt is in the URL
      imageData, // Image data is the body
      {
        headers: {
          "Authorization": `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": imageResponse.headers['content-type']
        }
      }
    );
    
    const result = response.data;
    const aiAnswer = result[0].answer;

    res.json({ answer: aiAnswer });
  } catch (error) {
    console.error("Error in /read-image-from-url:", error.message);
    res.status(500).json({ error: "Something went wrong." });
  }
});

// 3. Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
