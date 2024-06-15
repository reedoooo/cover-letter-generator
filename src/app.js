require('dotenv').config();
const express = require('express');
const { unifiedErrorHandler } = require('./middlewares/unifiedErrorHandler');
const setupRoutes = require('./routes');
const middlewares = require('./middlewares');

const app = express();

// Setup middlewares
middlewares(app);

// Setup routes
setupRoutes(app);

// Error handling middleware
app.use(unifiedErrorHandler);

module.exports = app;
