const mongoose = require('mongoose');

const markSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Please provide student reference'],
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: [true, 'Please provide batch reference'],
    },
    subject: {
      type: String,
      required: [true, 'Please provide subject name'],
      trim: true,
    },
    marksObtained: {
      type: Number,
      required: [true, 'Please provide marks obtained'],
      min: 0,
      max: 100,
    },
    totalMarks: {
      type: Number,
      required: [true, 'Please provide total marks'],
      min: 1,
      max: 100,
    },
    examType: {
      type: String,
      enum: ['Quiz', 'Assignment', 'Midterm', 'Final', 'Project', 'Other'],
      default: 'Assignment',
    },
    examDate: {
      type: Date,
      required: [true, 'Please provide exam date'],
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for percentage
markSchema.virtual('percentage').get(function () {
  return ((this.marksObtained / this.totalMarks) * 100).toFixed(2);
});

// Virtual for grade
markSchema.virtual('grade').get(function () {
  const percentage = (this.marksObtained / this.totalMarks) * 100;
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'F';
});

// Remove duplicate index declarations

// Ensure virtuals are included in JSON
markSchema.set('toJSON', { virtuals: true });
markSchema.set('toObject', { virtuals: true });

const Mark = mongoose.model('Mark', markSchema);

module.exports = Mark;