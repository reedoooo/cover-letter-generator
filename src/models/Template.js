// models/Component.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TemplateRevisionSchema = new Schema({
  code: String,
  prompt: String,
  createdAt: { type: Date, default: Date.now },
});

const TemplateSchema = new Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  assistant: String,
  prompt: Object,
  context: {
    file: {
      fileName: String,
      fileId: String,
      fileType: {
        type: String,
        enum: ['txt', 'pdf', 'md', 'js', 'jsx', 'css', 'json', 'html', 'tsx', 'ts'],
      },
      fileContent: String,
    },
    text: {
      textType: {
        type: String,
        enum: ['code', 'markdown', 'plaintext', 'html'],
      },
      textContent: String,
    },
    image: {
      imageType: {
        type: String,
        enum: ['png', 'jpg', 'jpeg', 'gif', 'svg'],
      },
      imageContent: String,
    },
    websites: [
      {
        type: String,
        validate: {
          validator: function (v) {
            return /^(http|https):\/\/[^ "]+$/.test(v);
          },
          message: props => `${props.value} is not a valid URL!`,
        },
      },
    ],
  },
  description: String,
  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  revisions: [TemplateRevisionSchema],
});
// const Template = mongoose.model('Component', TemplateSchema);
// const Revised = mongoose.model('Revision', RevisionSchema);

module.exports = {
  TemplateSchema: TemplateSchema,
  TemplateRevisionSchema: TemplateRevisionSchema,
  Template: mongoose.model('Template', TemplateSchema),
  TemplateRevision: mongoose.model('TemplateRevision', TemplateRevisionSchema),
};
