
const axios = require('axios');

async function openAIGenerateQuiz(qualification) {
  const apiKey = process.env.OPENAI_API_KEY;
  const prompt = `Generate a short aptitude and interest quiz (3-5 questions, each with 3-5 options) for an Indian student who has just passed class ${qualification}.
- If ${qualification} is 10th: focus on identifying interests to suggest Class 11/12 streams (Science, Commerce, Arts).
- If ${qualification} is 12th: focus on suggesting suitable undergraduate degree streams, but allow flexibility.
- Include 1–3 questions about preferred subjects/interests for stream selection, and 1–2 questions about broader career or field interests.
- Return strictly as a JSON array of objects with 'question' and 'options' fields.`;
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      },
      { headers: { 'Authorization': `Bearer ${apiKey}` } }
    );
    let text = response.data.choices[0].message.content;
    text = text.replace(/^```json|^```|```$/gim, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error('OpenAI quiz error:', err.response?.data || err.message);
    return null;
  }
}

async function deepseekGenerateQuiz(qualification) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const prompt = `Generate a short aptitude and interest quiz (3-5 questions, each with 3-5 options) for an Indian student who has just passed class ${qualification}.
- If ${qualification} is 10th: focus on identifying interests to suggest Class 11/12 streams (Science, Commerce, Arts).
- If ${qualification} is 12th: focus on suggesting suitable undergraduate degree streams, but allow flexibility.
- Include 1–3 questions about preferred subjects/interests for stream selection, and 1–2 questions about broader career or field interests.
- Return strictly as a JSON array of objects with 'question' and 'options' fields.`;
  try {
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      },
      { headers: { 'Authorization': `Bearer ${apiKey}` } }
    );
    let text = response.data.choices[0].message.content;
    text = text.replace(/^```json|^```|```$/gim, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error('DeepSeek quiz error:', err.response?.data || err.message);
    return null;
  }
}

async function geminiGenerateQuiz(qualification) {
  const apiKey = process.env.GEMINI_API_KEY;
  const prompt = `Generate a short aptitude and interest quiz (3-5 questions, each with 3-5 options) for an Indian student who has just passed class ${qualification}.
- If ${qualification} is 10th: focus on identifying interests to suggest Class 11/12 streams (Science, Commerce, Arts).
- If ${qualification} is 12th: focus on suggesting suitable undergraduate degree streams, but allow flexibility.
- Include 1–3 questions about preferred subjects/interests for stream selection, and 1–2 questions about broader career or field interests.
- Return strictly as a JSON array of objects with 'question' and 'options' fields.`;
  const modelName = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  const data = { contents: [{ parts: [{ text: prompt }] }] };
  try {
    const response = await axios.post(url, data);
    let text = response.data.candidates[0].content.parts[0].text;
    text = text.replace(/^```json|^```|```$/gim, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error('Gemini quiz error:', err.response?.data || err.message);
    return null;
  }
}

async function generateQuiz(qualification) {
  // Try OpenAI first
  let result = await openAIGenerateQuiz(qualification);
  if (result) return result;
  // Fallback to Gemini
  result = await geminiGenerateQuiz(qualification);
  if (result) return result;
  // Fallback to DeepSeek
  result = await deepseekGenerateQuiz(qualification);
  return result;
}

async function openAICareerSuggestion(qualification, answers) {
  const apiKey = process.env.OPENAI_API_KEY;
  const prompt = `A student who passed class ${qualification} answered the following quiz: ${JSON.stringify(answers)}.\nSuggest the most suitable streams, degree programs, and detailed career paths (with course-to-career mapping) for this student.\nFor each suggested career path, also generate a mermaid.js flowchart code block (in markdown) that visually represents the step-by-step roadmap from 12th/10th to the job, including key courses, degrees, and milestones.\nGive an in-depth explanation for each suggestion in JSON format, and include the mermaid code as a separate field in each career path.`;
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      },
      { headers: { 'Authorization': `Bearer ${apiKey}` } }
    );
    let text = response.data.choices[0].message.content;
    text = text.replace(/^```json|^```|```$/gim, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error('OpenAI suggestion error:', err.response?.data || err.message);
    return null;
  }
}

async function deepseekCareerSuggestion(qualification, answers) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const prompt = `A student who passed class ${qualification} answered the following quiz: ${JSON.stringify(answers)}.\nSuggest the most suitable streams, degree programs, and detailed career paths (with course-to-career mapping) for this student.\nFor each suggested career path, also generate a mermaid.js flowchart code block (in markdown) that visually represents the step-by-step roadmap from 12th/10th to the job, including key courses, degrees, and milestones.\nGive an in-depth explanation for each suggestion in JSON format, and include the mermaid code as a separate field in each career path.`;
  try {
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      },
      { headers: { 'Authorization': `Bearer ${apiKey}` } }
    );
    let text = response.data.choices[0].message.content;
    text = text.replace(/^```json|^```|```$/gim, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error('DeepSeek suggestion error:', err.response?.data || err.message);
    return null;
  }
}

async function geminiCareerSuggestion(qualification, answers) {
  const apiKey = process.env.GEMINI_API_KEY;
  const prompt = `A student who passed class ${qualification} answered the following quiz: ${JSON.stringify(answers)}.\nSuggest the most suitable streams, degree programs, and detailed career paths (with course-to-career mapping) for this student.\nFor each suggested career path, also generate a mermaid.js flowchart code block (in markdown) that visually represents the step-by-step roadmap from 12th/10th to the job, including key courses, degrees, and milestones.\nGive an in-depth explanation for each suggestion in JSON format, and include the mermaid code as a separate field in each career path.`;
  const modelName = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  const data = { contents: [{ parts: [{ text: prompt }] }] };
  try {
    const response = await axios.post(url, data);
    let text = response.data.candidates[0].content.parts[0].text;
    text = text.replace(/^```json|^```|```$/gim, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error('Gemini suggestion error:', err.response?.data || err.message);
    return null;
  }
}

async function careerSuggestion(qualification, answers) {
  // Try OpenAI first
  let result = await openAICareerSuggestion(qualification, answers);
  if (result) return result;
  // Fallback to Gemini
  result = await geminiCareerSuggestion(qualification, answers);
  if (result) return result;
  // Fallback to DeepSeek
  result = await deepseekCareerSuggestion(qualification, answers);
  return result;
}

module.exports = {
  geminiGenerateQuiz: generateQuiz,
  geminiCareerSuggestion: careerSuggestion
};
