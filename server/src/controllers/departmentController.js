const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all active departments with doctor count
// @route   GET /api/departments
// @access  Public
exports.getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find({ isActive: true }).sort({ name: 1 });

  // Attach doctor counts
  const departmentsWithCounts = await Promise.all(
    departments.map(async (dept) => {
      const doctorCount = await Doctor.countDocuments({
        departmentId: dept._id,
        isAvailable: true
      });
      return {
        ...dept.toObject(),
        doctorCount
      };
    })
  );

  return ApiResponse.success(res, departmentsWithCounts);
});

// @desc    Get department by ID
// @route   GET /api/departments/:id
// @access  Public
exports.getDepartmentById = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) {
    return ApiResponse.error(res, 'Department not found', 404);
  }

  const doctors = await Doctor.find({ departmentId: department._id })
    .populate('userId', 'name email phone')
    .sort({ ratingsAverage: -1 });

  return ApiResponse.success(res, {
    department,
    doctors
  });
});

// @desc    Create department (Admin only)
// @route   POST /api/departments
// @access  Private (Admin)
exports.createDepartment = asyncHandler(async (req, res) => {
  const { name, code, description, headOfDepartment, roomLocation, icon } = req.body;

  const department = await Department.create({
    name,
    code,
    description,
    headOfDepartment,
    roomLocation,
    icon: icon || 'Activity'
  });

  return ApiResponse.created(res, department, 'Department created successfully');
});

// @desc    Update department (Admin only)
// @route   PUT /api/departments/:id
// @access  Private (Admin)
exports.updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!department) {
    return ApiResponse.error(res, 'Department not found', 404);
  }

  return ApiResponse.success(res, department, 'Department updated successfully');
});

// @desc    Delete department (Admin only)
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
exports.deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) {
    return ApiResponse.error(res, 'Department not found', 404);
  }

  // Soft delete by setting isActive to false
  department.isActive = false;
  await department.save();

  return ApiResponse.success(res, null, 'Department deactivated successfully');
});
