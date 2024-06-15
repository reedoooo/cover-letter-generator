const fs = require("fs");
const path = require("path");
const logger = require("../config/winston");
const { generateChatResponse } = require("../services/aiService");
const User = require("../models/User");
const { default: mongoose } = require("mongoose");
exports.generate = async (req, res) => {
  const formData = req.body;
  const modelData = formData.modelData;
  const { apiKey, model, inputCode, maxTokens, temperature } = modelData;
  const message = formData.message;
	if (!message) {
    throw new Error("message is missing");
  }
  // if (!apiKey) {
  //   throw new Error("API key is missing");
  // }

  // if (!inputCode) {
  //   throw new Error("Input code is missing");
  // }

  // const maxCodeLength = model === "gpt-3.5-turbo" ? 700 : 700;
  // if (inputCode.length > maxCodeLength) {
  //   throw new Error(
  //     `Input code is too long. Maximum length is ${maxCodeLength} characters.`
  //   );
  // }

  try {
    const result = await generateChatResponse({
      message,
      // apiKey,
      // model,
      // inputCode,
      // maxTokens,
      // temperature,
      // topP,
      // topK,
      // presencePenalty,
      // frequencyPenalty,
      // n,
      // stream,
      // stop,
      // echo,
    });
    if (!result) {
      const error = await result.json();
      logger.error(error);
      throw new Error("Failed to generate chat response");
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
