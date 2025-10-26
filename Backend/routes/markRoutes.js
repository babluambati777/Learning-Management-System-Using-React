const express = require('express');
const router = express.Router();
const Mark = require('../models/Mark');
const Student = require('../models/Student');
const Batch = require('../models/Batch');

// @route   GET /api/marks/student/:studentId
// @desc    Get all marks for a specific student
// @access  Public
router.get('/student/:studentId', async (req, res) => {
  try {
    const marks = await Mark.find({ student: req.params.studentId })
      .populate('batch', 'batchName batchCode')
      .sort({ examDate: -1 });

    // Calculate statistics
    let totalMarksObtained = 0;
    let totalMaxMarks = 0;

    marks.forEach((mark) => {
      totalMarksObtained += mark.marksObtained;
      totalMaxMarks += mark.totalMarks;
    });

    const overallPercentage =
      totalMaxMarks > 0 ? ((totalMarksObtained / totalMaxMarks) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      count: marks.length,
      data: marks,
      statistics: {
        totalMarksObtained,
        totalMaxMarks,
        overallPercentage,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});

// @route   GET /api/marks/batch/:batchId
// @desc    Get all marks for a specific batch
// @access  Public
router.get('/batch/:batchId', async (req, res) => {
  try {
    const marks = await Mark.find({ batch: req.params.batchId })
      .populate('student', 'firstName lastName enrollmentNumber')
      .sort({ examDate: -1 });

    res.json({
      success: true,
      count: marks.length,
      data: marks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});

// @route   GET /api/marks/statistics/:studentId
// @desc    Get detailed statistics for a student
// @access  Public
router.get('/statistics/:studentId', async (req, res) => {
  try {
    const marks = await Mark.find({ student: req.params.studentId });

    if (marks.length === 0) {
      return res.json({
        success: true,
        message: 'No marks found for this student',
        data: {
          totalExams: 0,
          averagePercentage: 0,
          highestScore: 0,
          lowestScore: 0,
          subjectWisePerformance: [],
        },
      });
    }

    // Calculate statistics
    let totalPercentage = 0;
    let highest = 0;
    let lowest = 100;
    const subjectMap = {};

    marks.forEach((mark) => {
      const percentage = (mark.marksObtained / mark.totalMarks) * 100;
      totalPercentage += percentage;

      if (percentage > highest) highest = percentage;
      if (percentage < lowest) lowest = percentage;

      // Subject-wise performance
      if (!subjectMap[mark.subject]) {
        subjectMap[mark.subject] = {
          subject: mark.subject,
          totalMarksObtained: 0,
          totalMaxMarks: 0,
          examCount: 0,
        };
      }

      subjectMap[mark.subject].totalMarksObtained += mark.marksObtained;
      subjectMap[mark.subject].totalMaxMarks += mark.totalMarks;
      subjectMap[mark.subject].examCount += 1;
    });

    const subjectWisePerformance = Object.values(subjectMap).map((subject) => ({
      ...subject,
      percentage: ((subject.totalMarksObtained / subject.totalMaxMarks) * 100).toFixed(2),
    }));

    res.json({
      success: true,
      data: {
        totalExams: marks.length,
        averagePercentage: (totalPercentage / marks.length).toFixed(2),
        highestScore: highest.toFixed(2),
        lowestScore: lowest.toFixed(2),
        subjectWisePerformance,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});

module.exports = router;
// @desc    Get all marks
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { student, batch, subject, examType } = req.query;
    let query = {};

    if (student) {
      query.student = student;
    }

    if (batch) {
      query.batch = batch;
    }

    if (subject) {
      query.subject = { $regex: subject, $options: 'i' };
    }

    if (examType) {
      query.examType = examType;
    }

    const marks = await Mark.find(query)
      .populate('student', 'firstName lastName enrollmentNumber')
      .populate('batch', 'batchName batchCode')
      .sort({ examDate: -1 });

    res.json({
      success: true,
      count: marks.length,
      data: marks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});

// @route   GET /api/marks/:id
// @desc    Get single mark by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const mark = await Mark.findById(req.params.id)
      .populate('student')
      .populate('batch');

    if (!mark) {
      return res.status(404).json({
        success: false,
        message: 'Mark not found',
      });
    }

    res.json({
      success: true,
      data: mark,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});

// @route   POST /api/marks
// @desc    Create a new mark entry
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      student,
      batch,
      subject,
      marksObtained,
      totalMarks,
      examType,
      examDate,
      remarks,
    } = req.body;

    // Validate marks
    if (marksObtained > totalMarks) {
      return res.status(400).json({
        success: false,
        message: 'Marks obtained cannot be greater than total marks',
      });
    }

    // Check if student exists
    const studentExists = await Student.findById(student);
    if (!studentExists) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Check if batch exists
    const batchExists = await Batch.findById(batch);
    if (!batchExists) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
    }

    // Verify student belongs to the batch
    if (studentExists.batch.toString() !== batch) {
      return res.status(400).json({
        success: false,
        message: 'Student does not belong to this batch',
      });
    }

    const mark = await Mark.create({
      student,
      batch,
      subject,
      marksObtained,
      totalMarks,
      examType,
      examDate,
      remarks,
    });

    const populatedMark = await Mark.findById(mark._id)
      .populate('student', 'firstName lastName enrollmentNumber')
      .populate('batch', 'batchName batchCode');

    res.status(201).json({
      success: true,
      message: 'Mark entry created successfully',
      data: populatedMark,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create mark entry',
      error: error.message,
    });
  }
});

// @route   PUT /api/marks/:id
// @desc    Update a mark entry
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const mark = await Mark.findById(req.params.id);

    if (!mark) {
      return res.status(404).json({
        success: false,
        message: 'Mark not found',
      });
    }

    // Validate marks if being updated
    if (req.body.marksObtained && req.body.totalMarks) {
      if (req.body.marksObtained > req.body.totalMarks) {
        return res.status(400).json({
          success: false,
          message: 'Marks obtained cannot be greater than total marks',
        });
      }
    }

    const updatedMark = await Mark.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate('student', 'firstName lastName enrollmentNumber')
      .populate('batch', 'batchName batchCode');

    res.json({
      success: true,
      message: 'Mark entry updated successfully',
      data: updatedMark,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update mark entry',
      error: error.message,
    });
  }
});

// @route   DELETE /api/marks/:id
// @desc    Delete a mark entry
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const mark = await Mark.findById(req.params.id);

    if (!mark) {
      return res.status(404).json({
        success: false,
        message: 'Mark not found',
      });
    }

    await Mark.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Mark entry deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete mark entry',
      error: error.message,
    });
  }
});

// @