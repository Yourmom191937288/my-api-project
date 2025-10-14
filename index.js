const express = require('express');
const fetch = require('node-fetch'); // to call Puter API
const app = express();

app.use(express.json());
app.use(express.static('public')); // serve HTML

// Proxy endpoint
app.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;

    // Call Puter API (replace with actual API endpoint & headers)
    const response = await fetch('https://api.puter.com/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PUTER_API_KEY}` // store key in Render secrets
      },
      body: JSON.stringify({
        model: "gpt-5-nano",
        prompt: question
      })
    });

    const data = await response.json();
    res.json(data); // send back to browser
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('Server running'));
