const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Batch = require('../models/Batch');
const Mark = require('../models/Mark');

// @route   GET /api/students
// @desc    Get all students
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { batch, isActive, search } = req.query;
    let query = {};

    if (batch) {
      query.batch = batch;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { enrollmentNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(query)
      .populate('batch', 'batchName batchCode')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});

// @route   GET /api/students/:id
// @desc    Get single student by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('batch');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Get student's marks
    const marks = await Mark.find({ student: req.params.id })
      .populate('batch', 'batchName')
      .sort({ examDate: -1 });

    res.json({
      success: true,
      data: {
        ...student.toObject(),
        marks: marks,
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

// @route   POST /api/students
// @desc    Create a new student
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      batch,
      enrollmentNumber,
      dateOfBirth,
      address,
    } = req.body;

    // Check if email already exists
    const existingStudent = await Student.findOne({ email: email.toLowerCase() });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    // Check if enrollment number exists
    const existingEnrollment = await Student.findOne({ enrollmentNumber });
    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Enrollment number already exists',
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

    const student = await Student.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      batch,
      enrollmentNumber,
      dateOfBirth,
      address,
    });

    // Update batch student count
    await Batch.findByIdAndUpdate(batch, {
      $inc: { totalStudents: 1 },
    });

    const populatedStudent = await Student.findById(student._id).populate('batch');

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: populatedStudent,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create student',
      error: error.message,
    });
  }
});

// @route   PUT /api/students/:id
// @desc    Update a student
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // If batch is being changed, update batch counts
    if (req.body.batch && req.body.batch !== student.batch.toString()) {
      // Decrease count from old batch
      await Batch.findByIdAndUpdate(student.batch, {
        $inc: { totalStudents: -1 },
      });

      // Increase count in new batch
      await Batch.findByIdAndUpdate(req.body.batch, {
        $inc: { totalStudents: 1 },
      });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate('batch');

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update student',
      error: error.message,
    });
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete a student
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Delete all marks associated with student
    await Mark.deleteMany({ student: req.params.id });

    // Decrease batch student count
    await Batch.findByIdAndUpdate(student.batch, {
      $inc: { totalStudents: -1 },
    });

    await Student.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Student deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete student',
      error: error.message,
    });
  }
});

// @route   GET /api/students/batch/:batchId
// @desc    Get all students in a specific batch
// @access  Public
router.get('/batch/:batchId', async (req, res) => {
  try {
    const students = await Student.find({ batch: req.params.batchId })
      .populate('batch')
      .sort({ firstName: 1 });

    res.json({
      success: true,
      count: students.length,
      data: students,
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