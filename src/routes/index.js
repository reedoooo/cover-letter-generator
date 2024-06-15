const userRoutes = require('./userRoutes');
const coverLetterRoutes = require('./coverLetterRoutes');
const chatRoutes = require('./chatRoutes');
const chatCodeRoutes = require('./chatCodeRoutes');
const templateGeneratorRoutes = require('./templateGeneratorRoutes');

const setupRoutes = app => {
  app.use('/api/user', userRoutes);
  app.use('/api/cover-letter', coverLetterRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/chat/code-chat/components', chatCodeRoutes);
  app.use('/api/chat/template-generator/templates', templateGeneratorRoutes);
  // app.use('/api/blog', chatRoutes);
  // app.use('/api/theme', chatRoutes);
  // app.use('/api/template', chatRoutes);
  // app.use('/api/codeStyles', chatRoutes);
};

module.exports = setupRoutes;
