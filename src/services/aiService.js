const openai = require("../config/openaiClient");
exports.generateCoverLetter = async (
  url,
  yourName,
  address,
  cityStateZip,
  emailAddress,
  phoneNumber,
  todayDate,
  employerName,
  hiringManagerName,
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
    const generatedTextResponse = response.choices[0].text.trim();
    console.log("Generated cover letter:", generatedTextResponse);
    const placeholders = {
      "[Your Name]": yourName,
      "[Address]": address,
      "[City, State ZIP Code]": cityStateZip,
      "[Email Address]": emailAddress,
      "[Phone Number]": phoneNumber,
      "[Today’s Date]": todayDate,
      "[Employer Name]": employerName,
      "[Hiring Manager Name]": hiringManagerName,
      "[Company Name]": companyName,
      "[Company Address]": companyAddress,
      "[Company City, State ZIP Code]": companyCityStateZip,
      "[Job Title]": jobTitle,
      "[Previous Position]": previousPosition,
      "[Previous Company]": previousCompany,
      "[Skills]": skills,
      "[Software Programs]": softwarePrograms,
      "[Reasons]": reasons,
    };
    // Replace placeholders with actual values
    const generatedText = generatedTextResponse.replace(
      /\[.*?\]/g,
      (match) => placeholders[match]
    );

    // Object.keys(placeholders).forEach((key) => {
    //   generatedText = generatedText.replace(
    //     new RegExp(key, "g"),
    //     placeholders[key]
    //   );
    // });
    console.log("Generated cover letter:", generatedText);
    const coverLetterHtml = `<p>${generatedText.replace(/\n/g, "</p><p>")}</p>`;

    // Convert the generated text into Draft.js RawDraftContentState
    const draftContentState = {
      entityMap: {},
      blocks: generatedText.split("\n").map((text, index) => ({
        key: `block${index}`,
        text: text,
        type: "unstyled",
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: {},
      })),
    };
    return {
      coverLetterHtml,
      draftContentState,
    };
    // return generatedText;
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
