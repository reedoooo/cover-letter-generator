const { Component, Revision } = require("../models/Component");
const { generateNewComponent, reviseComponent } = require("../services/aiService");

exports.createComponent = async (req, res) => {
  const userId = req.user._id;
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt cannot be empty' });
  }

  try {
    const result = await generateNewComponent(prompt);

    const newComponent = new Component({
      code: result,
      authorId: userId,
      prompt: prompt,
      revisions: [{ code: result, prompt: prompt }],
    });

    await newComponent.save();

    return res.status(200).json({
      status: 'success',
      data: {
        componentId: newComponent._id,
      },
    });
  } catch (error) {
    return res.status(400).json({ message: 'Could not create component' });
  }
};
exports.makeRevision = async (req, res) => {
  const userId = req.user._id;
  const { revisionId, prompt } = req.body;

  try {
    const baseRevision = await Revision.findOne({ _id: revisionId }).populate('componentId');

    if (!baseRevision || baseRevision.componentId.authorId.toString() !== userId.toString()) {
      return res.status(400).json({ message: 'No component found' });
    }

    const result = await reviseComponent(prompt, baseRevision.code);

    const newRevision = new Revision({
      code: result,
      prompt: prompt,
      componentId: baseRevision.componentId._id,
    });

    await newRevision.save();

    baseRevision.componentId.code = result;
    baseRevision.componentId.prompt = prompt;
    baseRevision.componentId.revisions.push(newRevision);
    await baseRevision.componentId.save();

    return res.status(200).json({
      status: 'success',
      data: {
        revisionId: newRevision._id,
      },
    });
  } catch (error) {
    return res.status(400).json({ message: 'Could not create revision' });
  }
};
exports.forkRevision = async (req, res) => {
  const userId = req.user._id;
  const { revisionId, includePrevious } = req.body;

  try {
    const component = await Component.findOne({ 'revisions._id': revisionId }).populate('revisions');

    const revisionIndex = component.revisions.findIndex(rev => rev._id.toString() === revisionId);
    if (!component || revisionIndex === -1) {
      return res.status(400).json({ message: 'No revision found' });
    }

    const revisions = (
      includePrevious ? component.revisions.slice(0, revisionIndex + 1) : [component.revisions[revisionIndex]]
    ).map(({ code, prompt }) => ({ code, prompt }));

    if (revisions.length < 1) {
      return res.status(400).json({ message: 'No revision found' });
    }

    if (component.authorId.toString() !== userId.toString() && component.visibility === 'PRIVATE') {
      return res.status(400).json({ message: "You don't have the permission to fork this revision" });
    }

    const newComponent = new Component({
      code: revisions[0].code,
      authorId: userId,
      prompt: revisions[0].prompt,
      revisions: revisions,
    });

    await newComponent.save();

    return res.status(200).json({
      status: 'success',
      data: {
        revisionId: newComponent.revisions[0]._id,
      },
    });
  } catch (error) {
    return res.status(400).json({ message: 'Could not create component' });
  }
};
exports.getComponent = async (req, res) => {
  const { id } = req.params;

  try {
    const component = await Component.findById(id).populate('revisions');

    if (!component) {
      return res.status(400).json({ message: 'No component found' });
    }

    const userId = req.user ? req.user._id : null;

    if (component.authorId.toString() !== userId && component.visibility === 'PRIVATE') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    return res.status(200).json(component);
  } catch (error) {
    return res.status(400).json({ message: 'No component found' });
  }
};
exports.getComponentFromRevision = async (req, res) => {
  const { revisionId } = req.params;

  try {
    const component = await Component.findOne({ 'revisions._id': revisionId }).populate('revisions');

    if (!component) {
      return res.status(400).json({ message: 'No component found' });
    }

    const userId = req.user ? req.user._id : null;

    if (component.authorId.toString() !== userId && component.visibility === 'PRIVATE') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    return res.status(200).json(component);
  } catch (error) {
    return res.status(400).json({ message: 'No component found' });
  }
};
exports.getMyComponents = async (req, res) => {
  const userId = req.user._id;
  const { pageIndex = 0, pageSize = 10 } = req.query;

  try {
    const componentCount = await Component.countDocuments({ authorId: userId });

    const components = await Component.find({ authorId: userId })
      .populate('revisions')
      .skip(pageSize * pageIndex)
      .limit(pageSize)
      .sort({ createdAt: 'desc' });

    return res.status(200).json({
      status: 'success',
      data: {
        rows: components,
        pageCount: Math.ceil(componentCount / pageSize),
      },
    });
  } catch (error) {
    return res.status(400).json({ message: 'Error fetching components' });
  }
};
exports.importComponent = async (req, res) => {
  const { code, description } = req.body;

  if (!code) {
    return res.status(400).json({ message: 'Invalid code snippet' });
  }

  try {
    const newComponent = new Component({
      code,
      prompt: description,
      revisions: [{ code, prompt: description }],
    });

    await newComponent.save();

    return res.status(200).json({
      status: 'success',
      data: {
        componentId: newComponent._id,
      },
    });
  } catch (error) {
    return res.status(400).json({ message: 'Could not create component' });
  }
};
