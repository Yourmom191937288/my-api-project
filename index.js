// 1. Import necessary libraries
const express = require('express');
const cors = require('cors'); // To handle cross-origin requests from the browser
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config(); // To load your secret API key from the .env file

// 2. Configure the server
const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cors()); // Middleware to allow browser requests from any origin

// 3. Initialize the Google AI Client
// The API key is loaded securely from your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 4. Create your API endpoint
app.post('/solve-math', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Get the math problem from the request sent by the browser
    const userProblem = req.body.problem;

    // Basic validation: make sure a problem was sent
    if (!userProblem) {
      return res.status(400).json({ error: "No problem provided." });
    }
    
    // Send the problem to the Gemini API
    const result = await model.generateContent(userProblem);
    const response = await result.response;
    const aiAnswer = response.text();

    // Send the AI's final answer back to the browser
    console.log(`Problem: "${userProblem}" | Answer: "${aiAnswer}"`);
    res.json({ answer: aiAnswer });

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Something went wrong on the server." });
  }
});

// 5. Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});