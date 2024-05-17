/**
 * config/index.js
 */

const path = require("path");
const development = require("./env/development");
const test = require("./env/test");
const production = require("./env/production");
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const defaults = {
  root: path.normalize(__dirname + "/.."),
  api: {
    port: process.env.PORT || 3002,
    openAIKey: process.env.OPENAI_API_KEY,
  },
  openai,
};
/**
 * Expose
 */

module.exports = {
  development: Object.assign({}, development, defaults),
  test: Object.assign({}, test, defaults),
  production: Object.assign({}, production, defaults),
}[process.env.NODE_ENV || "development"];
