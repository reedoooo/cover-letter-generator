const OpenAI = require("openai");

function getOpenaiClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

function createPrompt({
  finalJobTitle,
  finalCompanyName,
  finalJobDescription,
  finalJobRequirements,
  finalQualifications,
  finalCompanyCulture,
  finalBenefits,
  finalSkills,
  pdfText,
}) {
  return `
    Write a professional cover letter for a position of ${finalJobTitle} at ${finalCompanyName}.
    Here are the details:
    - Your Name: [Your Name]
    - Your Address: [Your Address]
    - Your City, State, Zip Code: [City, State, Zip Code]
    - Your Email Address: [Email Address]
    - Your Phone Number: [Phone Number]
    - Date: [Date]
    - Job Title: ${finalJobTitle}
    - Company Name: ${finalCompanyName}
    - Job Description: ${finalJobDescription}
    - Responsibilities: ${finalJobRequirements}
    - Qualifications: ${finalQualifications}
    - Company Culture: ${finalCompanyCulture}
    - Benefits: ${finalBenefits}
    - Highlight the following skills: ${finalSkills}
    - Include details from the following resume: ${pdfText || "Not provided"}
  `;
}

async function fetchOpenAIResponse(prompt) {
  const openaiClient = getOpenaiClient();
  const response = await openaiClient.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: prompt },
    ],
    temperature: 0.5,
    max_tokens: 1024,
    top_p: 1,
    frequency_penalty: 0.5,
    presence_penalty: 0,
  });

  return response.choices[0].message.content.trim();
}

module.exports = {
  getOpenaiClient,
  createPrompt,
  fetchOpenAIResponse,
};
