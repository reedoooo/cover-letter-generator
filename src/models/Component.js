// models/Component.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RevisionSchema = new Schema({
  code: String,
  prompt: String,
  createdAt: { type: Date, default: Date.now },
});

const ComponentSchema = new Schema({
  code: String,
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  prompt: String,
  revisions: [RevisionSchema],
  visibility: { type: String, enum: ['PUBLIC', 'PRIVATE'], default: 'PUBLIC' },
});

const Component = mongoose.model('Component', ComponentSchema);
const Revision = mongoose.model('Revision', RevisionSchema);

module.exports = { Component, Revision };
