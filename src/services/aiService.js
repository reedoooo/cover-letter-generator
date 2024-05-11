const openai = require("../config/openaiClient");
exports.generateCoverLetter = async (
  url,
  yourName,
  address,
  cityStateZip,
  emailAddress,
  todayDate,
  employerName,
  companyName,
  companyAddress,
  companyCityStateZip,
  jobTitle,
  previousPosition,
  previousCompany,
  skills,
  softwarePrograms,
  reasons
) => {
  console.log(
    "Generating cover letter...",
    jobTitle,
    companyName,
    skills,
    reasons
  );

  const prompt = `Write a professional cover letter for a position of ${jobTitle} at ${companyName}. Highlight the following skills: ${skills}. Express enthusiasm for the role because: ${reasons}.`;
  // const prompt = `Write a professional cover letter for a position of ${jobTitle} at ${companyName}. Highlight the following skills: ${skills}. Express enthusiasm for the role because: ${reasons}.:
  // Name: ${yourName},
  // Address: ${address}, ${cityStateZip},
  // Email: ${emailAddress},
  // Date: ${todayDate},
  // Employer's Name: ${employerName},
  // Company Name: ${companyName},
  // Company Address: ${companyAddress}, ${companyCityStateZip},
  
  // Dear ${employerName},
  
  // I am writing to express my interest in the position of ${jobTitle} at ${companyName}. As an experienced ${previousPosition} with a strong background in ${skills}, particularly with ${softwarePrograms}, I am excited about the opportunity to contribute my skills and expertise to the team at ${companyName}. In my previous role at ${previousCompany}, I was responsible for ${reasons}.
  
  // Thank you for considering my application. I look forward to the possibility of discussing this exciting opportunity with you.
  
  // Sincerely,
  // ${yourName}`;

  try {
    const response = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: prompt,
      temperature: 0.5,
      max_tokens: 1024,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
    });
    console.log(response.choices[0].text);
    const generatedText = response.choices[0].text;
    return generatedText;
  } catch (error) {
    console.error("Error generating cover letter:", error);
    if (error.response && error.response.status === 429) {
      console.error("Rate limit exceeded, retrying...");
      // Implement retry logic here or handle the rate limit gracefully
    } else if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
};
