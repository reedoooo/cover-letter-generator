const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  applicationData: [
    {
      type: String,
      required: true,
      enum: ['Resume', 'Cover Letter', 'Portfolio'],
    },
  ],
  notes: {
    type: String,
    required: true,
  },
  noteStatus: {
    type: Boolean,
    required: true,
  },
  submittedDate: {
    type: Date,
    required: true,
  },
  progress: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  status: {
    type: String,
    required: true,
    enum: ['In Progress', 'Approved', 'Pending', 'Rejected'],
  },
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

module.exports = JobApplication;
