require("dotenv").config();

module.exports = {
  api: {
    port: process.env.PORT || 3001,
    openAIKey: process.env.OPENAI_API_KEY,
  },
  openAi: {
    model: "text-davinci-003",
    temperature: 0.5,
    max_tokens: 2048,
    top_p: 1,
    frequency_penalty: 0.5,
    presence_penalty: 0,
  },
  chatEngine: {
    projectId: process.env.PROJECT_ID,
    botUserName: process.env.BOT_USER_NAME,
    botUserSecret: process.env.BOT_USER_SECRET,
  },
};
