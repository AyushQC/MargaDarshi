const axios = require('axios');

async function getAiSuggestion(prompt) {
  const HF_TOKEN = process.env.HF_TOKEN; // Add your Hugging Face token to .env
  const model = 'meta-llama/Llama-3.1-8B-Instruct'; // Or any other open model
  const url = 'https://router.huggingface.co/v1/chat/completions';

  const data = {
    model,
    messages: [
      { role: 'system', content: 'You are a career guidance expert for Indian students.' },
      { role: 'user', content: prompt }
    ]
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.choices[0].message.content;
  } catch (err) {
    console.error('AI API error:', err.response?.data || err.message);
    return 'Sorry, unable to generate a suggestion at this time.';
  }
}

module.exports = { getAiSuggestion };
