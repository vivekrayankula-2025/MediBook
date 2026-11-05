const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');

const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { ROLES } = require('../config/constants');

const departmentValidation = [
  body('name').trim().notEmpty().withMessage('Department name is required'),
  body('code').trim().notEmpty().withMessage('Department code is required'),
  body('description').trim().notEmpty().withMessage('Department description is required')
];

router.get('/', getDepartments);
router.get('/:id', getDepartmentById);

// Admin-only management endpoints
router.post(
  '/',
  protect,
  authorize(ROLES.ADMIN),
  validate(departmentValidation),
  createDepartment
);

router.put(
  '/:id',
  protect,
  authorize(ROLES.ADMIN),
  updateDepartment
);

router.delete(
  '/:id',
  protect,
  authorize(ROLES.ADMIN),
  deleteDepartment
);

module.exports = router;
