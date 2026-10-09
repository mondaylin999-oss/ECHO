// Vercel serverless entry: wraps the compiled Express app (see vercel.json).
const { createApp } = require("../dist/app");
const { loadContent } = require("../dist/services/contentStore");

module.exports = createApp(loadContent());
