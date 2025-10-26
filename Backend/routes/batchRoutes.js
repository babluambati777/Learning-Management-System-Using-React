const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');
const Student = require('../models/Student');

// @route   GET /api/batches
// @desc    Get all batches
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { isActive, search } = req.query;
    let query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.$or = [
        { batchName: { $regex: search, $options: 'i' } },
        { batchCode: { $regex: search, $options: 'i' } },
      ];
    }

    const batches = await Batch.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: batches.length,
      data: batches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
});

// @route   GET /api/batches/:id
// @desc    Get single batch by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
    }

    // Get students in this batch
    const students = await Student.find({ batch: req.params.id });

    res.json({
      success: true,
      data: {
        ...batch.toObject(),
        students: students,
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

// @route   POST /api/batches
// @desc    Create a new batch
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { batchName, batchCode, startDate, endDate, description } = req.body;

    // Check if batch code already exists
    const existingBatch = await Batch.findOne({ batchCode: batchCode.toUpperCase() });
    if (existingBatch) {
      return res.status(400).json({
        success: false,
        message: 'Batch code already exists',
      });
    }

    const batch = await Batch.create({
      batchName,
      batchCode: batchCode.toUpperCase(),
      startDate,
      endDate,
      description,
    });

    res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      data: batch,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create batch',
      error: error.message,
    });
  }
});

// @route   PUT /api/batches/:id
// @desc    Update a batch
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
    }

    const updatedBatch = await Batch.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      message: 'Batch updated successfully',
      data: updatedBatch,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update batch',
      error: error.message,
    });
  }
});

// @route   DELETE /api/batches/:id
// @desc    Delete a batch
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
    }

    // Check if batch has students
    const studentCount = await Student.countDocuments({ batch: req.params.id });
    if (studentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete batch. It has ${studentCount} student(s) enrolled.`,
      });
    }

    await Batch.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Batch deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete batch',
      error: error.message,
    });
  }
});

// @route   PATCH /api/batches/:id/toggle-status
// @desc    Toggle batch active status
// @access  Public
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
    }

    batch.isActive = !batch.isActive;
    await batch.save();

    res.json({
      success: true,
      message: `Batch ${batch.isActive ? 'activated' : 'deactivated'} successfully`,
      data: batch,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update batch status',
      error: error.message,
    });
  }
});

module.exports = router;