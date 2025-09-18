const axios = require('axios');

// --- QUIZ GENERATION ---

async function openAIGenerateQuiz(qualification) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const prompt = `Generate a short aptitude and interest quiz (3-5 questions, each with 3-5 options) for an Indian student who has just passed class ${qualification}.
- If ${qualification} is 10th: focus on identifying interests to suggest Class 11/12 streams (Science, Commerce, Arts).
- If ${qualification} is 12th: focus on suggesting suitable undergraduate degree streams.
- Return strictly as a JSON array of objects with 'question' and 'options' fields.`;
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      { model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: prompt }], temperature: 0.7 },
      { headers: { 'Authorization': `Bearer ${apiKey}` } }
    );
    let text = response.data.choices[0].message.content;
    text = text.replace(/^```json|^```|```$/gim, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error('OpenAI quiz error:', err.response?.data?.error?.message || err.message);
    return null;
  }
}

async function geminiGenerateQuiz(qualification) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const prompt = `Generate a short aptitude and interest quiz (3-5 questions, each with 3-5 options) for an Indian student who has just passed class ${qualification}.
- If ${qualification} is 10th: focus on identifying interests to suggest Class 11/12 streams (Science, Commerce, Arts).
- If ${qualification} is 12th: focus on suggesting suitable undergraduate degree streams.
- Return strictly as a JSON array of objects with 'question' and 'options' fields.`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  try {
    const response = await axios.post(url, { contents: [{ parts: [{ text: prompt }] }] });
    let text = response.data.candidates[0].content.parts[0].text;
    text = text.replace(/^```json|^```|```$/gim, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error('Gemini quiz error:', err.response?.data?.error?.message || err.message);
    return null;
  }
}

async function deepseekGenerateQuiz(qualification) {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return null;
    const prompt = `Generate a short aptitude and interest quiz (3-5 questions, each with 3-5 options) for an Indian student who has just passed class ${qualification}.
  - If ${qualification} is 10th: focus on identifying interests to suggest Class 11/12 streams (Science, Commerce, Arts).
  - If ${qualification} is 12th: focus on suggesting suitable undergraduate degree streams.
  - Return strictly as a JSON array of objects with 'question' and 'options' fields.`;
    try {
      const response = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        { model: 'deepseek-chat', messages: [{ role: 'user', content: prompt }], temperature: 0.7 },
        { headers: { 'Authorization': `Bearer ${apiKey}` } }
      );
      let text = response.data.choices[0].message.content;
      text = text.replace(/^```json|^```|```$/gim, '').trim();
      return JSON.parse(text);
    } catch (err) {
      console.error('DeepSeek quiz error:', err.response?.data?.error?.message || err.message);
      return null;
    }
}

async function generateQuiz(qualification) {
  let result = await openAIGenerateQuiz(qualification);
  if (result) return result;
  console.log("OpenAI failed, trying Gemini...");
  result = await geminiGenerateQuiz(qualification);
  if (result) return result;
  console.log("Gemini failed, trying DeepSeek...");
  result = await deepseekGenerateQuiz(qualification);
  return result;
}


// --- STEP 1: Get Career Titles ---

async function openAICareerTitles(qualification, answers) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;
    const prompt = `
A student who passed class ${qualification} answered a quiz with these answers: ${JSON.stringify(answers)}.
Based on these interests, suggest the top 3 most suitable career fields.
Return ONLY a valid JSON array of strings, without any markdown formatting or other text.
Example: ["Software Engineer", "Data Analyst", "UX Designer"]
`;
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            { model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: prompt }], temperature: 0.5 },
            { headers: { 'Authorization': `Bearer ${apiKey}` } }
        );
        let text = response.data.choices[0].message.content;
        text = text.replace(/^```json|^```|```$/gim, '').trim();
        return JSON.parse(text);
    } catch (err) {
        console.error('OpenAI titles error:', err.response?.data?.error?.message || err.message);
        return null;
    }
}

async function geminiCareerTitles(qualification, answers) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    const prompt = `
A student who passed class ${qualification} answered a quiz with these answers: ${JSON.stringify(answers)}.
Based on these interests, suggest the top 3 most suitable career fields.
Return ONLY a valid JSON array of strings, without any markdown formatting or other text.
Example: ["Software Engineer", "Data Analyst", "UX Designer"]
`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    try {
        const response = await axios.post(url, { contents: [{ parts: [{ text: prompt }] }] });
        let text = response.data.candidates[0].content.parts[0].text;
        text = text.replace(/^```json|^```|```$/gim, '').trim();
        return JSON.parse(text);
    } catch (err) {
        console.error('Gemini titles error:', err.response?.data?.error?.message || err.message);
        return null;
    }
}

async function deepseekCareerTitles(qualification, answers) {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return null;
    const prompt = `
A student who passed class ${qualification} answered a quiz with these answers: ${JSON.stringify(answers)}.
Based on these interests, suggest the top 3 most suitable career fields.
Return ONLY a valid JSON array of strings, without any markdown formatting or other text.
Example: ["Software Engineer", "Data Analyst", "UX Designer"]
`;
    try {
        const response = await axios.post(
            'https://api.deepseek.com/v1/chat/completions',
            { model: 'deepseek-chat', messages: [{ role: 'user', content: prompt }], temperature: 0.5 },
            { headers: { 'Authorization': `Bearer ${apiKey}` } }
        );
        let text = response.data.choices[0].message.content;
        text = text.replace(/^```json|^```|```$/gim, '').trim();
        return JSON.parse(text);
    } catch (err) {
        console.error('DeepSeek titles error:', err.response?.data?.error?.message || err.message);
        return null;
    }
}

async function getCareerTitles(qualification, answers) {
    let result = await openAICareerTitles(qualification, answers);
    if (result) return result;
    console.log("OpenAI failed for titles, trying Gemini...");
    result = await geminiCareerTitles(qualification, answers);
    if (result) return result;
    console.log("Gemini failed for titles, trying DeepSeek...");
    result = await deepseekCareerTitles(qualification, answers);
    return result;
}


// --- STEP 2: Get Career Details ---

async function openAICareerDetails(careerTitle, qualification) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;
    const prompt = `
You are an expert career counselor for Indian students. A student who has passed Class ${qualification} is interested in becoming a "${careerTitle}".
Generate a detailed, structured career roadmap for them.

The JSON output MUST adhere to the exact structure below. Do NOT include any markdown formatting (like \`\`\`json), introductory text, or explanations outside of the JSON structure.

{
  "description": "A brief, engaging summary of what a ${careerTitle} does, tailored to an Indian context.",
  "degree_programs": [
    "List of 2-4 suitable undergraduate degrees in India (e.g., 'B.Tech in Computer Science', 'B.Sc. in Physics')."
  ],
  "course_to_career_mapping": [
    "A list of 3-5 key subjects or skills learned during the degree that are directly applicable to this career."
  ],
  "mermaid_code": "A functional Mermaid.js 'graph TD' flowchart string that visualizes the path from school to job. Start with 'Class ${qualification}' and end with 'Job as ${careerTitle}'. Include key milestones like 'Entrance Exam (e.g., JEE)', 'Undergraduate Degree', and 'Key Skills'."
}
`;
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            { model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: prompt }], temperature: 0.6 },
            { headers: { 'Authorization': `Bearer ${apiKey}` } }
        );
        let text = response.data.choices[0].message.content;
        text = text.replace(/^```json|^```|```$/gim, '').trim();
        return JSON.parse(text);
    } catch (err) {
        console.error('OpenAI details error:', err.response?.data?.error?.message || err.message);
        return null;
    }
}

async function geminiCareerDetails(careerTitle, qualification) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    const prompt = `
You are an expert career counselor for Indian students. A student who has passed Class ${qualification} is interested in becoming a "${careerTitle}".
Generate a detailed, structured career roadmap for them.

The JSON output MUST adhere to the exact structure below. Do NOT include any markdown formatting (like \`\`\`json), introductory text, or explanations outside of the JSON structure.

{
  "description": "A brief, engaging summary of what a ${careerTitle} does, tailored to an Indian context.",
  "degree_programs": [
    "List of 2-4 suitable undergraduate degrees in India (e.g., 'B.Tech in Computer Science', 'B.Sc. in Physics')."
  ],
  "course_to_career_mapping": [
    "A list of 3-5 key subjects or skills learned during the degree that are directly applicable to this career."
  ],
  "mermaid_code": "A functional Mermaid.js 'graph TD' flowchart string that visualizes the path from school to job. Start with 'Class ${qualification}' and end with 'Job as ${careerTitle}'. Include key milestones like 'Entrance Exam (e.g., JEE)', 'Undergraduate Degree', and 'Key Skills'."
}
`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    try {
        const response = await axios.post(url, { contents: [{ parts: [{ text: prompt }] }] });
        let text = response.data.candidates[0].content.parts[0].text;
        text = text.replace(/^```json|^```|```$/gim, '').trim();
        return JSON.parse(text);
    } catch (err) {
        console.error('Gemini details error:', err.response?.data?.error?.message || err.message);
        return null;
    }
}

async function deepseekCareerDetails(careerTitle, qualification) {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) return null;
    const prompt = `
You are an expert career counselor for Indian students. A student who has passed Class ${qualification} is interested in becoming a "${careerTitle}".
Generate a detailed, structured career roadmap for them.

The JSON output MUST adhere to the exact structure below. Do NOT include any markdown formatting (like \`\`\`json), introductory text, or explanations outside of the JSON structure.

{
  "description": "A brief, engaging summary of what a ${careerTitle} does, tailored to an Indian context.",
  "degree_programs": [
    "List of 2-4 suitable undergraduate degrees in India (e.g., 'B.Tech in Computer Science', 'B.Sc. in Physics')."
  ],
  "course_to_career_mapping": [
    "A list of 3-5 key subjects or skills learned during the degree that are directly applicable to this career."
  ],
  "mermaid_code": "A functional Mermaid.js 'graph TD' flowchart string that visualizes the path from school to job. Start with 'Class ${qualification}' and end with 'Job as ${careerTitle}'. Include key milestones like 'Entrance Exam (e.g., JEE)', 'Undergraduate Degree', and 'Key Skills'."
}
`;
    try {
        const response = await axios.post(
            'https://api.deepseek.com/v1/chat/completions',
            { model: 'deepseek-chat', messages: [{ role: 'user', content: prompt }], temperature: 0.6 },
            { headers: { 'Authorization': `Bearer ${apiKey}` } }
        );
        let text = response.data.choices[0].message.content;
        text = text.replace(/^```json|^```|```$/gim, '').trim();
        return JSON.parse(text);
    } catch (err) {
        console.error('DeepSeek details error:', err.response?.data?.error?.message || err.message);
        return null;
    }
}

async function getCareerDetails(careerTitle, qualification) {
    let result = await openAICareerDetails(careerTitle, qualification);
    if (result) return result;
    console.log("OpenAI failed for details, trying Gemini...");
    result = await geminiCareerDetails(careerTitle, qualification);
    if (result) return result;
    console.log("Gemini failed for details, trying DeepSeek...");
    result = await deepseekCareerDetails(careerTitle, qualification);
    return result;
}


module.exports = { 
    geminiGenerateQuiz: generateQuiz, // Keep original name for compatibility
    getCareerTitles,
    getCareerDetails,
    geminiCareerSuggestion: getCareerTitles // Legacy support
};
