const { TemplateRevision, Template } = require('../models/Template');
const { fetchOpenAIResponse } = require('../utils');

// Controllers
exports.createTemplate = async (req, res) => {
  const userId = req.user._id;

  const fileUpload = req.file;

  const { title, prompt, context, description, tags, status, rating } = req.body;
  const siteLinks = context.websites;
  const textSnippets = context.textSnippets;
  if (!prompt) {
    throw new Error('Prompt is required');
  }

  try {
    const generatedPrompt = createPrompt({ generatorTitle: 'createTemplatePrompt', data: { prompt, context } });
    const result = await fetchOpenAIResponse(generatedPrompt);
    const newTemplate = new Template({
      title,
      assistant: 'default',
      prompt: result,
      context,
      description,
      tags,
      status,
      rating,
    });

    await newTemplate.save();

    return res.status(200).json({
      status: 'success',
      data: {
        templateId: newTemplate._id,
      },
    });
  } catch (error) {
    logger.error(`Error creating template: ${error.message}`);
    return res.status(400).json({
      message: 'Could not create template',
      error: error.message,
    });
  }
};

exports.reviseTemplate = async (req, res) => {
  const userId = req.user._id;
  const { revisionId, prompt, context } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt cannot be empty' });
  }

  try {
    const baseRevision = await Revised.findOne({ _id: revisionId }).populate('templateId');

    if (!baseRevision || baseRevision.templateId.authorId.toString() !== userId.toString()) {
      return res.status(400).json({ message: 'No template found or unauthorized access' });
    }

    const generatedPrompt = createPrompt({
      generatorTitle: 'reviseTemplatePrompt',
      data: { prompt, context, baseTemplate: baseRevision.templateId.prompt },
    });
    const result = await fetchOpenAIResponse(generatedPrompt);

    const newRevision = new Revised({
      templateId: baseRevision.templateId._id,
      userId,
      prompt,
      context,
    });

    await newRevision.save();
    await baseRevision.templateId.save();

    return res.status(200).json({
      status: 'success',
      data: {
        revisionId: newRevision._id,
      },
    });
  } catch (error) {
    return res.status(400).json({ message: 'Could not create revision', error: error.message });
  }
};
