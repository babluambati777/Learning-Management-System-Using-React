const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema(
  {
    batchName: {
      type: String,
      required: [true, 'Please provide batch name'],
      trim: true,
      unique: true,
    },
    batchCode: {
      type: String,
      required: [true, 'Please provide batch code'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide end date'],
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Remove the duplicate index lines - they're already created by unique: true
// Only add indexes if needed for queries, not for unique fields

const Batch = mongoose.model('Batch', batchSchema);

module.exports = Batch;